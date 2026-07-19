import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils.text import slugify

from .parser import parse_m3u_from_url, parse_m3u_from_file

logger = logging.getLogger(__name__)


def _import_entries(entries):
    from channels.models import Channel, Category

    imported = 0
    for entry in entries:
        if not entry.url or not entry.name:
            continue

        group_name = entry.group or "Général"
        slug = slugify(group_name)[:50] or "general"
        category, _ = Category.objects.get_or_create(
            slug=slug, defaults={"name": group_name}
        )

        Channel.objects.update_or_create(
            name=entry.name,
            defaults={
                "stream_url": entry.url,
                "logo_url": entry.logo or "",
                "category": category,
                "language": entry.language or "",
                "is_active": True,
            },
        )
        imported += 1
    return imported


class ImportFromURLView(APIView):
    permission_classes = (IsAdminUser,)

    def post(self, request):
        url = request.data.get("url")
        if not url:
            return Response({"detail": "URL requise."}, status=400)
        try:
            entries = parse_m3u_from_url(url)
            imported = _import_entries(entries)
            return Response({"parsed": len(entries), "imported": imported})
        except Exception as exc:
            logger.exception("Erreur import M3U depuis URL: %s", exc)
            return Response({"detail": str(exc)}, status=500)


class ImportFromFileView(APIView):
    permission_classes = (IsAdminUser,)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response({"detail": "Fichier requis."}, status=400)
        try:
            entries = parse_m3u_from_file(file_obj)
            imported = _import_entries(entries)
            return Response({"parsed": len(entries), "imported": imported})
        except Exception as exc:
            logger.exception("Erreur import M3U depuis fichier: %s", exc)
            return Response({"detail": str(exc)}, status=500)


class ParsePreviewView(APIView):
    """Prévisualise les entrées d'un fichier M3U sans les importer."""
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        url = request.data.get("url")
        if url:
            entries = parse_m3u_from_url(url)
        elif "file" in request.FILES:
            entries = parse_m3u_from_file(request.FILES["file"])
        else:
            return Response({"detail": "URL ou fichier requis."}, status=400)

        return Response({
            "count": len(entries),
            "preview": [
                {"name": e.name, "group": e.group, "logo": e.logo, "url": e.url[:80]}
                for e in entries[:20]
            ],
        })
