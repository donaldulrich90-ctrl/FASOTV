from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("phone", "name", "email", "plan_actif", "date_expiration", "is_staff")
    list_filter = ("is_staff", "is_active")
    search_fields = ("phone", "name", "email")
    ordering = ("-date_joined",)
    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        ("Informations", {"fields": ("name", "email", "avatar")}),
        ("Abonnement", {"fields": ("plan_actif", "date_expiration")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("phone", "name", "password1", "password2")}),
    )
