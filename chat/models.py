from django.db import models
from donations.models import AcceptedDonor
from django.contrib.auth.models import User
# Create your models here.
class ChatMessage(models.Model):
    room = models.ForeignKey(AcceptedDonor, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.CharField(max_length=300 , null=True , blank=True)
    file = models.FileField(upload_to="chat_files/", blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.sender.username} : {self.message} - {self.room.unique_id}'
    class Meta:
        ordering = ['-timestamp']