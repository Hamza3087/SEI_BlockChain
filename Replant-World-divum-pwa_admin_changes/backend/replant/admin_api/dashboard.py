from decimal import Decimal

from django.db.models import Count, Avg, Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from replant.models import Sponsor, User, PlantingOrganization, Tree, Species  # Assuming `User` model exists
from replant.response import success, failure

from replant.models import AssignedSpecies


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        dashboard_type = request.query_params.get("type")
        if dashboard_type not in ['people','tree'] or dashboard_type is None:
            return failure("Valid dashboard Type is required")

        if dashboard_type == "people":
            organization_count = PlantingOrganization.objects.count()
            sponsor_count = Sponsor.objects.count()
            user_count = User.objects.filter(role="PLANTER").count()

            data = {
                "organization_count": organization_count,
                "sponsor_count": sponsor_count,
                "user_count": user_count,
            }
        else :
            trees_to_review_count = Tree.objects.filter(review_state="PENDING").count()
            approved_trees_count = Tree.objects.filter(review_state="APPROVED").count()
            rejected_trees_count = Tree.objects.filter(review_state="REJECTED").count()
            minted_trees_count = Tree.objects.filter(sponsor_id__isnull=False).count()
            total_trees = Tree.objects.count()
            species_count = Species.objects.count()

            data = {
                "trees_to_review": trees_to_review_count,
                "approved_trees": approved_trees_count,
                "rejected_trees": rejected_trees_count,
                "species_count" : species_count,
                "total_trees" : total_trees,
                "minted_trees" : minted_trees_count
            }

        return success("Dashboard data retrieved successfully", data)


class AdminStatisticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):

        total_trees = Tree.objects.count() or 1

        # Approved trees
        approved_trees_count = Tree.objects.filter(review_state="APPROVED").count()
        approved_percentage = round((approved_trees_count / total_trees) * 100, 2)

        # Planted trees
        planted_trees = Tree.objects.filter(minting_state="MINTED").count()

        # Average planting cost
        # avg_cost = Tree.objects.aggregate(avg=Avg("planting_cost_usd"))["avg"] or Decimal("0.00")
        avg_cost = AssignedSpecies.objects.aggregate(
            avg=Avg("planting_cost_usd")
        )["avg"] or Decimal("0.00")
        avg_cost = round(avg_cost, 2)
        #
        # conversion_rate = Decimal("0.012")
        # avg_cost_local = avg_cost / conversion_rate
        # avg_cost_local = round(avg_cost_local, 2)

        # total_cost = Tree.objects.aggregate(total=Sum("planting_cost_usd"))["total"] or Decimal("0.00")
        total_cost = AssignedSpecies.objects.aggregate(
            total=Sum("planting_cost_usd")
        )["total"] or Decimal("0.00")
        total_cost = round(total_cost, 2)

        # Total NFT value
        total_nft_usd = Tree.objects.filter(minting_state="MINTED").aggregate(
            total=Sum("planting_cost_usd")
        )["total"] or Decimal("0.00")
        total_nft_usd_str = f"${round(total_nft_usd / 1000, 2)}k"

        iucn_map = dict(Species.IucnStatus.choices)
        # IUCN status distribution
        iucn_qs = Species.objects.values("iucn_status").annotate(count=Count("id"))
        total_species = sum(item["count"] for item in iucn_qs) or 1
        iucn_status = {
            iucn_map.get(item["iucn_status"], item["iucn_status"]):
                round((item["count"] / total_species) * 100, 2)
            for item in iucn_qs
        }

        # Species mix in trees (how many trees per species, %)
        species_qs = Tree.objects.values("species__common_name").annotate(count=Count("id"))
        total_tree_species = sum(item["count"] for item in species_qs) or 1
        species_mix = {
            item["species__common_name"]: round((item["count"] / total_tree_species) * 100, 2)
            for item in species_qs
        }

        return Response({
            "message": "Statistics data retrieved successfully",
            "content": {
                "approved_trees": approved_percentage,
                "planted_trees": planted_trees,
                "average_cost": f"${avg_cost}",
                "total_nft": total_nft_usd_str,
                "iucn_status": iucn_status,
                "species_mix": species_mix,
                "avg_cost_usd" : total_cost
            }
        })

class AdminDashboardStatisticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # --- Extract filter params ---
        species_id = request.GET.get("species_id")
        organization_id = request.GET.get("organization_id")
        sponsor_id = request.GET.get("sponsor_id")
        planted_by = request.GET.get("planted_by")
        planted_from = request.GET.get("planted_from")
        planted_to = request.GET.get("planted_to")
        organization_name = request.GET.get("organisation_name")
        minted_status = request.GET.get("minted_status")
        sponsor_type = request.GET.get("sponsor_type")
        iucn_id = request.GET.get("iucn_id")

        # --- Base queryset ---
        tree_qs = Tree.objects.all().select_related(
            "species", "planting_organization", "sponsor"
        )

        if species_id:
            tree_qs = tree_qs.filter(species_id=species_id)

        if organization_id:
            tree_qs = tree_qs.filter(planting_organization_id=organization_id)
        if sponsor_id:
            tree_qs = tree_qs.filter(sponsor_id=sponsor_id)
        if planted_by:
            tree_qs = tree_qs.filter(created_by_id=planted_by)
        if planted_from:
            tree_qs = tree_qs.filter(created_at__date__gte=planted_from)
        if planted_to:
            tree_qs = tree_qs.filter(created_at__date__lte=planted_to)
        if organization_name:
            tree_qs = tree_qs.filter(
                planting_organization__name__icontains=organization_name
            )
        if minted_status:
            tree_qs = tree_qs.filter(minting_state=minted_status.upper())
        if sponsor_type:
            tree_qs = tree_qs.filter(sponsor__type=sponsor_type)
        if iucn_id:
            tree_qs = tree_qs.filter(species__iucn_status=iucn_id)

        # --- Tree counts ---
        total_trees = tree_qs.count()

        if total_trees > 0:
            approved_trees_count = tree_qs.filter(review_state="APPROVED").count()
            approved_percentage = round((approved_trees_count / total_trees) * 100, 2)

            planted_trees = tree_qs.filter(minting_state="MINTED").count()

            # --- Planting cost ---
            org_ids = tree_qs.values_list("planting_organization_id", flat=True).distinct()

            avg_cost = (
                AssignedSpecies.objects.filter(
                    planting_organization_id__in=org_ids
                ).aggregate(avg=Avg("planting_cost_usd"))["avg"]
                or Decimal("0.00")
            )
            avg_cost = round(avg_cost, 2)

            total_cost = (
                AssignedSpecies.objects.filter(
                    planting_organization_id__in=org_ids
                ).aggregate(total=Sum("planting_cost_usd"))["total"]
                or Decimal("0.00")
            )
            total_cost = round(total_cost, 2)

            total_nft_usd = (
                tree_qs.filter(minting_state="MINTED").aggregate(
                    total=Sum("planting_cost_usd")
                )["total"]
                or Decimal("0.00")
            )
            total_nft_usd_str = f"${round(total_nft_usd / 1000, 2)}k"

            # --- IUCN distribution ---
            iucn_map = dict(Species.IucnStatus.choices)
            iucn_qs = tree_qs.values("species__iucn_status").annotate(count=Count("species_id"))
            total_species = sum(item["count"] for item in iucn_qs) or 1
            iucn_status = {
                iucn_map.get(item["species__iucn_status"], item["species__iucn_status"]):
                    round((item["count"] / total_species) * 100, 2)
                for item in iucn_qs
            }

            # --- Species mix ---
            species_qs = tree_qs.values("species__common_name").annotate(count=Count("id"))
            total_tree_species = sum(item["count"] for item in species_qs) or 1
            species_mix = {
                item["species__common_name"]: round((item["count"] / total_tree_species) * 100, 2)
                for item in species_qs
            }

        else:
            # ✅ No trees found for this filter
            approved_percentage = 0.0
            planted_trees = 0
            avg_cost = Decimal("0.00")
            total_cost = Decimal("0.00")
            total_nft_usd_str = "$0.00k"
            iucn_status = {}
            species_mix = {}

        return Response({
            "message": "Statistics data retrieved successfully",
            "content": {
                "approved_trees": approved_percentage,
                "planted_trees": planted_trees,
                "average_cost": f"${avg_cost}",
                "total_nft": total_nft_usd_str,
                "iucn_status": iucn_status,
                "species_mix": species_mix,
                "avg_cost_usd": total_cost
            }
        })
