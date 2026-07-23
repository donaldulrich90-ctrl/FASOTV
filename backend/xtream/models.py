from django.db import models

_DEFAULT_CAT_PATTERN = r"^([A-Z]{2,6})\s*[|\-]\s*(.+)$"


class XtreamServer(models.Model):
    name = models.CharField(max_length=100, default="Serveur Principal")
    url = models.URLField()
    username = models.CharField(max_length=200)
    password = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    priority = models.PositiveSmallIntegerField(
        default=10,
        help_text="Priorité de basculement (plus bas = essayé en premier)",
    )
    user_agent = models.CharField(
        max_length=200,
        default="krxplayer",
        help_text="User-Agent envoyé au panel Xtream",
    )
    cat_pattern = models.CharField(
        max_length=100,
        blank=True,
        default=_DEFAULT_CAT_PATTERN,
        help_text="Regex de parsing des noms de catégorie (groupe 1 = préfixe, groupe 2 = label). Laisser vide pour désactiver.",
    )
    last_sync = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["priority", "name", "id"]
        verbose_name = "Serveur Xtream"
        verbose_name_plural = "Serveurs Xtream"

    def __str__(self):
        return f"{self.name} ({self.url})"
