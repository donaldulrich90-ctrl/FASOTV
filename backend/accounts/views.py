import time
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .helpers import adult_allowed
from .models import normalize_phone
from .serializers import (
    ChangePasswordSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)

User = get_user_model()

_WEAK_PINS = {
    "0000", "1111", "2222", "3333", "4444",
    "5555", "6666", "7777", "8888", "9999",
    "1234", "4321", "0123", "9876",
}
_MAX_ATTEMPTS = 5
_LOCKOUT_MINUTES = 15
_UNLOCK_MINUTES = 30


def _valid_pin(pin) -> bool:
    return isinstance(pin, str) and len(pin) == 4 and pin.isdigit()


class PhoneTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        attrs[self.username_field] = normalize_phone(attrs.get(self.username_field, ""))
        data = super().validate(attrs)
        data["user"] = UserProfileSerializer(self.user).data
        return data


class LoginView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    serializer_class = PhoneTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code_parrainage = serializer.validated_data.get("code_parrainage", "").strip()
        user = serializer.save()

        if code_parrainage:
            try:
                from resellers.models import Reseller, ResellerClient
                reseller = Reseller.objects.get(code_parrainage=code_parrainage, is_active=True)
                if reseller.user != user:
                    ResellerClient.objects.get_or_create(
                        client=user,
                        defaults={"reseller": reseller, "source": "code"},
                    )
            except Reseller.DoesNotExist:
                pass

        return Response(
            {"detail": "Compte créé avec succès.", "user": UserProfileSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response({"detail": "Mot de passe modifié avec succès."})


# ── Adult PIN endpoints ──────────────────────────────────────────────────────

class SetAdultPinView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        pin = request.data.get("pin", "")
        current_pin = request.data.get("current_pin", "")

        if not _valid_pin(pin):
            return Response({"detail": "PIN must be exactly 4 digits."}, status=400)
        if pin in _WEAK_PINS:
            return Response({"code": "parental_pin_weak"}, status=400)

        user = request.user
        if user.adult_pin_hash:
            if not _valid_pin(current_pin) or not check_password(current_pin, user.adult_pin_hash):
                return Response({"detail": "Current PIN is incorrect."}, status=400)

        user.adult_pin_hash = make_password(pin)
        user.adult_enabled = True
        user.pin_failed_count = 0
        user.pin_locked_until = None
        user.save(update_fields=["adult_pin_hash", "adult_enabled", "pin_failed_count", "pin_locked_until"])
        return Response({"detail": "PIN set.", "adult_enabled": True})


class VerifyAdultPinView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        user = request.user

        # Lockout check FIRST — before touching any PIN logic
        if user.pin_locked_until and user.pin_locked_until > timezone.now():
            remaining = max(1, int((user.pin_locked_until - timezone.now()).total_seconds() / 60))
            return Response({"code": "locked", "wait_minutes": remaining}, status=429)

        pin = request.data.get("pin", "")
        if not _valid_pin(pin):
            return Response({"detail": "Invalid PIN format."}, status=400)
        if not user.adult_pin_hash:
            return Response({"detail": "No PIN set."}, status=400)

        correct = check_password(pin, user.adult_pin_hash)

        if correct:
            user.pin_failed_count = 0
            user.pin_locked_until = None
            user.save(update_fields=["pin_failed_count", "pin_locked_until"])
            request.session["adult_unlocked_until"] = time.time() + _UNLOCK_MINUTES * 60
            request.session.modified = True
            return Response({"detail": "unlocked"})
        else:
            user.pin_failed_count += 1
            if user.pin_failed_count >= _MAX_ATTEMPTS:
                user.pin_locked_until = timezone.now() + timedelta(minutes=_LOCKOUT_MINUTES)
                user.pin_failed_count = 0
                user.save(update_fields=["pin_failed_count", "pin_locked_until"])
                return Response({"code": "locked", "wait_minutes": _LOCKOUT_MINUTES}, status=429)
            remaining_attempts = _MAX_ATTEMPTS - user.pin_failed_count
            user.save(update_fields=["pin_failed_count"])
            return Response({"code": "wrong", "attempts_remaining": remaining_attempts}, status=400)


class LockAdultView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        request.session.pop("adult_unlocked_until", None)
        request.session.modified = True
        return Response({"detail": "locked"})


class DisableAdultView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        pin = request.data.get("pin", "")
        user = request.user

        if not user.adult_pin_hash:
            return Response({"detail": "No PIN set."}, status=400)
        if not _valid_pin(pin) or not check_password(pin, user.adult_pin_hash):
            return Response({"detail": "Incorrect PIN."}, status=400)

        user.adult_enabled = False
        user.adult_pin_hash = ""
        user.pin_failed_count = 0
        user.pin_locked_until = None
        user.save(update_fields=["adult_enabled", "adult_pin_hash", "pin_failed_count", "pin_locked_until"])
        request.session.pop("adult_unlocked_until", None)
        request.session.modified = True
        return Response({"detail": "disabled"})
