from datetime import datetime
from decimal import Decimal

from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView
from rest_framework.pagination import PageNumberPagination
from replant.models import Sponsor
from replant.response import success
from rest_framework.permissions import IsAuthenticated

from replant.models import Tree
from replant.response import failure

from replant import sdk

from replant.models import PlantingOrganization

from replant.admin.sponsor import format_usd
from django.db.models import Q, F
from rest_framework.response import Response
from rest_framework.views import APIView

from replant.models import TreeToMint

from replant.tests.conftest import planting_organization

from replant.api import status

from replant.integrations import sendgrid
from replant.integrations.sendgrid import SendGridAPIError

from replant.admin import utils
from replant.models import User


class SponsorSerializer(serializers.ModelSerializer):
    contact_person = serializers.CharField(source="contact_person_email")
    # nft_ordered_usd = serializers.DecimalField(max_digits=12, decimal_places=2)
    nft_ordered = serializers.SerializerMethodField()
    nft_ordered_usd = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()

    class Meta:
        model = Sponsor
        fields = [
            "id", "name", "contact_person", "contact_person_email", "type",
            "wallet_address", "nft_ordered", "nft_ordered_usd"
        ]

    def get_type(self, obj):
        return obj.get_type_display().title() if hasattr(obj, "get_type_display") else obj.type.title()

    def get_nft_ordered(self, obj):
        assigned_trees = obj.assigned_trees or "-"
        nft_ordered = obj.nft_ordered or "-"
        return f"{assigned_trees} / {nft_ordered}"

    # def get_nft_ordered_usd(self, obj):
    #     assigned_trees_usd = obj.assigned_trees_usd or "-"
    #     nft_ordered_usd = obj.nft_ordered_usd or "-"
    #     return f"{format_usd(assigned_trees_usd)} / {format_usd(nft_ordered_usd)}"

    def get_nft_ordered_usd(self, obj):
        def format_usd(value):
            return f"${value:.2f}" if value is not None else "-"

        assigned_trees_usd = format_usd(obj.assigned_trees_usd)
        nft_ordered_usd = format_usd(obj.nft_ordered_usd)
        return f"{assigned_trees_usd} / {nft_ordered_usd}"


class SponsorPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "per_page"
    max_page_size = 100

class SponsorListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SponsorSerializer
    pagination_class = SponsorPagination

    def get_queryset(self):
        queryset = Sponsor.objects.all()

        sponsor_name = self.request.GET.get("sponsor_name")
        sponsor_type = self.request.GET.get("type")
        nft_ordered = self.request.GET.get("nft_ordered")
        assigned_trees = self.request.GET.get("assigned_trees")
        need_tree_assign = self.request.GET.get("need_tree_assign")

        if sponsor_name:
            queryset = queryset.filter(name__icontains=sponsor_name)

        if sponsor_type:
            queryset = queryset.filter(type__iexact=sponsor_type)

        if nft_ordered:
            try:
                nft_ordered = int(nft_ordered)
                queryset = queryset.filter(nft_ordered__gte=nft_ordered)
            except ValueError:
                pass  # ignore invalid input

        if assigned_trees:
            try:
                assigned_trees = int(assigned_trees)
                queryset = queryset.filter(assigned_trees__gte=assigned_trees)
            except ValueError:
                pass

        if need_tree_assign:
            need_tree_assign = need_tree_assign.lower()
            if need_tree_assign != "all":
                trees_filter = Q(assigned_trees__lt=F("nft_ordered")) | Q(
                    assigned_trees_usd__lt=F("nft_ordered_usd")
                )
                if need_tree_assign == "yes":
                    queryset = queryset.filter(trees_filter)
                elif need_tree_assign == "no":
                    queryset = queryset.exclude(trees_filter)

        return queryset.order_by("-id")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return success("Sponsors fetched successfully",
                           {
                               "count": self.paginator.page.paginator.count,
                               "next": self.paginator.get_next_link(),
                               "previous": self.paginator.get_previous_link(),
                               "data": serializer.data
                           })

        serializer = self.get_serializer(queryset, many=True)
        return success("Sponsors fetched successfully",
                       {
                           "count": len(queryset),
                           "next": None,
                           "previous": None,
                           "data": serializer.data
                       })



