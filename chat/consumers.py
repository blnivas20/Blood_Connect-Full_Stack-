import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async



class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        print('connect called !')
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"chat_{self.room_id}"
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close()
            return

        is_allowed = await self.is_user_allowed()

        if not is_allowed:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get("message")

        if not message:
            return

        await self.save_message(message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "username": self.user.username,
                "sender_id": self.user.id,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    # ---------------- DATABASE ----------------

    @database_sync_to_async
    def is_user_allowed(self):
        from donations.models import AcceptedDonor
        from .models import ChatMessage        
        try:
            room = AcceptedDonor.objects.select_related(
                "request", "donor"
            ).get(unique_id=self.room_id)

            # requester allowed
            if room.request.requester == self.user:
                return True

            # donor allowed
            if room.donor == self.user:
                return True

            return False

        except AcceptedDonor.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, message):
        from donations.models import AcceptedDonor
        from .models import ChatMessage
        room = AcceptedDonor.objects.get(unique_id=self.room_id)

        ChatMessage.objects.create(
            room=room,
            sender=self.user,
            message=message
        )