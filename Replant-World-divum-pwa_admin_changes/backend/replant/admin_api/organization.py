from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import get_object_or_404
from rest_framework.views import APIView
from rest_framework import status
from django.utils import timezone
from replant.pagination import PageNumberPagination
from replant.response import failure, success
from django.db.utils import IntegrityError
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework import serializers
from replant.models import PlantingOrganization, Country, Species, AssignedSpecies, Tree
from rest_framework.response import Response

from replant.models import User

from replant.models import Passcode

import env


class OrganizationSerializer(serializers.Serializer):
    organization_name = serializers.CharField(max_length=255, required=True)
    contact_person_email = serializers.EmailField(required=True)
    contact_person_full_name = serializers.CharField(max_length=255, required=True)
    country_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1), required=True
    )

    def validate_country_ids(self, value):
        """Ensure provided country IDs exist in the database."""
        if not Country.objects.filter(id__in=value).exists():
            raise serializers.ValidationError("Invalid country IDs provided")
        return value


class DetailedAssignedSpeciesSerializer(serializers.ModelSerializer):
    species_id = serializers.IntegerField(source="species.id")
    species_name = serializers.CharField(source="species.common_name")
    botanical_name = serializers.CharField(source="species.botanical_name")
    iucn_status = serializers.SerializerMethodField()
    is_native = serializers.BooleanField()
    planting_cost_usd = serializers.DecimalField(max_digits=10, decimal_places=2)
    # species_assigned_date = serializers.DateTimeField(source="created_at", format="%Y-%m-%dT%H:%M:%S.%fZ")
    species_assigned_date = serializers.SerializerMethodField()

    class Meta:
        model = AssignedSpecies
        fields = [
            "species_id",
            "species_name",
            "botanical_name",
            "iucn_status",
            "is_native",
            "planting_cost_usd",
            "species_assigned_date"
        ]

    def get_iucn_status(self, obj):
        return obj.species.get_iucn_status_display() if obj.species else None

    def get_species_assigned_date(self, obj):
        """Return assigned species creation timestamp in ISO 8601 format with microseconds."""
        return obj.created_at.isoformat() if obj.created_at else None

class OrganizationDetailSerializer(serializers.ModelSerializer):
    countries = serializers.SerializerMethodField()
    species = serializers.SerializerMethodField()
    created_on = serializers.SerializerMethodField()
    updated_on = serializers.SerializerMethodField()
    no_of_trees = serializers.SerializerMethodField()
    approved_trees = serializers.SerializerMethodField()
    available_to_mint = serializers.SerializerMethodField()

    class Meta:
        model = PlantingOrganization
        fields = [
            "id",
            "name",
            "contact_person_full_name",
            "contact_person_email",
            "species",
            "countries",
            "created_on",
            "updated_on",
            "no_of_trees",
            "approved_trees",
            "available_to_mint"
        ]

    def get_no_of_trees(self, obj):
        return Tree.objects.filter(planting_organization=obj).count()

    def get_approved_trees(self, obj):
        return Tree.objects.filter(planting_organization=obj, review_state="APPROVED").count()

    def get_available_to_mint(self, obj):
        return Tree.objects.filter(
            planting_organization=obj,
            review_state="APPROVED"
        ).filter(
            Q(minting_state__isnull=True) |
            Q(minting_state="") |
            Q(minting_state="PENDING")
        ).count()

    def get_countries(self, obj):
        unique_countries = list(set(obj.countries.values_list("name", flat=True)))
        return unique_countries

    def get_species(self, obj):
        assigned_species = AssignedSpecies.objects.filter(planting_organization=obj)

        if self.context.get("detailed", False):
            species_data = DetailedAssignedSpeciesSerializer(assigned_species, many=True).data
            unique_species = {
                species["species_name"]: species for species in species_data
            }.values()
            return list(unique_species)

        unique_species_names = list(set(assigned_species.values_list("species__common_name", flat=True)))
        return unique_species_names

    # def get_created_on(self, obj):
    #     return int(obj.created_at.timestamp()) if obj.created_at else None
    #
    # def get_updated_on(self, obj):
    #     return int(obj.updated_at.timestamp()) if obj.updated_at else None

    def get_created_on(self, obj):
        """Return timestamp in ISO 8601 format with microseconds."""
        return obj.created_at.isoformat() if obj.created_at else None

    def get_updated_on(self, obj):
        """Return latest updated_at from AssignedSpecies linked to the organization,
        or fallback to the organization's updated_at if not available."""
        latest_assigned_species = AssignedSpecies.objects.filter(planting_organization=obj).order_by(
            '-updated_at').first()

        if latest_assigned_species and latest_assigned_species.updated_at:
            return latest_assigned_species.updated_at.isoformat()

        return obj.updated_at.isoformat() if obj.updated_at else None

