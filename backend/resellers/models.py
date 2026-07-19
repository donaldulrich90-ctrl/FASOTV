import random
import string
from decimal import Decimal

from django.conf import settings
from django.db import models
from django.db.models import F


NIVEAU_CHOICES = [
    ("bronze", "Bronze"),
    ("silver", "Silver"),
    ("gold", "Gold"),
    ("platinum", "Platinum"),
]

NIVEAU_THRESHOLDS = [
    ("platinum", 100, Decimal("30")),
    ("gold", 31, Decimal("25")),
    ("silver", 11, Decimal("20")),
    ("bronze", 0, Decimal("15")),
]

PAYMENT_METHOD_CHOICES = [
    ("orange_money", "Orange Money"),
    ("moov_money", "Moov Money"),
    ("coris_money", "Coris Money"),
]

COMMISSION_STATUS_CHOICES = [
    ("pending", "En attente"),
    ("paid", "Payée"),
    ("cancelled", "Annulée"),
]

WITHDRAWAL_STATUS_CHOICES = [
    ("pending", "En attente"),
    ("processing", "En traitement"),
    ("completed", "Complété"),
    ("rejected", "Rejeté"),
]


def _generate_code():
    chars = string.ascii_uppercase + string.digits
    while True:
        code = "FASO-" + "".join(random.choices(chars, k=6))
        if not Reseller.objects.filter(code_parrainage=code).exists():
            return code


class Reseller(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reseller_profile",
    )
    code_parrainage = models.CharField(max_length=20, unique=True, editable=False)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("15"))
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    available_balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    is_active = models.BooleanField(default=True)
    phone_paiement = models.CharField(max_length=20, help_text="Numéro Mobile Money pour recevoir les commissions")
    niveau = models.CharField(max_length=10, choices=NIVEAU_CHOICES, default="bronze")
    motivation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Revendeur"
        verbose_name_plural = "Revendeurs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} [{self.code_parrainage}] — {self.get_niveau_display()}"

    def save(self, *args, **kwargs):
        if not self.code_parrainage:
            self.code_parrainage = _generate_code()
        super().save(*args, **kwargs)

    def update_niveau(self):
        count = self.clients.filter(is_active=True).count()
        for niveau, threshold, rate in NIVEAU_THRESHOLDS:
            if count >= threshold:
                if self.niveau != niveau or self.commission_rate != rate:
                    self.niveau = niveau
                    self.commission_rate = rate
                    self.save(update_fields=["niveau", "commission_rate", "updated_at"])
                return

    @property
    def active_clients_count(self):
        return self.clients.filter(is_active=True).count()

    @property
    def next_niveau_info(self):
        count = self.active_clients_count
        levels = [
            ("bronze", 0, 10, "Silver", 11),
            ("silver", 11, 30, "Gold", 31),
            ("gold", 31, 100, "Platinum", 100),
            ("platinum", 100, None, None, None),
        ]
        for lvl, mn, mx, next_name, next_thresh in levels:
            if self.niveau == lvl:
                if next_thresh is None:
                    return {"next": None, "current_count": count, "needed": 0, "progress": 100}
                needed = max(0, next_thresh - count)
                total_span = next_thresh - mn
                progress = min(100, int((count - mn) / total_span * 100)) if total_span else 100
                return {"next": next_name, "current_count": count, "needed": needed, "progress": progress}
        return None


class ResellerClient(models.Model):
    reseller = models.ForeignKey(Reseller, on_delete=models.CASCADE, related_name="clients")
    client = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reseller_affiliation",
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    source = models.CharField(
        max_length=20,
        default="code",
        help_text="code / lien / qr / manuel",
    )

    class Meta:
        verbose_name = "Client revendeur"
        verbose_name_plural = "Clients revendeurs"
        ordering = ["-joined_at"]

    def __str__(self):
        return f"{self.reseller.user} → {self.client}"


class Commission(models.Model):
    reseller = models.ForeignKey(Reseller, on_delete=models.CASCADE, related_name="commissions")
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="commissions_generated"
    )
    subscription = models.OneToOneField(
        "subscriptions.Subscription",
        on_delete=models.CASCADE,
        related_name="commission",
        null=True,
        blank=True,
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    rate_applied = models.DecimalField(max_digits=5, decimal_places=2)
    status = models.CharField(max_length=20, choices=COMMISSION_STATUS_CHOICES, default="paid")
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Commission"
        verbose_name_plural = "Commissions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reseller.user} — {self.amount} FCFA ({self.status})"


class Withdrawal(models.Model):
    reseller = models.ForeignKey(Reseller, on_delete=models.CASCADE, related_name="withdrawals")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    phone = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=WITHDRAWAL_STATUS_CHOICES, default="pending")
    reference = models.CharField(max_length=200, blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Retrait"
        verbose_name_plural = "Retraits"
        ordering = ["-requested_at"]

    def __str__(self):
        return f"{self.reseller.user} — {self.amount} FCFA ({self.status})"
