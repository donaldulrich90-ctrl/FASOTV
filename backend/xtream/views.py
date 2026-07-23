import logging
import requests as http_requests
from django.conf import settings
from django.http import StreamingHttpResponse, HttpResponse
from django.utils.text import slugify
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from .client import XtreamClient, XTREAM_HEADERS

logger = logging.getLogger(__name__)


def _get_client(request_data: dict = None) -> XtreamClient:
    if request_data:
        url = request_data.get("server_url") or settings.XTREAM_SERVER_URL
        user = request_data.get("username") or settings.XTREAM_USERNAME
        pwd = request_data.get("password") or settings.XTREAM_PASSWORD
    else:
        url, user, pwd = settings.XTREAM_SERVER_URL, settings.XTREAM_USERNAME, settings.XTREAM_PASSWORD
    return XtreamClient(url, user, pwd)


def _get_server():
    """Active XtreamServer from DB, falls back to Django settings."""
    from .models import XtreamServer
    server = XtreamServer.objects.filter(is_active=True).first()
    if server:
        return server.url.rstrip("/"), server.username, server.password
    return (
        settings.XTREAM_SERVER_URL.rstrip("/"),
        settings.XTREAM_USERNAME,
        settings.XTREAM_PASSWORD,
    )


def _rewrite_m3u8(content: str, server_url: str, username: str, password: str) -> str:
    """Replace Xtream stream URLs in a playlist with our proxy URLs."""
    base = f"{server_url}/live/{username}/{password}/"
    lines = []
    for line in content.splitlines():
        stripped = line.strip()
        if stripped and not stripped.startswith("#"):
            if stripped.startswith(base):
                # Absolute URL that starts with our base — extract tail
                tail = stripped[len(base):]
                lines.append(f"/api/xtream/proxy-segment/{tail}")
            elif stripped.startswith("http"):
                # Absolute URL from a different host
                lines.append(f"/api/xtream/proxy-url/?url={stripped}")
            elif stripped.startswith("/api/"):
                # Already rewritten
                lines.append(stripped)
            else:
                # Relative segment or sub-playlist
                lines.append(f"/api/xtream/proxy-segment/{stripped}")
        else:
            lines.append(line)
    return "\n".join(lines)


# ── Authenticated API views ──────────────────────────────────────────────────

class XtreamInfoView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            client = _get_client(request.data)
            info = client.get_account_info()
            return Response(info)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=400)


class XtreamLiveCategoriesView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        try:
            return Response(_get_client().get_live_categories())
        except Exception as exc:
            return Response({"detail": str(exc)}, status=400)


class XtreamLiveStreamsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        category_id = request.query_params.get("category_id")
        try:
            streams = _get_client().get_live_streams(int(category_id) if category_id else None)
            return Response(streams)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=400)


class XtreamVODView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        category_id = request.query_params.get("category_id")
        try:
            return Response(_get_client().get_vod_streams(int(category_id) if category_id else None))
        except Exception as exc:
            return Response({"detail": str(exc)}, status=400)


class XtreamSeriesView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        category_id = request.query_params.get("category_id")
        try:
            return Response(_get_client().get_series(int(category_id) if category_id else None))
        except Exception as exc:
            return Response({"detail": str(exc)}, status=400)


class XtreamEPGView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, stream_id):
        try:
            return Response(_get_client().get_epg(stream_id))
        except Exception as exc:
            return Response({"detail": str(exc)}, status=400)


