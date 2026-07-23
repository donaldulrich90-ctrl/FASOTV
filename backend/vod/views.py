from django.contrib.contenttypes.models import ContentType
from rest_framework import generics, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from accounts.helpers import adult_allowed
from .models import Movie, Series, Favorite, WatchHistory
from .serializers import (
    MovieSerializer, MovieListSerializer,
    SeriesSerializer, SeriesListSerializer,
    FavoriteSerializer, ToggleFavoriteSerializer,
    WatchHistorySerializer,
)

CONTENT_TYPE_MAP = {
    "movie": Movie,
    "series": Series,
}

try:
    from channels.models import Channel
    CONTENT_TYPE_MAP["channel"] = Channel
except ImportError:
    pass


class MovieListView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = MovieListSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ("genre", "is_featured")
    search_fields = ("title", "description", "genre")
    ordering_fields = ("rating", "year", "title", "created_at")

    def get_queryset(self):
        qs = Movie.objects.filter(is_active=True)
        if not adult_allowed(self.request):
            qs = qs.filter(is_adult=False)
        return qs


class MovieDetailView(generics.RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = MovieSerializer

    def get_queryset(self):
        qs = Movie.objects.filter(is_active=True)
        if not adult_allowed(self.request):
            qs = qs.filter(is_adult=False)
        return qs


class SeriesListView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = SeriesListSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ("genre", "is_featured")
    search_fields = ("title", "description", "genre")
    ordering_fields = ("rating", "title", "created_at")

    def get_queryset(self):
        qs = Series.objects.filter(is_active=True)
        if not adult_allowed(self.request):
            qs = qs.filter(is_adult=False)
        return qs


class SeriesDetailView(generics.RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = SeriesSerializer

    def get_queryset(self):
        qs = Series.objects.prefetch_related("seasons__episodes").filter(is_active=True)
        if not adult_allowed(self.request):
            qs = qs.filter(is_adult=False)
        return qs


class FavoriteListView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = FavoriteSerializer

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related("content_type")


class ToggleFavoriteView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = ToggleFavoriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        model_cls = CONTENT_TYPE_MAP.get(serializer.validated_data["content_type"])
        if not model_cls:
            return Response({"detail": "Type de contenu invalide."}, status=400)

        ct = ContentType.objects.get_for_model(model_cls)
        obj_id = serializer.validated_data["object_id"]

        fav, created = Favorite.objects.get_or_create(
            user=request.user, content_type=ct, object_id=obj_id
        )
        if not created:
            fav.delete()
            return Response({"favorited": False})
        return Response({"favorited": True})


class WatchHistoryView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = WatchHistorySerializer

    def get_queryset(self):
        return WatchHistory.objects.filter(user=self.request.user).select_related("content_type")


class UpdateWatchProgressView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        content_type_name = request.data.get("content_type")
        object_id = request.data.get("object_id")
        progress = request.data.get("progress_seconds", 0)

        model_cls = CONTENT_TYPE_MAP.get(content_type_name)
        if not model_cls:
            return Response({"detail": "Type invalide."}, status=400)

        ct = ContentType.objects.get_for_model(model_cls)
        WatchHistory.objects.update_or_create(
            user=request.user, content_type=ct, object_id=object_id,
            defaults={"progress_seconds": progress},
        )
        return Response({"detail": "Progression sauvegardée."})


class GlobalSearchView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        if len(q) < 2:
            return Response({"channels": [], "movies": [], "series": []})

        from channels.models import Channel
        from channels.serializers import ChannelListSerializer

        show_adult = adult_allowed(request)

        channels_qs = Channel.objects.filter(is_active=True, name__icontains=q)
        movies_qs = Movie.objects.filter(is_active=True, title__icontains=q)
        series_qs = Series.objects.filter(is_active=True, title__icontains=q)

        if not show_adult:
            channels_qs = channels_qs.filter(is_adult=False)
            movies_qs = movies_qs.filter(is_adult=False)
            series_qs = series_qs.filter(is_adult=False)

        return Response({
            "channels": ChannelListSerializer(channels_qs[:5], many=True).data,
            "movies": MovieListSerializer(movies_qs[:5], many=True).data,
            "series": SeriesListSerializer(series_qs[:5], many=True).data,
        })
