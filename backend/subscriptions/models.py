from django.db import models
from django.conf import settings
from django.utils import timezone


class Plan(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    price = models.PositiveIntegerField(help_text="Prix en FCFA")
    duration_hours = models.PositiveIntegerField(help_text="Durée en heures")
    max_screens = models.PositiveSmallIntegerField(default=1)
    features = models.JSONField(default=list, help_text="Liste des fonctionnalités incluses")
    is_active = models.BooleanField(default=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "price"]
        verbose_name = "Forfait"
        verbose_name_plural = "Forfaits"

    def __str__(self):
        return f"{self.name} – {self.price} FCFA"

    @property
    def duration_label(self):
        if self.duration_hours < 24:
            return f"{self.duration_hours}h"
        days = self.duration_hours // 24
        return f"{days} jour{'s' if days > 1 else ''}"


class Subscription(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subscriptions",
    )
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["-start_date"]
        verbose_name = "Abonnement"
        verbose_name_plural = "Abonnements"

    def __str__(self):
        return f"{self.user} – {self.plan.name} – {self.end_date.date()}"

    @property
    def is_valid(self):
        return self.is_active and self.end_date > timezone.now()


PAYMENT_STATUS = [
    ("pending", "En attente"),
    ("success", "Réussi"),
    ("failed", "Échoué"),
    ("cancelled", "Annulé"),
]

PAYMENT_METHODS = [
    ("orange_money", "Orange Money"),
    ("moov_money", "Moov Money"),
    ("coris_money", "Coris Money"),
]


class Payment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT)
    amount = models.PositiveIntegerField(help_text="Montant en FCFA")
    method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    phone = models.CharField(max_length=20, help_text="Numéro Mobile Money")
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default="pending")
    transaction_id = models.CharField(max_length=200, blank=True, db_index=True)
    provider_ref = models.CharField(max_length=200, blank=True, help_text="Référence côté opérateur")
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"

    def __str__(self):
        return f"{self.user} – {self.amount} FCFA ({self.method}) – {self.status}"
