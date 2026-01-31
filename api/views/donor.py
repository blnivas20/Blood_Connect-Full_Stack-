from rest_framework.generics import ListAPIView
from donations.models import AcceptedDonor
from api.serializers.donor import AcceptedDonorSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from donations.models import Request, AcceptedDonor
from donations.utils import is_compatible
from django.shortcuts import get_object_or_404

class AcceptRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, short_id):

        req = get_object_or_404(Request, short_id=short_id)

        # ❌ Cannot accept own request
        if req.requester == request.user:
            return Response(
                {"error": "You cannot accept your own request"},
                status=403
            )

        # ❌ Request already completed
        if req.status != "Pending":
            return Response(
                {"error": "Request is no longer active"},
                status=400
            )

        donor_blood = request.user.profile.blood_group
        needed_blood = req.blood_group

        # ❌ Blood incompatibility
        if not is_compatible(donor_blood, needed_blood):
            return Response(
                {"error": "Blood group not compatible"},
                status=400
            )

        donor, created = AcceptedDonor.objects.get_or_create(
            request=req,
            donor=request.user
        )

        if not created:
            return Response(
                {"message": "Already accepted"},
                status=200
            )

        return Response(
            {"message": "Accepted successfully"},
            status=201
        )



class AcceptedDonorListView(ListAPIView):
    serializer_class = AcceptedDonorSerializer

    def get_queryset(self):
        short_id = self.kwargs["short_id"]
        return AcceptedDonor.objects.filter(
            request__short_id=short_id,
            request__requester=self.request.user
        )

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

