from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .taxonomy import get_lang_label, slug_to_label


class LanguagesView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        content_type = request.query_params.get("type", "vod")
        ui_lang = request.query_params.get("ui_lang", "fr")

        if content_type == "live":
            from channels.models import Channel
            base_qs = Channel.objects.filter(is_active=True)
        elif content_type == "series":
            from vod.models import Series
            base_qs = Series.objects.filter(is_active=True)
        else:
            from vod.models import Movie
            base_qs = Movie.objects.filter(is_active=True)

        rows = (
            base_qs.exclude(lang_code="")
            .values("lang_code")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        return Response([
            {
                "code": row["lang_code"],
                "label": get_lang_label(row["lang_code"], ui_lang),
                "count": row["count"],
            }
            for row in rows
        ])


class GenresView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        content_type = request.query_params.get("type", "vod")
        lang = request.query_params.get("lang", "").upper()

        if content_type == "live":
            from channels.models import Channel
            base_qs = Channel.objects.filter(is_active=True)
        elif content_type == "series":
            from vod.models import Series
            base_qs = Series.objects.filter(is_active=True)
        else:
            from vod.models import Movie
            base_qs = Movie.objects.filter(is_active=True)

        qs = base_qs.exclude(genre_slug="")
        if lang:
            qs = qs.filter(lang_code=lang)

        rows = (
            qs.values("genre_slug")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        return Response([
            {
                "slug": row["genre_slug"],
                "label": slug_to_label(row["genre_slug"]),
                "count": row["count"],
            }
            for row in rows
        ])
