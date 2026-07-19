from rest_framework import serializers
from .models import Movie, Series, Season, Episode, Favorite, WatchHistory


class EpisodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Episode
        fields = ("id", "number", "title", "stream_url", "duration")


class SeasonSerializer(serializers.ModelSerializer):
    episodes = EpisodeSerializer(many=True, read_only=True)

    class Meta:
        model = Season
        fields = ("id", "number", "title", "episodes")


class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = (
            "id", "title", "description", "poster_url", "stream_url",
            "genre", "year", "rating", "duration", "is_featured",
        )


class MovieListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ("id", "title", "poster_url", "genre", "year", "rating", "duration", "is_featured")


class SeriesSerializer(serializers.ModelSerializer):
    seasons = SeasonSerializer(many=True, read_only=True)

    class Meta:
        model = Series
        fields = (
            "id", "title", "description", "poster_url",
            "genre", "rating", "total_seasons", "is_featured", "seasons",
        )


class SeriesListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Series
        fields = ("id", "title", "poster_url", "genre", "rating", "total_seasons", "is_featured")


class FavoriteSerializer(serializers.ModelSerializer):
    content_type_name = serializers.CharField(source="content_type.model", read_only=True)
    object_repr = serializers.SerializerMethodField()

    class Meta:
        model = Favorite
        fields = ("id", "content_type", "content_type_name", "object_id", "object_repr", "created_at")

    def get_object_repr(self, obj):
        item = obj.content_object
        if item is None:
            return None
        return {
            "id": item.id,
            "title": getattr(item, "title", None) or getattr(item, "name", None),
            "poster_url": getattr(item, "poster_url", None) or getattr(item, "logo_url", None),
        }


class ToggleFavoriteSerializer(serializers.Serializer):
    content_type = serializers.ChoiceField(choices=["movie", "series", "channel"])
    object_id = serializers.IntegerField()


class WatchHistorySerializer(serializers.ModelSerializer):
    content_type_name = serializers.CharField(source="content_type.model", read_only=True)

    class Meta:
        model = WatchHistory
        fields = ("id", "content_type", "content_type_name", "object_id", "progress_seconds", "updated_at")
