from rest_framework import serializers
from donations.models import Request,AcceptedDonor
from .donor import AcceptedDonorSerializer

class RequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(
        source="requester.username",
        read_only=True
    )

    can_accept = serializers.SerializerMethodField()

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
            "can_accept",          # 👈 added
        ]

        read_only_fields = [
            "short_id",
            "status",
            "created_at",
            "requester_name",
            "can_accept",          # 👈 added
        ]

    def validate_patient_age(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Patient age must be greater than 0"
            )
        return value

    def get_can_accept(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        # not authenticated → no button
        if not user or not user.is_authenticated:
            return False

        # requester cannot accept own request
        if obj.requester == user:
            return False

        # request must be pending
        if obj.status != "Pending":
            return False

        # donor already accepted this request
        if AcceptedDonor.objects.filter(
            request=obj,
            donor=user
        ).exists():
            return False

        return True

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
