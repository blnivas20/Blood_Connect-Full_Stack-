from rest_framework import serializers
from donations.models import AcceptedDonor


class AcceptedDonorSerializer(serializers.ModelSerializer):
    unique_id = serializers.CharField(read_only=True)
    username = serializers.CharField(source="donor.username", read_only=True)
    city = serializers.CharField(source="donor.profile.location", read_only=True)
    request_id = serializers.IntegerField(source="request.id", read_only=True)
    request_blood_group = serializers.CharField(
        source="request.blood_group",
        read_only=True
    )

    class Meta:
        model = AcceptedDonor
        fields = [
            "id",
            "username",
            "city",
            "request_id",
            "request_blood_group",
            "accepted_at",
            "unique_id"
        ]

class AcceptedDonorCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcceptedDonor
        fields = []  # No body required — derived from context
