from django.contrib import admin
from .models import XtreamServer


@admin.register(XtreamServer)
class XtreamServerAdmin(admin.ModelAdmin):
    list_display = ("name", "url", "is_active", "last_sync")
    list_editable = ("is_active",)