class TreesStatusView(ListAPIView):
    """
    API to fetch trees based on status:
    - `status=assigned`: Fetch trees assigned to a specific sponsor (requires `sponsor_id`).
    - `status=available`: Fetch trees that are available for sponsorship.
    - Additional filtering based on assignment needs and cost filtering.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = SponsorPagination

    def get_queryset(self):
        status = self.request.query_params.get("status")
        sponsor_id = self.request.query_params.get("sponsor_id")
        planting_org_id = self.request.query_params.get("planting_org_id")  # Optional org filter
        exact_tree_cost = self.request.query_params.get("exact_tree_cost")  # Optional cost filter
        max_tree_cost = self.request.query_params.get("max_tree_cost")  # Optional cost filter

        queryset = Tree.objects.all().select_related("species", "planting_organization")

        if status == "assigned":
            if not sponsor_id:
                return Tree.objects.none()
            try:
                sponsor_id = int(sponsor_id)
            except (ValueError, TypeError):
                return failure("Invalid sponsor_id")

            # Fetch assigned trees for a sponsor
            queryset = queryset.filter(sponsor__id=sponsor_id)

        elif status == "available":
            queryset = queryset.filter(
                sponsor__isnull=True, review_state=Tree.ReviewState.APPROVED
            )

            # Apply Planting Organization filter if provided
            if planting_org_id:
                queryset = queryset.filter(planting_organization_id=planting_org_id)

            # Apply cost filters if provided
            if exact_tree_cost:
                queryset = queryset.filter(planting_cost_usd=exact_tree_cost)
            elif max_tree_cost:
                queryset = queryset.filter(planting_cost_usd__lte=max_tree_cost)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)

        # Dynamically defining the serializer class
        class DynamicTreeSerializer(serializers.ModelSerializer):
            class Meta:
                model = Tree
                fields = ["id", "species", "latitude", "longitude", "minting_state"]

        if page is not None:
            serializer = DynamicTreeSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)  # Correct pagination response

        serializer = DynamicTreeSerializer(queryset, many=True)
        message = "Available trees fetched successfully" if request.query_params.get(
            "status") == "available" else "Sponsor's assigned trees fetched successfully"

        return success(message, {
            "count": queryset.count(),
            "data": serializer.data
        })

class SponsorCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a Sponsor instance."""

    class Meta:
        model = Sponsor
        fields = ["name", "type", "wallet_address", "contact_person_email", "nft_ordered", "nft_ordered_usd",]

    def validate(self, attrs):
        """Ensure both nft_ordered and nft_ordered_usd are not set simultaneously."""
        nft_ordered = attrs.get("nft_ordered")
        nft_ordered_usd = attrs.get("nft_ordered_usd")

        if nft_ordered is not None and nft_ordered_usd is not None:
            raise serializers.ValidationError(
                "Cannot specify NFT quantity and USD value at the same time."
            )
        return attrs

    # def validate_wallet_address(self, value):
    #     """Validate SEI wallet address using SDK."""
    #     try:
    #         sdk.validate_sei_address(value)
    #     except ValueError as e:
    #         raise serializers.ValidationError(str(e))
    #     return value

