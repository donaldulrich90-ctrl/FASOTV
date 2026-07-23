from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True, help_text="Nom d'icône (ex: tv, sports, news)")
    order = models.PositiveSmallIntegerField(default=0)
    slug = models.SlugField(unique=True)
    is_adult = models.BooleanField(default=False, db_index=True)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"

    def __str__(self):
        return self.name


class Channel(models.Model):
    name = models.CharField(max_length=200)
    logo_url = models.URLField(blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="channels"
    )
    stream_url = models.TextField(help_text="URL HLS/M3U8 du flux")
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    xtream_id = models.PositiveIntegerField(null=True, blank=True, db_index=True)
    viewers_count = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_high_bitrate = models.BooleanField(default=False, db_index=True, help_text="Flux >15 Mbit/s (4K/8K/RAW) — masqué aux utilisateurs jusqu'au transcodage")
    is_radio = models.BooleanField(default=False, db_index=True, help_text="Station radio (audio uniquement)")
    is_adult = models.BooleanField(default=False, db_index=True, help_text="Contenu adulte — masqué sans PIN")
    language = models.CharField(max_length=50, blank=True)
    country = models.CharField(max_length=50, blank=True, default="BF")

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "Chaîne"
        verbose_name_plural = "Chaînes"

    def __str__(self):
        return self.name


class EPG(models.Model):
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE, related_name="epg_entries")
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    class Meta:
        ordering = ["start_time"]
        verbose_name = "Programme EPG"
        verbose_name_plural = "Programmes EPG"
        indexes = [models.Index(fields=["channel", "start_time"])]

    def __str__(self):
        return f"{self.channel.name}: {self.title} ({self.start_time})"
