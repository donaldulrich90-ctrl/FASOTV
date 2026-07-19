import csv

from django.contrib import admin
from django.http import HttpResponse
from django.utils import timezone

from .models import Commission, Reseller, ResellerClient, Withdrawal


def export_commissions_csv(modeladmin, request, queryset):
    response = HttpResponse(content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = 'attachment; filename="commissions.csv"'
    response.write("﻿")  # UTF-8 BOM for Excel
    writer = csv.writer(response)
    writer.writerow(["Date", "Revendeur", "Client", "Forfait", "Montant (FCFA)", "Taux (%)", "Statut"])
    for c in queryset.select_related("reseller__user", "client", "subscription__plan"):
        writer.writerow([
            c.created_at.strftime("%Y-%m-%d %H:%M"),
            c.reseller.user.phone,
            c.client.phone,
            c.subscription.plan.name if c.subscription else "",
            c.amount,
            c.rate_applied,
            c.get_status_display(),
        ])
    return response


export_commissions_csv.short_description = "Exporter en CSV"


def export_withdrawals_csv(modeladmin, request, queryset):
    response = HttpResponse(content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = 'attachment; filename="retraits.csv"'
    response.write("﻿")
    writer = csv.writer(response)
    writer.writerow(["Date demande", "Revendeur", "Montant (FCFA)", "Méthode", "Téléphone", "Statut", "Référence"])
    for w in queryset.select_related("reseller__user"):
        writer.writerow([
            w.requested_at.strftime("%Y-%m-%d %H:%M"),
            w.reseller.user.phone,
            w.amount,
            w.get_method_display(),
            w.phone,
            w.get_status_display(),
            w.reference,
        ])
    return response


export_withdrawals_csv.short_description = "Exporter en CSV"


def mark_withdrawal_completed(modeladmin, request, queryset):
    queryset.filter(status__in=["pending", "processing"]).update(
        status="completed", processed_at=timezone.now()
    )


mark_withdrawal_completed.short_description = "Marquer comme payé"


def mark_withdrawal_rejected(modeladmin, request, queryset):
    for w in queryset.filter(status__in=["pending", "processing"]):
        w.status = "rejected"
        w.processed_at = timezone.now()
        w.save()  # triggers signal to refund balance


mark_withdrawal_rejected.short_description = "Rejeter (rembourse le solde)"


@admin.register(Reseller)
class ResellerAdmin(admin.ModelAdmin):
    list_display = (
        "user", "code_parrainage", "niveau", "commission_rate",
        "active_clients_count", "total_earnings", "available_balance", "is_active",
    )
    list_filter = ("niveau", "is_active", "created_at")
    search_fields = ("user__phone", "user__name", "code_parrainage")
    readonly_fields = ("code_parrainage", "total_earnings", "available_balance", "created_at", "updated_at")
    ordering = ("-created_at",)

    def active_clients_count(self, obj):
        return obj.clients.filter(is_active=True).count()
    active_clients_count.short_description = "Clients actifs"


@admin.register(ResellerClient)
class ResellerClientAdmin(admin.ModelAdmin):
    list_display = ("reseller", "client", "joined_at", "is_active", "source")
    list_filter = ("is_active", "source", "joined_at")
    search_fields = ("reseller__user__phone", "client__phone", "client__name")
    ordering = ("-joined_at",)


@admin.register(Commission)
class CommissionAdmin(admin.ModelAdmin):
    list_display = (
        "reseller", "client", "amount", "rate_applied", "status", "paid_at", "created_at"
    )
    list_filter = ("status", "created_at")
    search_fields = ("reseller__user__phone", "client__phone")
    readonly_fields = ("reseller", "client", "subscription", "amount", "rate_applied", "paid_at", "created_at")
    ordering = ("-created_at",)
    actions = [export_commissions_csv]


@admin.register(Withdrawal)
class WithdrawalAdmin(admin.ModelAdmin):
    list_display = (
        "reseller", "amount", "method", "phone", "status", "requested_at", "processed_at"
    )
    list_filter = ("status", "method", "requested_at")
    search_fields = ("reseller__user__phone", "phone", "reference")
    readonly_fields = ("reseller", "amount", "method", "phone", "requested_at")
    ordering = ("-requested_at",)
    actions = [mark_withdrawal_completed, mark_withdrawal_rejected, export_withdrawals_csv]