class SponsorCreateOrUpdateView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SponsorCreateSerializer
    queryset = Sponsor.objects.all()

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        data = request.data
        email = data.get("contact_person_email")

        if User.objects.filter(email=email).exists():
            raise ValidationError({"email": "A user with that email already exists."})

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        sponsor = serializer.save()

        user = User.objects.create_user(
            role=User.Role.SPONSOR,
            email=email,
            sponsor=sponsor
        )

        try:
            sendgrid.send_email(
                to=email,
                template_name="email_verification",
                subject="Confirm your email address",
                context={"verification_link": user.get_email_verification_link()},
            )
        except sendgrid.SendGridAPIError:
            raise ValidationError({
                "non_field_errors": ["Sponsor created but email could not be sent. Try again later."]
            })

        return success('Sponsor created successfully.', {"sponsor_id": sponsor.id})

    def put(self, request):
        sponsor_id = request.query_params.get("sponsor_id")
        if not sponsor_id:
            return failure("sponsor_id is required in query parameters.")

        try:
            sponsor = Sponsor.objects.get(id=sponsor_id)
        except Sponsor.DoesNotExist:
            return failure("Sponsor not found.")

        incoming_email = request.data.get("contact_person_email")

        if incoming_email and incoming_email != sponsor.contact_person_email:
            if User.objects.filter(email=incoming_email).exists():
                raise ValidationError({"contact_person_email": "A user with that email already exists."})

        serializer = SponsorCreateSerializer(sponsor, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            sponsor = serializer.save()
            user = User.objects.filter(sponsor=sponsor).first()
            if incoming_email and user:
                user.email = incoming_email
                user.save(update_fields=["email"])
        return success("Sponsor updated successfully.", {"sponsor_id": sponsor.id})


class AssignNFTSerializer(serializers.Serializer):
    sponsor_id = serializers.IntegerField()
    organization_id = serializers.IntegerField()
    no_of_trees = serializers.IntegerField(required=False, allow_null=True)
    amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True
    )
    tree_filter = serializers.ChoiceField(
        choices=["ALL_TREES", "EXACT_COST", "MAX_COST"], required=False, default="ALL_TREES"
    )
    exact_tree_cost = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True
    )
    max_tree_cost = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True
    )

    def validate(self, data):
        sponsor_id = data.get("sponsor_id")
        organization_id = data.get("organization_id")
        no_of_trees = data.get("no_of_trees")
        amount = data.get("amount")
        tree_filter = data.get("tree_filter")
        exact_tree_cost = data.get("exact_tree_cost")
        max_tree_cost = data.get("max_tree_cost")

        if (no_of_trees is None and amount is None) or (no_of_trees is not None and amount is not None):
            raise serializers.ValidationError("Either 'no_of_trees' or 'amount' must be provided, but not both.")

        sponsor = Sponsor.objects.filter(id=sponsor_id).first()
        if not sponsor:
            raise serializers.ValidationError({"sponsor_id": "Sponsor not found."})

        organization = PlantingOrganization.objects.filter(id=organization_id).first()
        if not organization:
            raise serializers.ValidationError({"organization_id": "Organization not found."})

        if not sponsor.is_eligible_to_trees_assignment:
            raise serializers.ValidationError("Sponsor already assigned all ordered trees.")

        if no_of_trees and sponsor.nft_ordered:
            if sponsor.assigned_trees + no_of_trees > sponsor.nft_ordered:
                raise serializers.ValidationError({
                    "no_of_trees": f"Assignment would exceed ordered quantity. Max available: {sponsor.trees_to_assign}"
                })

        # Start with available trees
        trees_qs = Tree.objects.only_awaiting_sponsor().filter(planting_organization=organization)

        # Apply tree filters
        if tree_filter == "EXACT_COST":
            if exact_tree_cost is None:
                raise serializers.ValidationError("Exact tree cost must be provided for EXACT_COST filter.")
            trees_qs = trees_qs.filter(planting_cost_usd=exact_tree_cost)

        if tree_filter == "MAX_COST":
            if max_tree_cost is None:
                raise serializers.ValidationError("Max tree cost must be provided for MAX_COST filter.")
            trees_qs = trees_qs.filter(planting_cost_usd__lte=max_tree_cost)

        trees_count = trees_qs.count()
        if trees_count == 0:
            raise serializers.ValidationError("No available trees matching criteria.")

        # Handle number of trees and amount logic
        if no_of_trees is not None:
            if trees_count < no_of_trees:
                raise serializers.ValidationError(
                    {"no_of_trees": f"Only {trees_count} trees available for assignment."}
                )
        elif amount is not None:
            # Calculate how many trees can be assigned within the given amount
            total = 0
            count = 0
            selected_tree_ids = []
            for tree in trees_qs.order_by("planting_cost_usd", "id"):
                if total + tree.planting_cost_usd <= amount:
                    total += tree.planting_cost_usd
                    count += 1
                    selected_tree_ids.append(tree.id)
                else:
                    break
            if count == 0:
                raise serializers.ValidationError(
                    {"amount": "No trees match the amount provided."}
                )
            data["no_of_trees"] = count

        data["trees_qs"] = trees_qs
        return data

    # def assign_nft(self, validated_data):
    #     sponsor_id = validated_data["sponsor_id"]
    #     no_of_trees = validated_data["no_of_trees"]
    #     trees_qs = validated_data["trees_qs"]
    #
    #     # Get the required number of trees
    #     selected_tree_ids = list(trees_qs.values_list('id', flat=True)[:no_of_trees])
    #
    #     # Bulk update
    #     updated_count = Tree.objects.filter(id__in=selected_tree_ids).update(sponsor_id=sponsor_id)
    #
    #     return updated_count

    def assign_nft(self, validated_data):
        sponsor_id = validated_data["sponsor_id"]
        sponsor = Sponsor.objects.get(id=sponsor_id)
        trees_qs = validated_data["trees_qs"]
        no_of_trees = validated_data["no_of_trees"]

        selected_trees = list(trees_qs.select_for_update().order_by('id')[:no_of_trees])
        selected_tree_ids = [tree.id for tree in selected_trees]

        total_cost = sum(tree.planting_cost_usd for tree in selected_trees)

        updated_count = Tree.objects.filter(id__in=selected_tree_ids).update(sponsor_id=sponsor_id)

        sponsor.assigned_trees += updated_count
        sponsor.assigned_trees_usd += total_cost
        sponsor.save(update_fields=["assigned_trees", "assigned_trees_usd"])

        return updated_count

