from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.conf import settings


class Movie(models.Model):
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    poster_url = models.URLField(blank=True)
    stream_url = models.TextField()
    genre = models.CharField(max_length=100, blank=True)
    year = models.PositiveSmallIntegerField(null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    duration = models.PositiveIntegerField(null=True, blank=True, help_text="Durée en minutes")
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_adult = models.BooleanField(default=False, db_index=True, help_text="Contenu adulte — masqué sans PIN")
    xtream_id = models.PositiveIntegerField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Film"
        verbose_name_plural = "Films"

    def __str__(self):
        return self.title


class Series(models.Model):
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    poster_url = models.URLField(blank=True)
    genre = models.CharField(max_length=100, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    total_seasons = models.PositiveSmallIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_adult = models.BooleanField(default=False, db_index=True, help_text="Contenu adulte — masqué sans PIN")
    xtream_id = models.PositiveIntegerField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Série"
        verbose_name_plural = "Séries"

    def __str__(self):
        return self.title


class Season(models.Model):
    series = models.ForeignKey(Series, on_delete=models.CASCADE, related_name="seasons")
    number = models.PositiveSmallIntegerField()
    title = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["number"]
        unique_together = ("series", "number")
        verbose_name = "Saison"

    def __str__(self):
        return f"{self.series.title} – Saison {self.number}"


class Episode(models.Model):
    season = models.ForeignKey(Season, on_delete=models.CASCADE, related_name="episodes")
    number = models.PositiveSmallIntegerField()
    title = models.CharField(max_length=300)
    stream_url = models.TextField()
    duration = models.PositiveIntegerField(null=True, blank=True, help_text="Durée en minutes")
    xtream_id = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["number"]
        unique_together = ("season", "number")
        verbose_name = "Épisode"

    def __str__(self):
        return f"{self.season} – Ep.{self.number}: {self.title}"


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites"
    )
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "content_type", "object_id")
        ordering = ["-created_at"]
        verbose_name = "Favori"

    def __str__(self):
        return f"{self.user} – {self.content_object}"


class WatchHistory(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="watch_history"
    )
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")
    progress_seconds = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "content_type", "object_id")
        ordering = ["-updated_at"]
        verbose_name = "Historique"
