from rest_framework.generics import ListAPIView
from donations.models import AcceptedDonor
from api.serializers.donor import AcceptedDonorSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from donations.models import Request, AcceptedDonor
from donations.utils import is_compatible
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError


class AcceptRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, short_id):
        blood_request = Request.objects.get(short_id=short_id)

        # ❌ requester cannot accept own request
        if blood_request.requester == request.user:
            raise ValidationError("You cannot accept your own request.")

        # ❌ donor already accepted this request
        if AcceptedDonor.objects.filter(
            request=blood_request,
            donor=request.user
        ).exists():
            raise ValidationError("You have already accepted this request.")

        AcceptedDonor.objects.create(
            request=blood_request,
            donor=request.user
        )

        return Response({"message": "You are marked as ready to donate."})



class AcceptedDonorListView(ListAPIView):
    serializer_class = AcceptedDonorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = AcceptedDonor.objects.filter(
            request__requester=self.request.user,
            status="Pending"
        ).select_related("donor", "request").order_by("-accepted_at")

        for obj in queryset:
            print(obj.unique_id, obj.donor.username , obj.request.blood_group)
        
        return queryset

class FinalizeDonorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, unique_id):

        donor = get_object_or_404(AcceptedDonor, unique_id=unique_id)
        req = donor.request

        # ❌ Only requester can finalize
        if req.requester != request.user:
            return Response(
                {"error": "Only requester can finalize"},
                status=403
            )

        # ❌ Already finalized
        if req.status == "Success":
            return Response(
                {"error": "Request already finalized"},
                status=400
            )

        donor.status = "Finalized"
        donor.save()

        AcceptedDonor.objects.filter(
            request=req
        ).exclude(id=donor.id).update(status="Rejected")

        req.status = "Success"
        req.save()

        return Response(
            {"message": "Donor finalized"},
            status=200
        )

