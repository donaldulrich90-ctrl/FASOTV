from django.urls import path
from .views import LanguagesView, GenresView

urlpatterns = [
    path("languages/", LanguagesView.as_view(), name="catalog-languages"),
    path("genres/", GenresView.as_view(), name="catalog-genres"),
]
