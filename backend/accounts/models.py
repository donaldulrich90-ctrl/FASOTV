import re
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


def normalize_phone(phone: str) -> str:
    """Normalize BF phone to E.164 format (+226XXXXXXXX)."""
    digits = re.sub(r"\D", "", phone)
    if digits.startswith("226") and len(digits) == 11:
        return f"+{digits}"
    if len(digits) == 8:
        return f"+226{digits}"
    return f"+{digits}"


class UserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError("Le numéro de téléphone est requis")
        phone = normalize_phone(phone)
        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(phone, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    phone = models.CharField(max_length=20, unique=True, verbose_name="Téléphone")
    name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    # Subscription cache (updated by subscriptions app)
    plan_actif = models.CharField(max_length=100, blank=True)
    date_expiration = models.DateTimeField(null=True, blank=True)

    # Parental control / adult PIN
    adult_pin_hash = models.CharField(max_length=128, blank=True)
    adult_enabled = models.BooleanField(default=False)
    pin_failed_count = models.IntegerField(default=0)
    pin_locked_until = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def __str__(self):
        return self.name or self.phone

    @property
    def has_active_subscription(self):
        from django.utils import timezone
        return self.date_expiration is not None and self.date_expiration > timezone.now()
