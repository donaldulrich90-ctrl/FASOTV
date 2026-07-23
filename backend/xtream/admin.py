from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, reverse
from django.utils.html import format_html, escape

from .models import XtreamServer


@admin.register(XtreamServer)
class XtreamServerAdmin(admin.ModelAdmin):
    list_display = ("name", "url", "priority", "is_active", "last_sync", "test_link")
    list_editable = ("is_active", "priority")
    fields = ("name", "url", "username", "password", "is_active", "priority", "user_agent", "cat_pattern")

    def test_link(self, obj):
        opts = self.model._meta
        url = reverse(f"admin:{opts.app_label}_{opts.model_name}_test", args=[obj.pk])
        return format_html('<a href="{}">Tester la connexion</a>', url)
    test_link.short_description = "Test"

    def get_urls(self):
        opts = self.model._meta
        custom = [
            path(
                "<int:pk>/test/",
                self.admin_site.admin_view(self._test_view),
                name=f"{opts.app_label}_{opts.model_name}_test",
            )
        ]
        return custom + super().get_urls()

    def _test_view(self, request, pk):
        from .client import XtreamClient
        from .taxonomy import parse_category

        try:
            server = XtreamServer.objects.get(pk=pk)
        except XtreamServer.DoesNotExist:
            return HttpResponse("Serveur introuvable", status=404)

        back = f'<p><a href="../">← Retour</a></p>'
        try:
            client = XtreamClient(
                server.url, server.username, server.password, user_agent=server.user_agent
            )
            cats = client.get_live_categories()
            examples_html = ""
            for cat in cats[:3]:
                raw = cat.get("category_name", "")
                parsed = parse_category(raw, server.cat_pattern)
                examples_html += (
                    f"<li><code>{escape(raw)}</code> → "
                    f"prefix=<strong>{escape(str(parsed['prefix']))}</strong>, "
                    f"label=<strong>{escape(parsed['label'])}</strong></li>"
                )
            html = (
                f"<h2>Connexion OK — {escape(server.name)}</h2>"
                f"<p>Catégories live : <strong>{len(cats)}</strong></p>"
                f"<h3>Exemples de parsing (cat_pattern)</h3>"
                f"<ul>{examples_html or '<li>(aucune catégorie)</li>'}</ul>"
                f"{back}"
            )
        except Exception as exc:
            html = (
                f"<h2>Erreur — {escape(server.name)}</h2>"
                f"<p style='color:red'>{escape(str(exc))}</p>"
                f"{back}"
            )

        return HttpResponse(html)
