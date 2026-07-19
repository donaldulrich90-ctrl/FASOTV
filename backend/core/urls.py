from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/accounts/", include("accounts.urls")),
    path("api/channels/", include("channels.urls")),
    path("api/vod/", include("vod.urls")),
    path("api/subscriptions/", include("subscriptions.urls")),
    path("api/xtream/", include("xtream.urls")),
    path("api/m3u/", include("m3u_parser.urls")),
    path("api/resellers/", include("resellers.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
