from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q, ProtectedError, Count
from django.db.utils import IntegrityError
from rest_framework.views import APIView
from rest_framework import status
from replant.pagination import PageNumberPagination
from replant.response import failure, success
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from replant.models import AssignedSpecies, PlantingOrganization, Species, Country
from rest_framework.response import Response

from replant.models import Tree


class SpeciesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Species
        fields = ["common_name", "botanical_name", "iucn_status"]

    def validate_common_name(self, value):
        """Ensure the common name is unique"""
        if Species.objects.filter(common_name=value).exists():
            raise serializers.ValidationError("A species with this common name already exists.")
        return value

    def validate_botanical_name(self, value):
        """Ensure the botanical name is unique"""
        if Species.objects.filter(botanical_name=value).exists():
            raise serializers.ValidationError("A species with this botanical name already exists.")
        return value

class SpeciesListingSerializer(serializers.ModelSerializer):
    iucn_status = serializers.SerializerMethodField()
    species_id = serializers.IntegerField(source="id")

    class Meta:
        model = Species
        fields = ["common_name", "botanical_name", "iucn_status", "species_id"]

    def get_iucn_status(self, obj):
        """Return human-readable IUCN status"""
        return obj.get_iucn_status_display()

class AssignSpeciesSerializer(serializers.ModelSerializer):
    organization_id = serializers.IntegerField()
    species_id = serializers.IntegerField()
    country_id = serializers.IntegerField()
    planting_cost = serializers.DecimalField(max_digits=12, decimal_places=2)
    is_native = serializers.BooleanField()
    updated_at = serializers.SerializerMethodField()

    class Meta:
        model = AssignedSpecies
        fields = ['organization_id', 'species_id', 'country_id', 'planting_cost', 'is_native', 'updated_at']

        def get_updated_at(self, obj):
            return obj.updated_at.strftime("%Y-%m-%d %H:%M:%S.%f") if obj.updated_at else None

    def validate(self, data):

        try:
            data['planting_organization'] = PlantingOrganization.objects.get(id=data['organization_id'])
        except PlantingOrganization.DoesNotExist:
            raise serializers.ValidationError("Planting organization does not exist.")

        try:
            data['species'] = Species.objects.get(id=data['species_id'])
        except Species.DoesNotExist:
            raise serializers.ValidationError("Species does not exist.")

        try:
            data['country'] = Country.objects.get(id=data['country_id'])
        except Country.DoesNotExist:
            raise serializers.ValidationError("Country does not exist.")

        if data['country'] not in data['planting_organization'].countries.all():
            raise serializers.ValidationError("The specified country is not associated with the planting organization.")

        return data



