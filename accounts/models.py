from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
class Profile(models.Model):

    BLOOD_GROUPS = [
        ("A+", "A+"), ("A-", "A-"),
        ("B+", "B+"), ("B-", "B-"),
        ("AB+", "AB+"), ("AB-", "AB-"),
        ("O+", "O+"), ("O-", "O-"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    phone = models.CharField(max_length=15)
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS)
    location = models.TextField()
    last_donated = models.DateField(null=True, blank=True)
    

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username