class AssignNFTView(UpdateAPIView):
    """API to assign NFTs to a sponsor and trees."""
    permission_classes = [IsAuthenticated]
    serializer_class = AssignNFTSerializer

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            assigned_trees = serializer.assign_nft(serializer.validated_data)
            sponsor = Sponsor.objects.get(id=serializer.validated_data["sponsor_id"])

        assigned_trees = serializer.assign_nft(serializer.validated_data)
        return success("NFT assigned successfully", {"assigned_trees": assigned_trees})

class SponsorTreeSerializer(serializers.ModelSerializer):
    botanical_name = serializers.CharField(source="species.botanical_name", default="")
    comman_name = serializers.CharField(source="species.common_name", default="")
    iucn_status = serializers.SerializerMethodField()
    country = serializers.CharField(source="country.name", default="")
    organization = serializers.CharField(source="planting_organization.name", default="")
    planted_by = serializers.SerializerMethodField()
    capture_date = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    planting_cost = serializers.SerializerMethodField()
    nft_collection = serializers.CharField(source="metadata_cid")
    nft_id = serializers.IntegerField()

    class Meta:
        model = Tree
        fields = [
            "image",
            "botanical_name",
            "comman_name",
            "iucn_status",
            "country",
            "location",
            "capture_date",
            "nft_collection",
            "nft_id",
            "organization",
            "planted_by",
            "planting_cost",
        ]

    def get_iucn_status(self, obj):
        return obj.species.get_iucn_status_display() if obj.species and obj.species.iucn_status else ""

    def get_capture_date(self, obj):
        return obj.captured_at.strftime("%b %d, %Y") if obj.captured_at else None

    def get_location(self, obj):
        return f"{obj.latitude}, {obj.longitude}"

    def get_planting_cost(self, obj):
        return f"${obj.planting_cost_usd}"

    def get_planted_by(self, obj):
        return obj.created_by.username if obj.created_by and obj.created_by.username else ""


