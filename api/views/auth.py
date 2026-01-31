from rest_framework.generics import CreateAPIView
from api.serializers.auth import RegisterSerializer
from django.contrib.auth.models import User

class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = []
