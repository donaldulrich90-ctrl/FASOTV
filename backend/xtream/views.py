import logging
import requests as http_requests
from urllib.parse import urlparse
from django.conf import settings
from django.core.cache import cache
from django.http import HttpResponse
from django.utils.text import slugify
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication

from accounts.helpers import adult_allowed
from .client import XtreamClient
from .utils import is_high_bitrate, is_radio

logger = logging.getLogger(__name__)


def _iter_servers():
    """Yield (url, username, password, user_agent) for all active servers in priority order.
    Falls back to Django settings if no DB servers are configured."""
    from .models import XtreamServer
    servers = list(XtreamServer.objects.filter(is_active=True).order_by("priority", "name", "id"))
    if servers:
        for s in servers:
            yield s.url.rstrip("/"), s.username, s.password, s.user_agent
    else:
        yield (
            settings.XTREAM_SERVER_URL.rstrip("/"),
            settings.XTREAM_USERNAME,
            settings.XTREAM_PASSWORD,
            "krxplayer",
        )


def _get_client(request_data: dict = None) -> XtreamClient:
    if request_data:
        url = request_data.get("server_url") or settings.XTREAM_SERVER_URL
        user = request_data.get("username") or settings.XTREAM_USERNAME
        pwd = request_data.get("password") or settings.XTREAM_PASSWORD
    else:
        url, user, pwd, _ = next(_iter_servers())
    return XtreamClient(url, user, pwd)




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
                channel_name = stream.get("name", "")
                Channel.objects.update_or_create(
                    xtream_id=stream.get("stream_id"),
                    defaults={
                        "name": channel_name,
                        "logo_url": stream.get("stream_icon", ""),
                        "stream_url": client.get_stream_url(stream["stream_id"], "live"),
                        "category": cat,
                        "is_active": True,
                        "is_high_bitrate": is_high_bitrate(channel_name),
                        "is_radio": is_radio(channel_name, group),
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


class XtreamSeriesEpisodesView(APIView):
    """Returns series info + episodes from Xtream, cached 6 h in Redis."""
    permission_classes = (IsAuthenticated,)

    def get(self, request, series_id):
        cache_key = f"xtream_series_ep_{series_id}"
        data = cache.get(cache_key)
        if data is None:
            try:
                data = _get_client().get_series_info(series_id)
                cache.set(cache_key, data, 6 * 3600)
            except Exception as exc:
                return Response({"detail": str(exc)}, status=400)
        return Response(data)


# ── Unauthenticated proxy view (m3u8 only — segments go directly via nginx) ──

class XtreamStreamProxyView(APIView):
    """Fetches the m3u8 playlist, follows redirects to get the real IP-direct
    URL, then rewrites every segment line to /seg/<host><path> so that nginx
    proxies the binary segments — Django never touches the .ts data."""
    permission_classes = []
    authentication_classes = [JWTAuthentication, SessionAuthentication]

    def get(self, request, stream_id):
        from channels.models import Channel as ChannelModel
        if ChannelModel.objects.filter(xtream_id=stream_id, is_adult=True).exists():
            if not adult_allowed(request):
                return HttpResponse("Forbidden", status=403)

        last_exc = None
        for server_url, username, password, user_agent in _iter_servers():
            url = f"{server_url}/live/{username}/{password}/{stream_id}.m3u8"
            try:
                resp = http_requests.get(
                    url,
                    headers={"User-Agent": user_agent},
                    timeout=15,
                    allow_redirects=True,
                )
                if resp.status_code == 404:
                    return HttpResponse("Stream not found", status=404)
                if not resp.ok:
                    last_exc = Exception(f"HTTP {resp.status_code} from {server_url}")
                    continue

                final = urlparse(resp.url)
                origin_host = final.netloc
                base_path = final.path.rsplit("/", 1)[0]

                out = []
                for line in resp.text.split("\n"):
                    s = line.strip()
                    if s and not s.startswith("#"):
                        if s.startswith("http"):
                            p = urlparse(s)
                            q = f"?{p.query}" if p.query else ""
                            out.append(f"/seg/{p.netloc}{p.path}{q}")
                        elif s.startswith("/"):
                            out.append(f"/seg/{origin_host}{s}")
                        else:
                            out.append(f"/seg/{origin_host}{base_path}/{s}")
                    else:
                        out.append(line)

                r = HttpResponse(
                    "\n".join(out), content_type="application/vnd.apple.mpegurl"
                )
                r["Access-Control-Allow-Origin"] = "*"
                r["Cache-Control"] = "no-cache"
                return r
            except Exception as exc:
                logger.warning("Proxy m3u8 error stream=%s server=%s: %s", stream_id, server_url, exc)
                last_exc = exc
                continue

        logger.error("All servers failed for stream=%s: %s", stream_id, last_exc)
        return HttpResponse(str(last_exc) if last_exc else "No server available", status=502)