class SponsorParticularView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SponsorTreeSerializer
    pagination_class = SponsorPagination

    def get_queryset(self):
        sponsor_id = self.kwargs.get("sponsor_id")

        if not Sponsor.objects.filter(id=sponsor_id).exists():
            raise NotFound(f"Sponsor_id: {sponsor_id} not found.")

        queryset = Tree.objects.filter(sponsor_id=sponsor_id)

        search = self.request.GET.get("organisation_name")
        organization_id = self.request.GET.get("organization_id")
        country_id = self.request.GET.get("country_id")

        if search:
            queryset = queryset.filter(planting_organization__name__icontains=search)

        if organization_id:
            queryset = queryset.filter(planting_organization_id=organization_id)

        if country_id:
            queryset = queryset.filter(country_id=country_id)

        return queryset.order_by("-captured_at")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return success("Sponsor details fetched successfully", {
                "count": self.paginator.page.paginator.count,
                "next": self.paginator.get_next_link(),
                "previous": self.paginator.get_previous_link(),
                "data": serializer.data
            })

        serializer = self.get_serializer(queryset, many=True)
        return success("Sponsor details fetched successfully", {
            "count": len(queryset),
            "next": None,
            "previous": None,
            "data": serializer.data
        })

class NftHistorySerializer(serializers.ModelSerializer):
    sponsor_name = serializers.SerializerMethodField()
    sponsor_type = serializers.SerializerMethodField()
    species_name = serializers.SerializerMethodField()
    minting_state = serializers.SerializerMethodField()
    planted_on = serializers.SerializerMethodField()
    organization_name = serializers.CharField(source="planting_organization.name", default="")
    review_state = serializers.SerializerMethodField()
    reviewed_on = serializers.SerializerMethodField()

    class Meta:
        model = Tree
        fields = [
            "nft_id",
            "sponsor_name",
            "sponsor_type",
            "species_name",
            "minting_state",
            "planted_on",
            "organization_name",
            "review_state",
            "reviewed_on"
        ]

    def get_sponsor_name(self, obj):
        return obj.sponsor.name if obj.sponsor else ""

    def get_sponsor_type(self, obj):
        return obj.sponsor.type.capitalize() if obj.sponsor and obj.sponsor.type else ""

    def get_species_name(self, obj):
        if obj.species:
            return f"{obj.species.common_name} ({obj.species.botanical_name})"
        return ""

    def get_minting_state(self, obj):
        return f"Minted - NFT - {obj.nft_id}" if obj.nft_id else obj.minting_state

    def get_planted_on(self, obj):
        return obj.created_at.strftime("%b %d, %Y") if obj.created_at else None

    def get_reviewed_on(self, obj):
        return obj.updated_at.strftime("%b %d, %Y") if obj.updated_at else None

    def get_review_state(self, obj):
        if obj.review_state == "approved" and obj.updated_at:
            return f"Approved on {obj.updated_at.strftime('%b %d, %Y')}"
        elif obj.review_state == "rejected" and obj.updated_at:
            return f"Rejected on {obj.updated_at.strftime('%b %d, %Y')}"
        return "Pending"


class NftPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "per_page"
    max_page_size = 100

