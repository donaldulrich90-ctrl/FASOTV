from django.contrib import admin
from .models import Movie, Series, Season, Episode, Favorite, WatchHistory


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ("title", "genre", "year", "rating", "is_featured", "is_active")
    list_filter = ("genre", "is_featured", "is_active")
    list_editable = ("is_featured", "is_active")
    search_fields = ("title",)


@admin.register(Series)
class SeriesAdmin(admin.ModelAdmin):
    list_display = ("title", "genre", "rating", "total_seasons", "is_featured", "is_active")
    list_filter = ("genre", "is_featured", "is_active")
    list_editable = ("is_featured", "is_active")
    search_fields = ("title",)


@admin.register(Season)
class SeasonAdmin(admin.ModelAdmin):
    list_display = ("series", "number", "title")
    list_filter = ("series",)


@admin.register(Episode)
class EpisodeAdmin(admin.ModelAdmin):
    list_display = ("season", "number", "title", "duration")
    list_filter = ("season__series",)
    search_fields = ("title",)


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "content_type", "object_id", "created_at")
    raw_id_fields = ("user",)
