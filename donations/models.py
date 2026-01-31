# Create your models here.
import shortuuid
from django.db import models
from django.contrib.auth.models import User

import shortuuid
from django.db import models
from django.contrib.auth.models import User

class Request(models.Model):
    
    STATUS_CHOICES = [
    ("Pending", "Pending"),
    ("Success", "Success"),
    ("Cancelled", "Cancelled"),
    ]
    BLOOD_GROUPS = [
        ("A+", "A+"), ("A-", "A-"),
        ("B+", "B+"), ("B-", "B-"),
        ("AB+", "AB+"), ("AB-", "AB-"),
        ("O+", "O+"), ("O-", "O-"),
    ]

    URGENCY_CHOICES = [
        ("Emergency", "Emergency"),
        ("Not Urgent", "Not Urgent"),
    ]

    short_id = models.CharField(
        max_length=22,
        unique=True,
        default=shortuuid.uuid,
        editable=False
    )

    requester = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="requests"
    )

    patient_name = models.CharField(max_length=100)
    patient_age = models.PositiveIntegerField()
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS)
    urgency = models.CharField(max_length=15, choices=URGENCY_CHOICES)

    location = models.TextField()
    pincode = models.CharField(max_length=6)

    reason = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Pending"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.requester.username} -> {self.short_id} | {self.blood_group}"


import shortuuid
from django.db import models
from django.contrib.auth.models import User
from .models import Request  # same app

class AcceptedDonor(models.Model):

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Finalized", "Finalized"),
        ("Rejected", "Rejected"),
    ]

    unique_id = models.CharField(
        max_length=22,
        unique=True,
        default=shortuuid.uuid,
        editable=False
    )

    request = models.ForeignKey(
        Request,
        related_name="accepted_donors",
        on_delete=models.CASCADE
    )

    donor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="donations"
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="Pending"
    )

    accepted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.donor.username} → {self.request.short_id}"