class NftHistoryView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NftHistorySerializer
    pagination_class = NftPagination

    def get_queryset(self):
        # queryset = Tree.objects.all()
        queryset = Tree.objects.filter(sponsor_id__isnull=False)

        search = self.request.GET.get("search")
        sponsor_type = self.request.GET.get("sponsor_type")
        organization_id = self.request.GET.get("organization_id")
        minting_state = self.request.GET.get("minting_state")
        from_date = self.request.GET.get("from_date")
        to_date = self.request.GET.get("to_date")

        if search:
            queryset = queryset.filter(
                Q(sponsor__name__icontains=search) |
                Q(species__common_name__icontains=search) |
                Q(species__botanical_name__icontains=search) |
                Q(planting_organization__name__icontains=search)
            )

        if sponsor_type:
            queryset = queryset.filter(sponsor__type__iexact=sponsor_type)

        if organization_id:
            queryset = queryset.filter(planting_organization_id=organization_id)

        if minting_state:
            if minting_state.lower() == "pending":
                queryset = queryset.filter(
                    Q(minting_state__iexact="PENDING") |
                    Q(minting_state="") & Q(sponsor__isnull=False)
                )
            else:
                queryset = queryset.filter(minting_state__iexact=minting_state)
        if from_date:
            try:
                from_dt = datetime.strptime(from_date, "%Y-%m-%d")
                queryset = queryset.filter(created_at__date__gte=from_dt.date())
            except ValueError:
                pass

        if to_date:
            try:
                to_dt = datetime.strptime(to_date, "%Y-%m-%d")
                queryset = queryset.filter(created_at__date__lte=to_dt.date())
            except ValueError:
                pass

        return queryset.order_by("-created_at")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return success("NFT history fetched successfully", {
                "count": self.paginator.page.paginator.count,
                "next": self.paginator.get_next_link(),
                "previous": self.paginator.get_previous_link(),
                "data": serializer.data
            })

        serializer = self.get_serializer(queryset, many=True)
        return success("NFT history fetched successfully", {
            "count": len(queryset),
            "next": None,
            "previous": None,
            "data": serializer.data
        })

class MintNFTSerializer(serializers.Serializer):
    tree_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )

class MintNFTView(APIView):
    def post(self, request, *args, **kwargs):

        serializer = MintNFTSerializer(data=request.data)

        if serializer.is_valid():
            # Get the tree IDs from the request
            tree_ids = serializer.validated_data.get("tree_ids")

            # Get the trees to be minted (filter by the IDs)
            trees_to_mint = TreeToMint.objects.filter(id__in=tree_ids)

            if trees_to_mint.exists():
                trees_to_mint.update(minting_state=TreeToMint.MintingState.TO_BE_MINTED)

                # Send a success message
                return success(f"Marked {trees_to_mint.count()} trees to be minted as NFTs.",{})
            else:
                return failure("No trees found with the provided IDs.")
        return failure(serializer.errors)

class SponosorNameListView(APIView):
    def get(self, request):
        sponsors = Sponsor.objects.values('id', 'name')
        seen_names = set()
        unique_sponsors = []
        for sponsor in sponsors:
            if sponsor['name'] not in seen_names:
                unique_sponsors.append(sponsor)
                seen_names.add(sponsor['name'])
        return Response(unique_sponsors)


class AssignTreesSerializer(serializers.Serializer):
    """
    Serializer for assigning trees to sponsors.
    Either no_of_trees or amount must be provided, but not both.
    """
    sponsor_id = serializers.IntegerField()
    organization_id = serializers.IntegerField()
    no_of_trees = serializers.IntegerField(required=False, allow_null=True)
    amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True
    )

    def validate(self, data):
        sponsor_id = data.get("sponsor_id")
        organization_id = data.get("organization_id")
        no_of_trees = data.get("no_of_trees")
        amount = data.get("amount")  # Changed to use "amount" to match the field name
        selected_trees = []
        total_cost = Decimal('0.00')

        # Check that either no_of_trees or amount is provided, but not both
        # if (no_of_trees is None and amount is None) or (no_of_trees is not None and amount is not None):
        #     raise serializers.ValidationError(
        #         "Either 'no_of_trees' or 'amount' must be provided, but not both."
        #     )

        # Validate sponsor exists and is eligible
        try:
            sponsor = Sponsor.objects.get(id=sponsor_id)
        except Sponsor.DoesNotExist:
            raise serializers.ValidationError({"sponsor_id": "Sponsor not found."})

        if not sponsor.is_eligible_to_trees_assignment:
            raise serializers.ValidationError("Sponsor already assigned all ordered trees.")

        # Validate organization exists
        try:
            organization = PlantingOrganization.objects.get(id=organization_id)
        except PlantingOrganization.DoesNotExist:
            raise serializers.ValidationError({"organization_id": "Organization not found."})

        # Start with available trees query
        trees_qs = Tree.objects.only_awaiting_sponsor().filter(planting_organization=organization)

        available_trees_count = trees_qs.count()
        if available_trees_count == 0:
            raise serializers.ValidationError("No available trees matching criteria.")

        # Validate no_of_trees
        if no_of_trees is not None:
            if sponsor.nft_ordered and sponsor.assigned_trees + no_of_trees > sponsor.nft_ordered:
                raise serializers.ValidationError({
                    "no_of_trees": f"Assignment would exceed ordered quantity. Max available: {sponsor.trees_to_assign}"
                })

            if available_trees_count < no_of_trees:
                raise serializers.ValidationError({
                    "no_of_trees": f"Only {available_trees_count} trees available for assignment."
                })

            # Store trees and total cost
            selected_trees = list(trees_qs.order_by('id')[:no_of_trees])
            total_cost = sum(tree.planting_cost_usd for tree in selected_trees)

            # Check if the sponsor has enough remaining USD budget
            if sponsor.nft_ordered_usd and total_cost > sponsor.trees_to_assign_usd:
                raise serializers.ValidationError({
                    "no_of_trees": f"Selected trees cost ${total_cost} which exceeds sponsor's remaining budget of ${sponsor.trees_to_assign_usd}"
                })

        # Process amount
        elif amount is not None:
            if sponsor.nft_ordered_usd and amount > sponsor.trees_to_assign_usd:
                raise serializers.ValidationError({
                    "amount": f"Requested amount ${amount} exceeds sponsor's remaining budget of ${sponsor.trees_to_assign_usd}"
                })

            # Find the maximum number of trees that fit within the amount
            total_cost = Decimal('0.00')
            selected_trees = []

            for tree in trees_qs.order_by('planting_cost_usd', 'id'):
                if total_cost + tree.planting_cost_usd <= amount:
                    total_cost += tree.planting_cost_usd
                    selected_trees.append(tree)
                else:
                    break

            if not selected_trees:
                raise serializers.ValidationError({
                    "amount": f"No trees can be assigned within amount ${amount}. Cheapest tree costs ${trees_qs.order_by('planting_cost_usd').first().planting_cost_usd}"
                })

            # Store the number of trees for assignment
            no_of_trees = len(selected_trees)

            # If sponsor has tree count limit, check if we're exceeding it
            if sponsor.nft_ordered and sponsor.assigned_trees + no_of_trees > sponsor.nft_ordered:
                # Find the maximum number of trees that won't exceed the order limit
                max_trees = sponsor.nft_ordered - sponsor.assigned_trees
                selected_trees = selected_trees[:max_trees]
                no_of_trees = len(selected_trees)
                total_cost = sum(tree.planting_cost_usd for tree in selected_trees)

        # Store everything needed for the assignment
        data["sponsor"] = sponsor
        data["organization"] = organization
        data["selected_trees"] = selected_trees
        data["no_of_trees"] = no_of_trees
        data["total_cost"] = total_cost if 'total_cost' in locals() else sum(
            tree.planting_cost_usd for tree in selected_trees)

        return data


class AssignTreesView(APIView):
    """
    API to assign trees to a sponsor based on provided criteria.
    """
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def put(self, request, *args, **kwargs):
        serializer = AssignTreesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        sponsor = validated_data["sponsor"]
        selected_trees = validated_data["selected_trees"]
        no_of_trees = validated_data["no_of_trees"]
        total_cost = validated_data["total_cost"]

        # Get IDs of selected trees
        tree_ids = [tree.id for tree in selected_trees]

        # Update trees with sponsor
        updated_count = Tree.objects.filter(id__in=tree_ids).update(sponsor=sponsor)

        # Update sponsor totals
        sponsor.assigned_trees += updated_count
        sponsor.assigned_trees_usd += total_cost
        sponsor.save(update_fields=["assigned_trees", "assigned_trees_usd"])

        return success("Trees assigned successfully",
          {
                "assigned_trees": updated_count,
                "assigned_trees_cost": str(total_cost),
                "sponsor_remaining_trees": sponsor.trees_to_assign if sponsor.nft_ordered else None,
                "sponsor_remaining_budget": str(sponsor.trees_to_assign_usd) if sponsor.nft_ordered_usd else None
        })

