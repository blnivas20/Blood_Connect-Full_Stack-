from django.urls import path
from api.views.auth import RegisterView
from api.views.profile import MyProfileView
from rest_framework_simplejwt.views import TokenObtainPairView
from api.views.request import (
    RequestListCreateView,
    RequestDetailView,
)
from api.views.donor import (
    AcceptRequestView , AcceptedDonorListView , FinalizeDonorView
)

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", TokenObtainPairView.as_view()),
    path("profile/me/", MyProfileView.as_view()),
    path("requests/", RequestListCreateView.as_view()),
    path("requests/<str:short_id>/", RequestDetailView.as_view()),
    path("requests/<str:short_id>/accept/", AcceptRequestView.as_view()),
    path("requests/<str:short_id>/donors/",AcceptedDonorListView.as_view()),
    path("donors/<str:unique_id>/finalize/",FinalizeDonorView.as_view()),
]
