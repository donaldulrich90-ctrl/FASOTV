from django.contrib import admin
from .models import Category, Channel, EPG


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "icon", "order")
    list_editable = ("order",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Channel)
class ChannelAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "is_active", "is_featured", "order", "viewers_count")
    list_filter = ("category", "is_active", "is_featured")
    list_editable = ("is_active", "is_featured", "order")
    search_fields = ("name",)


@admin.register(EPG)
class EPGAdmin(admin.ModelAdmin):
    list_display = ("channel", "title", "start_time", "end_time")
    list_filter = ("channel",)
    search_fields = ("title", "channel__name")