class AssignTreesSerializer1(serializers.Serializer):
    """
    Serializer for assigning trees to sponsors based on tree count and cost filters.
    """
    sponsor_id = serializers.IntegerField()
    organization_id = serializers.IntegerField()
    no_of_trees = serializers.IntegerField()
    min_cost = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_cost = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    def validate(self, data):
        sponsor_id = data.get("sponsor_id")
        organization_id = data.get("organization_id")
        no_of_trees = data.get("no_of_trees")
        min_cost = data.get("min_cost", Decimal('0.00'))
        max_cost = data.get("max_cost", None)

        selected_trees = []
        total_cost = Decimal('0.00')

        # Validate sponsor
        try:
            sponsor = Sponsor.objects.get(id=sponsor_id)
        except Sponsor.DoesNotExist:
            raise serializers.ValidationError({"sponsor_id": "Sponsor not found."})

        if not sponsor.is_eligible_to_trees_assignment:
            raise serializers.ValidationError("Sponsor already assigned all ordered trees.")

        # Validate organization
        try:
            organization = PlantingOrganization.objects.get(id=organization_id)
        except PlantingOrganization.DoesNotExist:
            raise serializers.ValidationError({"organization_id": "Organization not found."})

        # Filter trees by organization and availability
        trees_qs = Tree.objects.only_awaiting_sponsor().filter(
            planting_organization=organization,
            planting_cost_usd__gte=min_cost
        )

        if max_cost is not None:
            trees_qs = trees_qs.filter(planting_cost_usd__lte=max_cost)

        available_trees_count = trees_qs.count()
        if available_trees_count == 0:
            raise serializers.ValidationError("No trees available within the given cost constraints.")

        if available_trees_count < no_of_trees:
            raise serializers.ValidationError({
                "no_of_trees": f"Only {available_trees_count} trees available for assignment based on cost filter."
            })

        if sponsor.nft_ordered and sponsor.assigned_trees + no_of_trees > sponsor.nft_ordered:
            raise serializers.ValidationError({
                "no_of_trees": f"Assignment would exceed ordered quantity. Max available: {sponsor.trees_to_assign}"
            })

        # Select trees and calculate total cost
        selected_trees = list(trees_qs.order_by('id')[:no_of_trees])
        total_cost = sum(tree.planting_cost_usd for tree in selected_trees)

        if sponsor.nft_ordered_usd and total_cost > sponsor.trees_to_assign_usd:
            raise serializers.ValidationError({
                "no_of_trees": f"Total cost ${total_cost} exceeds sponsor's remaining budget of ${sponsor.trees_to_assign_usd}"
            })

        data.update({
            "sponsor": sponsor,
            "organization": organization,
            "selected_trees": selected_trees,
            "total_cost": total_cost
        })

        return data


class AssignSponosorTreesView(APIView):
    """
    API to assign trees to a sponsor using tree count and optional cost range.
    """
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def put(self, request, *args, **kwargs):
        serializer = AssignTreesSerializer1(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        sponsor = validated_data["sponsor"]
        selected_trees = validated_data["selected_trees"]
        total_cost = validated_data["total_cost"]

        tree_ids = [tree.id for tree in selected_trees]

        updated_count = Tree.objects.filter(id__in=tree_ids).update(sponsor=sponsor)

        sponsor.assigned_trees += updated_count
        sponsor.assigned_trees_usd += total_cost
        sponsor.save(update_fields=["assigned_trees", "assigned_trees_usd"])

        return success("Trees assigned successfully", {
            "assigned_trees": updated_count,
            "assigned_trees_cost": str(total_cost),
            "sponsor_remaining_trees": sponsor.trees_to_assign if sponsor.nft_ordered else None,
            "sponsor_remaining_budget": str(sponsor.trees_to_assign_usd) if sponsor.nft_ordered_usd else None
        })
