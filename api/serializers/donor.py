from rest_framework import serializers
from donations.models import AcceptedDonor


class AcceptedDonorSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(
        source="donor.username",
        read_only=True
    )

    request_short_id = serializers.CharField(
        source="request.short_id",
        read_only=True
    )

    class Meta:
        model = AcceptedDonor
        fields = [
            "unique_id",
            "donor_name",
            "request_short_id",
            "status",
            "accepted_at",
        ]

        read_only_fields = [
            "unique_id",
            "donor_name",
            "request_short_id",
            "status",
            "accepted_at",
        ]

class AcceptedDonorCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcceptedDonor
        fields = []  # No body required — derived from context
