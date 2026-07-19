from django.urls import path
from . import views

urlpatterns = [
    path("import/url/", views.ImportFromURLView.as_view(), name="m3u-import-url"),
    path("import/file/", views.ImportFromFileView.as_view(), name="m3u-import-file"),
    path("preview/", views.ParsePreviewView.as_view(), name="m3u-preview"),
]
