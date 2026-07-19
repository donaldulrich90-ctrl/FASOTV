from datetime import timedelta

from django.db import transaction
from django.db.models import F, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Commission, Reseller, ResellerClient, Withdrawal
from .serializers import (
    CommissionSerializer,
    RegisterResellerSerializer,
    ResellerClientSerializer,
    ResellerProfileSerializer,
    WithdrawalCreateSerializer,
    WithdrawalSerializer,
)


def _get_reseller(user):
    if not getattr(user, "is_authenticated", False):
        return None
    try:
        return user.reseller_profile
    except Exception:
        return None


class RegisterResellerView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = RegisterResellerSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        reseller = Reseller.objects.create(
            user=request.user,
            phone_paiement=serializer.validated_data["phone_paiement"],
            motivation=serializer.validated_data.get("motivation", ""),
        )
        return Response(
            ResellerProfileSerializer(reseller).data,
            status=status.HTTP_201_CREATED,
        )


class DashboardView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        reseller = _get_reseller(request.user)
        if not reseller:
            return Response({"detail": "Vous n'êtes pas revendeur."}, status=403)

        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        this_month = (
            Commission.objects.filter(
                reseller=reseller, status="paid", created_at__gte=month_start
            ).aggregate(total=Sum("amount"))["total"]
            or 0
        )
        total_clients = reseller.clients.count()
        active_clients = reseller.clients.filter(is_active=True).count()

        return Response(
            {
                "reseller": ResellerProfileSerializer(reseller).data,
                "stats": {
                    "total_clients": total_clients,
                    "active_clients": active_clients,
                    "this_month_earnings": this_month,
                    "available_balance": reseller.available_balance,
                    "total_earnings": reseller.total_earnings,
                },
            }
        )


class ClientListView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = ResellerClientSerializer

    def get_queryset(self):
        reseller = _get_reseller(self.request.user)
        if not reseller:
            return ResellerClient.objects.none()
        return reseller.clients.select_related("client").order_by("-joined_at")


class CommissionListView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CommissionSerializer

    def get_queryset(self):
        reseller = _get_reseller(self.request.user)
        if not reseller:
            return Commission.objects.none()
        return reseller.commissions.select_related(
            "client", "subscription__plan"
        ).order_by("-created_at")


class WithdrawView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        reseller = _get_reseller(request.user)
        if not reseller:
            return Response({"detail": "Vous n'êtes pas revendeur."}, status=403)
        if not reseller.is_active:
            return Response({"detail": "Compte revendeur inactif."}, status=403)

        serializer = WithdrawalCreateSerializer(
            data=request.data, context={"reseller": reseller}
        )
        serializer.is_valid(raise_exception=True)
        amount = serializer.validated_data["amount"]

        with transaction.atomic():
            reseller_locked = Reseller.objects.select_for_update().get(pk=reseller.pk)
            if amount > reseller_locked.available_balance:
                return Response(
                    {"detail": f"Solde insuffisant. Disponible : {reseller_locked.available_balance} FCFA."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            Reseller.objects.filter(pk=reseller.pk).update(
                available_balance=F("available_balance") - amount
            )
            withdrawal = Withdrawal.objects.create(
                reseller=reseller_locked,
                amount=amount,
                method=serializer.validated_data["method"],
                phone=serializer.validated_data["phone"],
            )

        return Response(WithdrawalSerializer(withdrawal).data, status=status.HTTP_201_CREATED)


class WithdrawalListView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = WithdrawalSerializer

    def get_queryset(self):
        reseller = _get_reseller(self.request.user)
        if not reseller:
            return Withdrawal.objects.none()
        return reseller.withdrawals.order_by("-requested_at")


class StatsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        reseller = _get_reseller(request.user)
        if not reseller:
            return Response({"detail": "Vous n'êtes pas revendeur."}, status=403)

        six_months_ago = timezone.now() - timedelta(days=182)
        monthly = (
            Commission.objects.filter(
                reseller=reseller,
                status="paid",
                created_at__gte=six_months_ago,
            )
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total=Sum("amount"), count=Sum("amount") / Sum("amount"))
            .order_by("month")
        )

        monthly_data = [
            {
                "month": entry["month"].strftime("%Y-%m"),
                "total": float(entry["total"] or 0),
            }
            for entry in monthly
        ]

        return Response({"monthly": monthly_data})
