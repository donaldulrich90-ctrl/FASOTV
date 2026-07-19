"""
Payment provider interface + stubs for Mobile Money operators in Burkina Faso.

Real API integration requires merchant credentials from each operator:
- Orange Money BF : https://developer.orange.com/apis/orange-money-webpay-bf
- Moov Money BF   : contact Moov Africa BF for API docs
- Coris Money BF  : contact Coris Bank for API docs

Replace the TODO sections with real HTTP calls once credentials are obtained.
"""
import uuid
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


@dataclass
class PaymentInitResult:
    success: bool
    transaction_id: str
    provider_ref: str = ""
    redirect_url: str = ""
    error: str = ""
    raw: dict = None


@dataclass
class PaymentStatusResult:
    success: bool
    status: str  # pending / success / failed
    provider_ref: str = ""
    error: str = ""


class PaymentProvider(ABC):
    """Interface commun pour tous les opérateurs Mobile Money."""

    @abstractmethod
    def initiate(self, amount: int, phone: str, transaction_id: str, description: str) -> PaymentInitResult:
        """Lance un paiement Mobile Money. Retourne un PaymentInitResult."""

    @abstractmethod
    def check_status(self, transaction_id: str, provider_ref: str) -> PaymentStatusResult:
        """Vérifie le statut d'un paiement en cours."""

    @staticmethod
    def generate_transaction_id() -> str:
        return f"FASOTV-{uuid.uuid4().hex[:12].upper()}"


class OrangeMoneyProvider(PaymentProvider):
    """
    Orange Money Burkina Faso
    TODO: Remplacer les stubs par les vrais appels API Orange Money BF
    Docs: https://developer.orange.com/apis/orange-money-webpay-bf/getting-started
    """

    def __init__(self):
        self.merchant_key = settings.ORANGE_MONEY_MERCHANT_KEY
        self.pin = settings.ORANGE_MONEY_PIN
        self.base_url = settings.ORANGE_MONEY_BASE_URL

    def initiate(self, amount: int, phone: str, transaction_id: str, description: str) -> PaymentInitResult:
        if not self.merchant_key:
            logger.warning("Orange Money: ORANGE_MONEY_MERCHANT_KEY non configuré — mode stub actif")
            return PaymentInitResult(
                success=True,
                transaction_id=transaction_id,
                provider_ref=f"OM-STUB-{transaction_id}",
                redirect_url="",
                raw={"stub": True, "message": "Configure ORANGE_MONEY_MERCHANT_KEY in .env"},
            )

        # TODO: Implémenter l'appel réel à l'API Orange Money BF
        # Étape 1 : Obtenir un access token (OAuth2)
        # POST {base_url}/token avec merchant_key
        # Étape 2 : Initier le paiement
        # POST {base_url}/webpayment avec amount, phone, order_id, etc.
        # Étape 3 : Retourner payment_url pour rediriger l'utilisateur
        raise NotImplementedError("Orange Money real API not yet configured. Set ORANGE_MONEY_MERCHANT_KEY.")

    def check_status(self, transaction_id: str, provider_ref: str) -> PaymentStatusResult:
        if not self.merchant_key:
            return PaymentStatusResult(success=True, status="success", provider_ref=provider_ref)
        # TODO: GET {base_url}/webpayment/{provider_ref}/status
        raise NotImplementedError("Orange Money check_status not yet configured.")


class MoovMoneyProvider(PaymentProvider):
    """
    Moov Money Burkina Faso
    TODO: Implémenter avec les credentials Moov Africa BF
    """

    def __init__(self):
        self.base_url = settings.MOOV_MONEY_BASE_URL
        self.merchant_id = settings.MOOV_MONEY_MERCHANT_ID
        self.secret = settings.MOOV_MONEY_SECRET

    def initiate(self, amount: int, phone: str, transaction_id: str, description: str) -> PaymentInitResult:
        if not self.merchant_id:
            logger.warning("Moov Money: MOOV_MONEY_MERCHANT_ID non configuré — mode stub actif")
            return PaymentInitResult(
                success=True,
                transaction_id=transaction_id,
                provider_ref=f"MOOV-STUB-{transaction_id}",
                raw={"stub": True},
            )
        # TODO: Implémenter l'appel API Moov Money BF
        raise NotImplementedError("Moov Money not yet configured.")

    def check_status(self, transaction_id: str, provider_ref: str) -> PaymentStatusResult:
        if not self.merchant_id:
            return PaymentStatusResult(success=True, status="success", provider_ref=provider_ref)
        raise NotImplementedError("Moov Money check_status not yet configured.")


class CorisMoneyProvider(PaymentProvider):
    """
    Coris Money Burkina Faso
    TODO: Implémenter avec les credentials Coris Bank BF
    """

    def __init__(self):
        self.base_url = settings.CORIS_MONEY_BASE_URL
        self.merchant_id = settings.CORIS_MONEY_MERCHANT_ID
        self.secret = settings.CORIS_MONEY_SECRET

    def initiate(self, amount: int, phone: str, transaction_id: str, description: str) -> PaymentInitResult:
        if not self.merchant_id:
            logger.warning("Coris Money: non configuré — mode stub actif")
            return PaymentInitResult(
                success=True,
                transaction_id=transaction_id,
                provider_ref=f"CORIS-STUB-{transaction_id}",
                raw={"stub": True},
            )
        raise NotImplementedError("Coris Money not yet configured.")

    def check_status(self, transaction_id: str, provider_ref: str) -> PaymentStatusResult:
        if not self.merchant_id:
            return PaymentStatusResult(success=True, status="success", provider_ref=provider_ref)
        raise NotImplementedError("Coris Money check_status not yet configured.")


PROVIDERS = {
    "orange_money": OrangeMoneyProvider,
    "moov_money": MoovMoneyProvider,
    "coris_money": CorisMoneyProvider,
}


def get_provider(method: str) -> PaymentProvider:
    cls = PROVIDERS.get(method)
    if not cls:
        raise ValueError(f"Opérateur inconnu : {method}")
    return cls()
