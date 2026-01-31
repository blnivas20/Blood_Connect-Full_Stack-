from rest_framework import serializers
from donations.models import Request
from .donor import AcceptedDonorSerializer

class RequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(
        source="requester.username",
        read_only=True
    )

    class Meta:
        model = Request
        fields = [
            "short_id",
            "requester_name",
            "patient_name",
            "patient_age",
            "blood_group",
            "urgency",
            "location",
            "pincode",
            "reason",
            "status",
            "created_at",
        ]

        read_only_fields = [
            "short_id",
            "status",
            "created_at",
            "requester_name",
        ]

    def validate_patient_age(self, value):
        if value <= 0:
            raise serializers.ValidationError("Patient age must be greater than 0")
        return value

class RequestWithDonorsSerializer(serializers.ModelSerializer):
    accepted_donors = AcceptedDonorSerializer(many=True, read_only=True)

    class Meta:
        model = Request
        fields = [
            "short_id",
            "patient_name",
            "blood_group",
            "urgency",
            "status",
            "accepted_donors",
        ]
