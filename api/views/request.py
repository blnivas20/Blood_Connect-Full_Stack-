from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from donations.models import Request
from api.serializers.request import RequestSerializer

class RequestListCreateView(generics.ListCreateAPIView):
    serializer_class = RequestSerializer

    def get_queryset(self):
        # Exclude own requests
        return Request.objects.exclude(
            requester=self.request.user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(
            requester=self.request.user
        )

class RequestDetailView(generics.RetrieveAPIView):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    lookup_field = "short_id"