class XtreamSyncView(APIView):
    permission_classes = (IsAdminUser,)

    def post(self, request):
        try:
            client = _get_client(request.data)
            synced = {"live": 0, "vod": 0, "series": 0}

            from channels.models import Channel, Category
            for stream in client.get_live_streams():
                group = stream.get("category_name") or "Général"
                slug = slugify(group)[:50] or "general"
                cat, _ = Category.objects.get_or_create(slug=slug, defaults={"name": group})
                Channel.objects.update_or_create(
                    xtream_id=stream.get("stream_id"),
                    defaults={
                        "name": stream.get("name", ""),
                        "logo_url": stream.get("stream_icon", ""),
                        "stream_url": client.get_stream_url(stream["stream_id"], "live"),
                        "category": cat,
                        "is_active": True,
                    },
                )
                synced["live"] += 1

            from vod.models import Movie
            for vod in client.get_vod_streams():
                Movie.objects.update_or_create(
                    xtream_id=vod.get("stream_id"),
                    defaults={
                        "title": vod.get("name", ""),
                        "poster_url": vod.get("stream_icon", ""),
                        "stream_url": client.get_stream_url(vod["stream_id"], "movie"),
                        "genre": vod.get("category_name", ""),
                        "rating": None,
                        "is_active": True,
                    },
                )
                synced["vod"] += 1

            return Response({"synced": synced})
        except Exception as exc:
            logger.exception("Erreur sync Xtream: %s", exc)
            return Response({"detail": str(exc)}, status=500)


# ── Unauthenticated proxy views (called by HLS.js / Smart TV) ────────────────

class XtreamStreamProxyView(APIView):
    """Fetches and rewrites the m3u8 playlist for a live stream."""
    permission_classes = []

    def get(self, request, stream_id):
        server_url, username, password = _get_server()
        if not server_url:
            return HttpResponse("No Xtream server configured", status=404)

        url = f"{server_url}/live/{username}/{password}/{stream_id}.m3u8"
        try:
            resp = http_requests.get(url, headers=XTREAM_HEADERS, timeout=30)
            resp.raise_for_status()
            content = _rewrite_m3u8(resp.text, server_url, username, password)
            response = HttpResponse(content, content_type="application/vnd.apple.mpegurl")
            response["Cache-Control"] = "no-cache"
            response["Access-Control-Allow-Origin"] = "*"
            return response
        except Exception as exc:
            logger.warning("Proxy m3u8 error stream=%s: %s", stream_id, exc)
            return HttpResponse(str(exc), status=502)


class XtreamSegmentProxyView(APIView):
    """Streams .ts segments and sub-playlists through the proxy."""
    permission_classes = []

    def get(self, request, path):
        server_url, username, password = _get_server()
        if not server_url:
            return HttpResponse("No Xtream server configured", status=404)

        url = f"{server_url}/live/{username}/{password}/{path}"
        try:
            resp = http_requests.get(url, headers=XTREAM_HEADERS, stream=True, timeout=30)
            resp.raise_for_status()
            content_type = resp.headers.get("Content-Type", "video/mp2t")

            if "mpegurl" in content_type or path.endswith(".m3u8"):
                content = _rewrite_m3u8(resp.text, server_url, username, password)
                response = HttpResponse(content, content_type="application/vnd.apple.mpegurl")
                response["Cache-Control"] = "no-cache"
                response["Access-Control-Allow-Origin"] = "*"
                return response

            def _stream():
                for chunk in resp.iter_content(chunk_size=65536):
                    yield chunk

            response = StreamingHttpResponse(_stream(), content_type=content_type)
            response["Access-Control-Allow-Origin"] = "*"
            return response
        except Exception as exc:
            logger.warning("Proxy segment error path=%s: %s", path, exc)
            return HttpResponse(str(exc), status=502)


class XtreamURLProxyView(APIView):
    """Generic proxy for absolute segment URLs (CDN redirects, etc.)."""
    permission_classes = []

    def get(self, request):
        url = request.GET.get("url", "").strip()
        if not url or not url.startswith("http"):
            return HttpResponse("Missing or invalid url", status=400)

        try:
            resp = http_requests.get(url, headers=XTREAM_HEADERS, stream=True, timeout=30)
            resp.raise_for_status()
            content_type = resp.headers.get("Content-Type", "video/mp2t")

            if "mpegurl" in content_type or url.endswith(".m3u8"):
                response = HttpResponse(resp.text, content_type="application/vnd.apple.mpegurl")
                response["Cache-Control"] = "no-cache"
            else:
                def _stream():
                    for chunk in resp.iter_content(chunk_size=65536):
                        yield chunk
                response = StreamingHttpResponse(_stream(), content_type=content_type)

            response["Access-Control-Allow-Origin"] = "*"
            return response
        except Exception as exc:
            logger.warning("Proxy URL error url=%s: %s", url, exc)
            return HttpResponse(str(exc), status=502)
