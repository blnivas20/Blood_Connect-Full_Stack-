from rest_framework.permissions import BasePermission

class IsRequester(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.requester == request.user


class IsDonor(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, "profile") and request.user.profile.blood_group
