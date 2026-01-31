from rest_framework import serializers
from accounts.models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", required=False)
    username = serializers.CharField(source="user.username", required=False)

    class Meta:
        model = Profile
        fields = [
            "phone",
            "blood_group",
            "location",
            "last_donated",
            "email",
            "username",
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})

        # Update User fields
        if user_data:
            user = instance.user
            user.email = user_data.get("email", user.email)
            user.username = user_data.get("username", user.username)
            user.save()

        # Update Profile fields
        return super().update(instance, validated_data)
