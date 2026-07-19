from django.utils import timezone


PROTECTED_PREFIXES = ("/api/channels/stream/", "/api/vod/stream/", "/api/xtream/stream/")


class SubscriptionMiddleware:
    """
    Vérifie l'abonnement actif pour les endpoints de streaming.
    Les endpoints publics (auth, plans, paiement, docs) sont exemptés.
    La vérification JWT est effectuée par DRF avant ce middleware pour les vues API.
    Ce middleware agit comme garde-fou supplémentaire sur les URLs de stream.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if any(request.path.startswith(p) for p in PROTECTED_PREFIXES):
            user = getattr(request, "user", None)
            if not user or not user.is_authenticated:
                from django.http import JsonResponse
                return JsonResponse({"detail": "Authentification requise."}, status=401)
            if not user.has_active_subscription and not user.is_staff:
                from django.http import JsonResponse
                return JsonResponse(
                    {"detail": "Abonnement requis pour accéder au contenu.", "code": "subscription_required"},
                    status=403,
                )
        return self.get_response(request)
