from django.apps import AppConfig


class ResellersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "resellers"
    verbose_name = "Revendeurs"

    def ready(self):
        import resellers.signals  # noqa: F401
