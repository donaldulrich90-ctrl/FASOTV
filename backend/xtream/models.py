from django.db import models


class XtreamServer(models.Model):
    name = models.CharField(max_length=100, default="Serveur Principal")
    url = models.URLField()
    username = models.CharField(max_length=200)
    password = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    last_sync = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Serveur Xtream"
        verbose_name_plural = "Serveurs Xtream"

    def __str__(self):
        return f"{self.name} ({self.url})"
