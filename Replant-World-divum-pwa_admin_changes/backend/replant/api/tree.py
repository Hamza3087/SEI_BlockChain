from datetime import datetime
from typing import cast

from drf_extra_fields.fields import Base64ImageField
from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticated

from replant import clustering
from replant.models import AssignedSpecies, Tree, User
from replant.permissions import IsPlanter

from .assigned_species import SpeciesSerializer


class TreeSerializer(serializers.ModelSerializer):
    assigned_species_id = serializers.IntegerField(write_only=True)
    species = SpeciesSerializer(read_only=True)
    image = Base64ImageField()

    class Meta:
        model = Tree
        fields = (
            "id",
            "assigned_species_id",
            "species",
            "review_state",
            "rejection_reason",
            "image",
            "latitude",
            "longitude",
            "captured_at",
            "created_at",
        )
        read_only_fields = ("id", "review_state", "rejection_reason", "created_at")

    def to_representation(self, instance):
        """
        Override the default representation to add the 'is_native'
        key inside the species object.
        """
        rep = super().to_representation(instance)
        species_representation = rep.get("species", {})
        # 'is_native' is stored on the tree record (populated from AssignedSpecies at creation)
        species_representation["is_native"] = instance.is_native
        rep["species"] = species_representation
        return rep

    def validate_captured_at(self, captured_at: datetime):
        user = cast(User, self.context["request"].user)
        if Tree.objects.filter(created_by=user, captured_at=captured_at).exists():
            raise serializers.ValidationError("Tree has been already uploaded.")
        return captured_at

    def to_representation(self, instance):
        """
        Override the default representation to add the 'is_native'
        key inside the species object.
        """
        rep = super().to_representation(instance)
        species_representation = rep.get("species", {})
        # 'is_native' is stored on the tree record (populated from AssignedSpecies at creation)
        species_representation["is_native"] = instance.is_native
        rep["species"] = species_representation
        return rep

    def _validate_assigned_species(self, assigned_species_id: int, user: User):
        assigned_species = AssignedSpecies.objects.filter(
            id=assigned_species_id,
            planting_organization=user.planting_organization,
            country=user.country,
        ).first()

        if assigned_species is None:
            raise serializers.ValidationError(
                {
                    "assigned_species_id": [
                        "Assigned species with provided ID does not exist."
                    ]
                }
            )
        return assigned_species

    def validate(self, attrs: dict):
        assigned_species_id = attrs["assigned_species_id"]
        user = cast(User, self.context["request"].user)

        assigned_species = self._validate_assigned_species(assigned_species_id, user)

        attrs["assigned_species"] = assigned_species
        attrs["user"] = user
        return attrs

    def create(self, validated_data: dict):
        assigned_species: AssignedSpecies = validated_data["assigned_species"]

        return Tree.objects.create(
            image=validated_data["image"],
            latitude=validated_data["latitude"],
            longitude=validated_data["longitude"],
            planting_organization=assigned_species.planting_organization,
            country=assigned_species.country,
            species=assigned_species.species,
            is_native=assigned_species.is_native,
            planting_cost_usd=assigned_species.planting_cost_usd,
            created_by=validated_data["user"],
            captured_at=validated_data["captured_at"],
            tile_index=clustering.get_tree_tile_index(
                float(validated_data["latitude"]),
                float(validated_data["longitude"]),
            ),
        )


class TreeView(generics.ListCreateAPIView):
    serializer_class = TreeSerializer
    permission_classes = [IsAuthenticated, IsPlanter]

    def get_queryset(self):
        user = cast(User, self.request.user)
        # return (
        #     Tree.objects.filter(
        #         created_by=user,
        #     )
        #     .select_related("species")
        #     .order_by("-created_at")
        # )
        review_state = self.request.query_params.get("status")
        queryset = Tree.objects.filter(created_by=user).select_related("species").order_by("-created_at")
        if review_state:
            queryset = queryset.filter(review_state__iexact=review_state)

        return queryset
