from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from donations.models import AcceptedDonor
from chat.models import ChatMessage
from django.shortcuts import get_object_or_404


class ChatMessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):
        room = get_object_or_404(AcceptedDonor, unique_id=room_id)

        if room.request.requester != request.user and room.donor != request.user:
            return Response({"error": "Not allowed"}, status=403)

        messages = ChatMessage.objects.filter(
            room=room
        ).select_related("sender")

        data = [
            {
                "id": m.id,
                "sender": {
                    "id": m.sender.id,
                    "username": m.sender.username,
                },
                "content": m.message,
                "timestamp": m.timestamp,
            }
            for m in messages
        ]

        return Response(data)
    


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Rooms where I am the requester
        requester_rooms = AcceptedDonor.objects.select_related(
            "donor",
            "request",
            "request__requester"
        ).filter(
            request__requester=user
        )

        # Rooms where I am the donor
        donor_rooms = AcceptedDonor.objects.select_related(
            "donor",
            "request",
            "request__requester"
        ).filter(
            donor=user
        )

        def build_data(rooms, role):
            result = []

            for room in rooms:
                if role == "requester":
                    other_user = room.donor
                else:
                    other_user = room.request.requester

                last_message = ChatMessage.objects.filter(
                    room=room
                ).order_by("-timestamp").first()

                result.append({
                    "id": other_user.id,
                    "username": other_user.username,
                    "unique_id": room.unique_id,
                    "blood_group": other_user.profile.blood_group,
                    "last_message": last_message.message if last_message else None,
                    "unread_count": 0
                })

            return result

        response_data = {
            "as_requester": build_data(requester_rooms, "requester"),
            "as_donor": build_data(donor_rooms, "donor"),
        }

        return Response(response_data)