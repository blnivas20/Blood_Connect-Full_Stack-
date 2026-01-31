from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from donations.models import Request
from api.serializers.request import RequestSerializer

BLOOD_COMPATIBILITY = {
    "O-": ["O-"],
    "O+": ["O-", "O+"],
    "A-": ["O-", "A-"],
    "A+": ["O-", "O+", "A-", "A+"],
    "B-": ["O-", "B-"],
    "B+": ["O-", "O+", "B-", "B+"],
    "AB-": ["O-", "A-", "B-", "AB-"],
    "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
}

class RequestListCreateView(generics.ListCreateAPIView):
    serializer_class = RequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # donor blood group
        donor_blood = getattr(user.profile, "blood_group", None)

        qs = (
            Request.objects
            .filter(status="Pending")
            .exclude(requester=user)
            .order_by("-created_at")
        )

        # if donor has no blood group set → show nothing
        if not donor_blood:
            return qs.none()

        # only compatible requests
        return qs.filter(
            blood_group__in=BLOOD_COMPATIBILITY.get(donor_blood, [])
        )

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)


class RequestDetailView(generics.RetrieveAPIView):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    lookup_field = "short_id"
