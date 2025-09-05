from typing import cast

from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticated

from replant.models import AssignedSpecies, Species, User
from replant.permissions import IsPlanter

from replant.logging import logger


class SpeciesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Species
        fields = (
            "common_name",
            "botanical_name",
        )


class AssignedSpeciesSerializer(serializers.ModelSerializer):
    species = SpeciesSerializer()

    class Meta:
        model = AssignedSpecies
        fields = (
            "id",
            "species",
        )

from django.shortcuts import get_object_or_404

class AssignedSpeciesView(generics.ListAPIView):
    serializer_class = AssignedSpeciesSerializer
    # permission_classes = [IsAuthenticated, IsPlanter]
    pagination_class = None

    def get_queryset(self):
        request_user = cast(User, self.request.user)

        # Step 1: Get user_id from request args
        user_id = self.request.GET.get("user_id")

        if user_id:
            user_id = int(user_id)
            logger.info(f"Fetching AssignedSpecies for user_id={user_id}")
            user = get_object_or_404(User, id=user_id)
        else:
            logger.info(f"No user_id provided. Using request user: {request_user.id}")
            user = request_user

        if not user.planting_organization or not user.country:
            logger.warning(f"User {user.id} has no planting_organization or country set.")
            return AssignedSpecies.objects.none()

        queryset = (
            AssignedSpecies.objects.filter(
                planting_organization=user.planting_organization,
                country=user.country,
            )
            .select_related("species")
            .order_by("species__common_name")
        )

        logger.info(
            f"AssignedSpecies queryset for user {user.id} (org={user.planting_organization_id}, "
            f"country={user.country_id}): {queryset.count()} records found."
        )

        return queryset