class SpeciesView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = SpeciesSerializer(data=request.data)

        if not serializer.is_valid():
            return failure(serializer.errors, error_code=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data

        try:
            species = Species.objects.create(
                common_name=validated_data["common_name"],
                botanical_name=validated_data["botanical_name"],
                iucn_status=validated_data["iucn_status"],
                created_by=request.user,
                updated_by=request.user, # Ensure request.user is authenticated
            )

            return success(
                "Species added successfully",
                {"species_id": species.id}
            )

        except IntegrityError:
            return failure(
                "A species with the same name or botanical name already exists.",
                error_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return failure(
                f"An error occurred: {str(e)}",
                error_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def get(self, request, species_id=None):
        """Fetch paginated species list or a single species by ID"""
        per_page = int(request.GET.get("per_page", 10))

        # --- Fetch single species by ID ---
        if species_id:
            try:
                species = Species.objects.get(id=species_id)
                serializer = SpeciesListingSerializer(species, context={"detailed": True})
                return success("Species details fetched successfully", serializer.data)
            except Species.DoesNotExist:
                return failure("Species not found", error_code=400)
            except Exception as e:
                return failure(f"An error occurred: {str(e)}", error_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # --- Common filter params (same as Trees) ---
        species_id_param = request.GET.get("species_id")
        organization_id = request.GET.get("organization_id")
        sponsor_id = request.GET.get("sponsor_id")
        planted_by = request.GET.get("planted_by")
        planted_from = request.GET.get("planted_from")
        planted_to = request.GET.get("planted_to")
        organization_name = request.GET.get("organisation_name")
        minted_status = request.GET.get("minted_status")
        sponsor_type = request.GET.get("sponsor_type")
        iucn_id = request.GET.get("iucn_id")
        search_query = request.GET.get("species_name", "").strip()

        # --- Base Tree queryset ---
        tree_qs = Tree.objects.all().select_related("species", "planting_organization", "sponsor")

        if organization_name:
            tree_qs = tree_qs.filter(planting_organization__name__icontains=organization_name)
        if planted_from:
            tree_qs = tree_qs.filter(created_at__date__gte=planted_from)
        if planted_to:
            tree_qs = tree_qs.filter(created_at__date__lte=planted_to)
        if species_id_param:
            tree_qs = tree_qs.filter(species_id=species_id_param)
        if organization_id:
            tree_qs = tree_qs.filter(planting_organization_id=organization_id)
        if sponsor_id:
            tree_qs = tree_qs.filter(sponsor_id=sponsor_id)
        if planted_by:
            tree_qs = tree_qs.filter(created_by_id=planted_by)
        if minted_status:
            tree_qs = tree_qs.filter(minting_state=minted_status.upper())
        if sponsor_type:
            tree_qs = tree_qs.filter(sponsor__type=sponsor_type)
        if iucn_id:
            tree_qs = tree_qs.filter(species__iucn_status=iucn_id)

        # --- Decide whether to use filtered tree species OR all species ---
        apply_filters = any([
            species_id_param, organization_id, sponsor_id, planted_by,
            planted_from, planted_to, organization_name, minted_status,
            sponsor_type, iucn_id
        ])

        if apply_filters:
            # Get only species linked to filtered trees
            filtered_species_ids = tree_qs.values_list("species_id", flat=True).distinct()
            species_qs = Species.objects.filter(id__in=filtered_species_ids)
        else:
            # No filter → return all species
            species_qs = Species.objects.all()

        # --- search filter on species name ---
        if search_query:
            species_qs = species_qs.filter(
                Q(common_name__icontains=search_query) |
                Q(botanical_name__icontains=search_query)
            )

        species_qs = species_qs.order_by("-created_at")

        # --- Pagination ---
        paginator = PageNumberPagination()
        paginator.page_size = per_page
        paginated_species = paginator.paginate_queryset(species_qs, request)

        serializer = SpeciesListingSerializer(
            paginated_species, many=True, context={"detailed": False}
        )

        return success(
            "Species list fetched successfully",
            {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "data": serializer.data,
            }
        )

class AssignSpeciesView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request):
        serializer = AssignSpeciesSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            try:
                assigned_species, created = AssignedSpecies.objects.get_or_create(
                    planting_organization=validated_data['planting_organization'],
                    species=validated_data['species'],
                    country=validated_data['country'],
                    defaults={
                        'planting_cost_usd': validated_data['planting_cost'],
                        'is_native': validated_data['is_native'],
                        'created_by': request.user,
                        'updated_by': request.user,
                    }
                )
                if not created:
                    return failure("This species is already assigned to the organization in the specified country.", error_code=status.HTTP_400_BAD_REQUEST)
                return success("Species assigned successfully", {})
            except IntegrityError:
                return failure("An error occurred while assigning the species.", error_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return failure(serializer.errors, error_code=status.HTTP_400_BAD_REQUEST)


class SpeciesCommonNameListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Fetch unique common names from Species table with their IDs"""
        species_qs = Species.objects.values("id", "common_name","botanical_name").distinct()

        return Response(list(species_qs))

class SpeciesDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        species_id = request.data.get("species_id")

        if not species_id:
            return failure("Species ID is required", error_code=status.HTTP_400_BAD_REQUEST)

        if AssignedSpecies.objects.filter(species__id=species_id).exists() or Tree.objects.filter(species__id=species_id).exists():
            return failure("Species already assigned to some trees", error_code=status.HTTP_400_BAD_REQUEST)

        try:
            species = Species.objects.get(id=species_id)
            species.delete()
            return success("Species deleted successfully", {"species_id": species_id})
        except Species.DoesNotExist:
            return failure(f"Species : {species_id} not found", error_code=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return failure(f"An error occurred: {str(e)}", error_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SpeciesIucnNameListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        counts = (
            Species.objects.values("iucn_status")
            .annotate(count=Count("id"))
        )
        count_map = {item["iucn_status"]: item["count"] for item in counts}
        data = [
            {
                "id": status.value,
                "name": status.name.replace("_", " ").title(),
                "count": count_map.get(status.value, 0)
            }
            for status in Species.IucnStatus
        ]
        return Response(data)

class OrganizationSpeciesDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        org_id = request.data.get("organization_id")
        species_id = request.data.get("species_id")

        if not org_id or not species_id:
            return failure("Both 'organization_id' and 'species_id' are required.",
                           error_code=status.HTTP_400_BAD_REQUEST)

        try:
            assigned_species_qs = AssignedSpecies.objects.filter(
                planting_organization_id=org_id,
                species_id=species_id
            )

            if not assigned_species_qs.exists():
                return failure("No assigned species found for the given organization and species.")

            count, _ = assigned_species_qs.delete()

            return success(f"{count} assigned species record(s) deleted successfully", {
                "organization_id": org_id,
                "species_id": species_id
            })
        except Exception as e:
            return failure(f"An error occurred: {str(e)}", error_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