class OrganizationEditView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, organization_id):
        serializer = OrganizationSerializer(data=request.data)
        if not serializer.is_valid():
            return failure(serializer.errors, error_code=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data

        try:
            # Get the existing organization
            try:
                organization = PlantingOrganization.objects.get(id=organization_id)
            except PlantingOrganization.DoesNotExist:
                return failure("Organization not found", error_code=status.HTTP_404_NOT_FOUND)

            # Check for duplicate name (excluding the current one)
            if PlantingOrganization.objects.filter(
                name=validated_data["organization_name"]
            ).exclude(id=organization_id).exists():
                return failure(
                    "An organization with this name already exists.",
                    error_code=status.HTTP_400_BAD_REQUEST
                )

            # Update fields
            organization.name = validated_data["organization_name"]
            organization.contact_person_email = validated_data["contact_person_email"]
            organization.contact_person_full_name = validated_data["contact_person_full_name"]
            organization.updated_by = request.user
            organization.updated_at = timezone.now()
            organization.save()

            # Update countries (ManyToMany)
            organization.countries.set(
                Country.objects.filter(id__in=validated_data["country_ids"])
            )

            return success("Organization updated successfully", {"organization_id": organization.id})

        except Exception as e:
            return failure(
                f"An error occurred: {str(e)}",
                error_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrganizationView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = OrganizationSerializer(data=request.data)
        if not serializer.is_valid():
            return failure(serializer.errors, error_code=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data

        try:
            organization = PlantingOrganization.objects.create(
                name=validated_data["organization_name"],
                contact_person_email=validated_data["contact_person_email"],
                contact_person_full_name=validated_data["contact_person_full_name"],
                created_by=request.user,
                updated_by=request.user
            )
            organization.countries.set(Country.objects.filter(id__in=validated_data["country_ids"]))

            return success("Organization created successfully", {"organization_id": organization.id})

        except IntegrityError:
            return failure(
                "An organization with this name already exists.",
                error_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return failure(
                f"An error occurred: {str(e)}",
                error_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def get(self, request, organization_id=None):
        org_name = request.GET.get("organisation_name", "").strip()
        per_page = int(request.GET.get("per_page", 10))
        country_id = request.GET.get("country_id")
        species_id = request.GET.get("species_id")

        if organization_id:
            try:
                organization = PlantingOrganization.objects.prefetch_related("countries").get(id=organization_id)
                serializer = OrganizationDetailSerializer(organization, context={"detailed": True})
                return success("Organization details fetched successfully", serializer.data)
            except PlantingOrganization.DoesNotExist:
                return failure("Organization not found", error_code=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return failure(f"An error occurred: {str(e)}", error_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

        organizations = PlantingOrganization.objects.prefetch_related("countries").order_by("-created_at")

        if org_name:
            organizations = organizations.filter(Q(name__icontains=org_name))

        if country_id or species_id:
            assigned_qs = AssignedSpecies.objects.all()

            if country_id:
                assigned_qs = assigned_qs.filter(country_id=country_id)
            if species_id:
                assigned_qs = assigned_qs.filter(species_id=species_id)

            filtered_org_ids = assigned_qs.values_list("planting_organization_id", flat=True).distinct()
            organizations = organizations.filter(id__in=filtered_org_ids)

        paginator = PageNumberPagination()
        paginator.page_size = per_page
        paginated_organizations = paginator.paginate_queryset(organizations, request)

        serializer = OrganizationDetailSerializer(paginated_organizations, many=True, context={"detailed": False})

        return success("Organization details fetched successfully",
                       {
                           "count": paginator.page.paginator.count,
                           "next": paginator.get_next_link(),
                           "previous": paginator.get_previous_link(),
                           "data": serializer.data
                       }
                       )

class OrganizationNameListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Fetch unique organization names with IDs. If assigned_organization=true, filter only those assigned to users."""
        assigned_only = request.query_params.get("assigned_organization", "false").lower() == "true"

        if assigned_only:

            assigned_org_ids = User.objects.filter(
                planting_organization_id__isnull=False
            ).values_list("planting_organization_id", flat=True).distinct()

            organization_qs = PlantingOrganization.objects.filter(
                id__in=assigned_org_ids
            ).values("id", "name").distinct()
        else:
            organization_qs = PlantingOrganization.objects.values("id", "name").distinct()

        return Response(list(organization_qs))


class TreeCountryView(APIView):
    def get(self, request):
        org_id = request.query_params.get('organization_id')
        if not org_id:
            return failure("organization_id is required")

        organization = get_object_or_404(PlantingOrganization, id=org_id)

        countries = Country.objects.filter(
            planting_organizations__id=organization.id
        ).distinct()

        if not countries.exists():
            return success("Organization countries not available", {})

        data = [{"id": country.id, "name": country.name} for country in countries]
        return Response(data)


class AssignedSpeciesUsdSerializer(serializers.ModelSerializer):
    species_id = serializers.IntegerField(source="species.id")

    class Meta:
        model = AssignedSpecies
        fields = ["species_id", "planting_cost_usd"]


class OrganizationUsdView(APIView):
    def get(self, request, organization_id=None):
        if organization_id:
            try:
                organization = PlantingOrganization.objects.get(id=organization_id)

                assigned_species = AssignedSpecies.objects.filter(
                    planting_organization_id=organization_id
                ).select_related("species")

                serializer = AssignedSpeciesUsdSerializer(assigned_species, many=True)
                data = {
                    "id": organization.id,
                    "species": serializer.data
                }

                return success("Organization usd details fetched successfully", data)
            except PlantingOrganization.DoesNotExist:
                return failure("Organization not found", error_code=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return failure(f"An error occurred: {str(e)}", error_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return failure("Organization ID is required", error_code=status.HTTP_400_BAD_REQUEST)


class GenerateSignupLinkView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, org_id):
        planting_org = get_object_or_404(PlantingOrganization, pk=org_id)

        if not request.user.has_perm('replant.change_plantingorganization'):
            raise PermissionDenied("You do not have permission to generate signup links.")

        valid_passcode = Passcode.objects.get_latest_org_valid(planting_org)
        print("valid_passcode:", str(valid_passcode.code) if valid_passcode else "None")
        if valid_passcode:
            signup_link = f"{env.UPLOAD_APP_URL}/signup-org?code={valid_passcode.code}"

        else:

            planting_org.passcodes.generate(by=request.user)
            planting_org.refresh_from_db()
            signup_link = planting_org.valid_signup_link  # assume model has this property

        return success('Signup Link generated successfully',{
            "organization": planting_org.name,
            "signup_link": signup_link,
        })