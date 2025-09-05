from django.db import IntegrityError
from django.db.models import Q, Max, Count
from django.utils.dateparse import parse_datetime
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from replant.models import Tree
from replant.response import success, failure
from replant import settings
from replant.models import Species
from replant.logging import logger
from replant.models import AssignedSpecies
import csv
from django.http import HttpResponse


class TreeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tree_type = request.GET.get("type", "").lower()
        per_page = int(request.GET.get("per_page", 10))
        report_flag = request.GET.get("report")  # <-- new
        species_id = request.GET.get("species_id")
        organization_id = request.GET.get("organization_id")
        sponsor_id = request.GET.get("sponsor_id")
        planted_by = request.GET.get("planted_by")
        planted_from = request.GET.get("planted_from")
        planted_to = request.GET.get("planted_to")
        organization_name = request.GET.get("organisation_name")

        # For "to_mint" specific filters
        minted_status = request.GET.get("minted_status")
        sponsor_type = request.GET.get("sponsor_type")

        trees = Tree.objects.all().select_related(
            "created_by", "species", "planting_organization", "sponsor"
        )


        # Filter based on `tree_type`
        if tree_type == "pending":
            trees = trees.filter(review_state="PENDING")
        elif tree_type == "approved":
            trees = trees.filter(review_state="APPROVED")
        elif tree_type == "rejected":
            trees = trees.filter(review_state="REJECTED")
        elif tree_type == "to_mint":
            # trees = trees.filter(minting_state="TO_BE_MINTED")
            trees = trees.filter(sponsor_id__isnull=False)
        elif tree_type and tree_type not in ["pending", "approved", "rejected", "to_mint"]:
            return failure("Invalid tree type parameter")

        if organization_name:
            trees = trees.filter(planting_organization__name__icontains=organization_name)

        # Apply filters
        if planted_from:
            trees = trees.filter(created_at__date__gte=planted_from)
        if planted_to:
            trees = trees.filter(created_at__date__lte=planted_to)
        if species_id:
            trees = trees.filter(species_id=species_id)
        if organization_id:
            trees = trees.filter(planting_organization_id=organization_id)
        if sponsor_id:
            trees = trees.filter(sponsor_id=sponsor_id)
        if planted_by :
            trees = trees.filter(created_by_id=planted_by)

        # if tree_type in ["approved", "rejected"] and planted_by:
        #     trees = trees.filter(created_by_id=planted_by)

        if tree_type == "to_mint":
            if minted_status:
                trees = trees.filter(minting_state=minted_status.upper())
            if sponsor_type:
                trees = trees.filter(sponsor__type=sponsor_type)
            if organization_id:
                trees = trees.filter(planting_organization_id=organization_id)

        trees = trees.order_by("-created_at")

        if report_flag == "1":
            paginated_trees = trees  # full queryset without slicing
        else:
            paginator = PageNumberPagination()
            paginator.page_size = per_page
            paginated_trees = paginator.paginate_queryset(trees, request)

        def get_image_url(tree):
            return request.build_absolute_uri(tree.image.url) if tree.image else None

        # Serializer logic based on type
        serialized_data = []

        for tree in paginated_trees:
            base_data = {
                "tree_id": tree.id,
                "species_name": tree.species.common_name,
                "botanical_name" : tree.species.botanical_name,
                "organisation_name": tree.planting_organization.name,
                "planted_by": tree.created_by.username,
                "user_id": tree.created_by.id,
                "planted_on": tree.created_at.isoformat() if tree.created_at else None,
                "minting_state" : tree.minting_state.lower() if tree.minting_state else None,
                "review_state" : tree.review_state.lower() if tree.review_state else None,
                "nft_id" : tree.nft_id or None,
                "sponsor": tree.sponsor.name if tree.sponsor else None
            }

            if tree_type == "pending":
                base_data['image_url'] = get_image_url(tree)
                base_data['location'] = f"{tree.latitude}, {tree.longitude}"


            elif tree_type == "approved":
                base_data.update({
                    "minting_state": tree.minting_state.lower(),
                    # "sponsor": tree.sponsor.name if tree.sponsor else None,
                    "nft_id": tree.nft_id or None,
                    "review_state": tree.updated_at.isoformat() if tree.updated_at else None,
                    "approved_on": tree.updated_at.isoformat() if tree.created_at else None,
                    "comments" : tree.rejection_reason if tree.rejection_reason else None,
                    "image_url": get_image_url(tree)
                })
            elif tree_type == "rejected":
                base_data["rejected_on"] = tree.updated_at.isoformat() if tree.updated_at else None
                base_data['image_url'] = get_image_url(tree)
                base_data['comments'] = tree.rejection_reason if tree.rejection_reason else None

            elif tree_type == "to_mint":
                base_data.update({
                    "minting_state": tree.minting_state.lower(),
                    # "sponsor": tree.sponsor.name if tree.sponsor else None,
                    "approved_on": tree.updated_at.isoformat() if tree.created_at else None,
                })

            serialized_data.append(base_data)

        if report_flag == "1":
            if not serialized_data:
                return failure("No data found to generate report")

            # Format columns → Uppercase + replace underscores with spaces
            fieldnames = [col.upper().replace("_", " ") for col in serialized_data[0].keys()]

            # Create CSV response
            response = HttpResponse(content_type="text/csv")
            response['Content-Disposition'] = 'attachment; filename="trees_report.csv"'

            writer = csv.DictWriter(response, fieldnames=fieldnames)
            writer.writeheader()

            for row in serialized_data:
                # Map the original keys to the formatted fieldnames
                formatted_row = {col.upper().replace("_", " "): value for col, value in row.items()}
                writer.writerow(formatted_row)

            return response

        message = {
            "pending": "Trees to review fetched successfully",
            "approved": "Approved trees fetched successfully",
            "rejected": "Rejected trees fetched successfully",
            "to_mint": "Trees to be minted fetched successfully",
        }.get(tree_type, "Tree list fetched successfully")

        response_data = {
            "count": paginator.page.paginator.count,
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link(),
            "data": serialized_data
        }
        if tree_type == "to_mint":
            mint_info = None
            last_minted_at = None

            total_to_mint = trees.filter(
                minting_state__in=[None, '', 'TO_BE_MINTED']
            ).count()

            total_minted = trees.filter(
                minting_state='MINTED'
            ).count()

            mint_info = f"{total_minted}/{total_to_mint + total_minted} Minted"

            last_minted = trees.filter(
                minting_state='MINTED'
            ).aggregate(latest_minted_at=Max('minted_at'))['latest_minted_at']

            last_minted_at = last_minted.isoformat() if last_minted else None

            response_data["mint_info"] = mint_info
            response_data["last_minted_at"] = last_minted_at

        return success(message, response_data)

class TreeListingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tree_type = request.GET.get("type", "all").lower()
        per_page = int(request.GET.get("per_page", 10))
        report_flag = request.GET.get("report")

        # Common filter params
        species_id = request.GET.get("species_id")
        organization_id = request.GET.get("organization_id")
        sponsor_id = request.GET.get("sponsor_id")
        planted_by = request.GET.get("planted_by")
        planted_from = request.GET.get("planted_from")
        planted_to = request.GET.get("planted_to")
        organization_name = request.GET.get("organisation_name")
        minted_status = request.GET.get("minted_status")
        sponsor_type = request.GET.get("sponsor_type")
        iucn_id = request.GET.get("iucn_id")   # 🔑 new param

        # Base queryset
        base_qs = Tree.objects.all().select_related(
            "created_by", "species", "planting_organization", "sponsor"
        )

        # ---------- Apply common filters (for both listing & dashboard) ----------
        # if organization_name:
        #     base_qs = base_qs.filter(planting_organization__name__icontains=organization_name)
        if planted_from:
            base_qs = base_qs.filter(created_at__date__gte=planted_from)
        if planted_to:
            base_qs = base_qs.filter(created_at__date__lte=planted_to)
        if species_id:
            base_qs = base_qs.filter(species_id=species_id)
        if organization_id:
            base_qs = base_qs.filter(planting_organization_id=organization_id)
        if sponsor_id:
            base_qs = base_qs.filter(sponsor_id=sponsor_id)
        if planted_by:
            base_qs = base_qs.filter(created_by_id=planted_by)
        if minted_status:
            base_qs = base_qs.filter(minting_state=minted_status.upper())
        if sponsor_type:
            base_qs = base_qs.filter(sponsor__type=sponsor_type)
        if iucn_id:   # 🔑 filter trees by species’ iucn_status
            base_qs = base_qs.filter(species__iucn_status=iucn_id)

        # ---------- Dashboard trees (NO type filter) ----------
        dashboard_trees = base_qs

        # ---------- Listing trees (with type filter if provided) ----------
        trees = base_qs

        if organization_name:
            trees = trees.filter(planting_organization__name__icontains=organization_name)

        if tree_type == "pending":
            trees = trees.filter(review_state="PENDING")
        elif tree_type == "approved":
            trees = trees.filter(review_state="APPROVED")
        elif tree_type == "rejected":
            trees = trees.filter(review_state="REJECTED")
        elif tree_type == "to_mint":
            trees = trees.filter(sponsor_id__isnull=False)
        elif tree_type and tree_type not in ["pending", "approved", "rejected", "to_mint", "all"]:
            return failure("Invalid tree type parameter")

        trees = trees.order_by("-created_at")

        # ---------- Pagination / Report ----------
        if report_flag == "1":
            paginated_trees = trees
        else:
            paginator = PageNumberPagination()
            paginator.page_size = per_page
            paginated_trees = paginator.paginate_queryset(trees, request)

        def get_image_url(tree):
            return request.build_absolute_uri(tree.image.url) if tree.image else None

        # ---------- Serialize ----------
        serialized_data = []
        for tree in paginated_trees:
            base_data = {
                "tree_id": tree.id,
                "species_name": tree.species.common_name,
                "botanical_name": tree.species.botanical_name,
                "organisation_name": tree.planting_organization.name,
                "planted_by": tree.created_by.username,
                "user_id": tree.created_by.id,
                "planted_on": tree.created_at.isoformat() if tree.created_at else None,
                "minting_state": tree.minting_state.lower() if tree.minting_state else None,
                "review_state": tree.review_state.lower() if tree.review_state else None,
                "nft_id": tree.nft_id or None,
                "sponsor": tree.sponsor.name if tree.sponsor else None,
                "iucn_status": tree.species.iucn_status if tree.species and tree.species.iucn_status else None,  # 🔑 added
            }

            if tree_type == "pending":
                base_data["image_url"] = get_image_url(tree)
                base_data["location"] = f"{tree.latitude}, {tree.longitude}"
            elif tree_type == "approved":
                base_data.update({
                    "minting_state": tree.minting_state.lower(),
                    "nft_id": tree.nft_id or None,
                    "review_state": tree.updated_at.isoformat() if tree.updated_at else None,
                    "approved_on": tree.updated_at.isoformat() if tree.created_at else None,
                    "comments": tree.rejection_reason if tree.rejection_reason else None,
                    "image_url": get_image_url(tree),
                })
            elif tree_type == "rejected":
                base_data["rejected_on"] = tree.updated_at.isoformat() if tree.updated_at else None
                base_data["image_url"] = get_image_url(tree)
                base_data["comments"] = tree.rejection_reason if tree.rejection_reason else None
            elif tree_type == "to_mint":
                base_data.update({
                    "minting_state": tree.minting_state.lower(),
                    "approved_on": tree.updated_at.isoformat() if tree.created_at else None,
                })

            serialized_data.append(base_data)

        # ---------- Report CSV ----------
        if report_flag == "1":
            if not serialized_data:
                return failure("No data found to generate report")
            fieldnames = [col.upper().replace("_", " ") for col in serialized_data[0].keys()]
            response = HttpResponse(content_type="text/csv")
            response['Content-Disposition'] = 'attachment; filename="trees_report.csv"'
            writer = csv.DictWriter(response, fieldnames=fieldnames)
            writer.writeheader()
            for row in serialized_data:
                formatted_row = {col.upper().replace("_", " "): value for col, value in row.items()}
                writer.writerow(formatted_row)
            return response

        # ---------- Response message ----------
        message = {
            "pending": "Trees to review fetched successfully",
            "approved": "Approved trees fetched successfully",
            "rejected": "Rejected trees fetched successfully",
            "to_mint": "Trees to be minted fetched successfully",
        }.get(tree_type, "Tree list fetched successfully")

        response_data = {
            "count": paginator.page.paginator.count if report_flag != "1" else trees.count(),
            "next": paginator.get_next_link() if report_flag != "1" else None,
            "previous": paginator.get_previous_link() if report_flag != "1" else None,
            "data": serialized_data,
        }

        # ---------- Species count logic ----------
        filters_applied = any([
            # organization_name,
            planted_from,
            planted_to,
            species_id,
            organization_id,
            sponsor_id,
            planted_by,
            minted_status,
            sponsor_type,
            iucn_id,  # 🔑 include iucn in filter check
        ])

        if filters_applied:
            species_count = dashboard_trees.values("species_id").distinct().count()
        else:
            species_count = Species.objects.count()

        # ---------- Dashboard summary (with filters, no type) ----------
        dashboard_summary = {
            "trees_to_review": dashboard_trees.filter(review_state="PENDING").count(),
            "approved_trees": dashboard_trees.filter(review_state="APPROVED").count(),
            "rejected_trees": dashboard_trees.filter(review_state="REJECTED").count(),
            "species_count": species_count,
            "total_trees": dashboard_trees.count(),
            "minted_trees": dashboard_trees.filter(sponsor_id__isnull=False).count(),
        }
        response_data["dashboard_summary"] = dashboard_summary

        # ---------- Mint info (only for to_mint listing) ----------
        if tree_type == "to_mint":
            total_to_mint = trees.filter(minting_state__in=[None, '', 'TO_BE_MINTED']).count()
            total_minted = trees.filter(minting_state="MINTED").count()
            mint_info = f"{total_minted}/{total_to_mint + total_minted} Minted"
            last_minted = trees.filter(minting_state="MINTED").aggregate(
                latest_minted_at=Max("minted_at")
            )["latest_minted_at"]
            last_minted_at = last_minted.isoformat() if last_minted else None
            response_data["mint_info"] = mint_info
            response_data["last_minted_at"] = last_minted_at

        return success(message, response_data)


class TreeDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, tree_id):
        try:
            tree = Tree.objects.select_related("created_by", "species", "planting_organization").get(id=tree_id)

            tree_data = {
                "tree_id": tree.id,
                "planter": tree.created_by.username,
                "species": tree.species.common_name,
                "organization": tree.planting_organization.name,
                "location": f"{tree.latitude}, {tree.longitude}",
                "UID": tree.uid if hasattr(tree, "uid") else None,
                "status" : tree.review_state,
                "native_status": tree.is_native if tree.is_native else None,
                "date_time": tree.created_at.isoformat() if tree.created_at else None
            }

            return success("Tree details fetched successfully", tree_data)

        except Tree.DoesNotExist:
            return failure("Tree not found")

        except Exception as e:
            return failure(f"An error occurred: {str(e)}", error_code=500)

class TreeReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        return self.update_review_status(request)

    def update_review_status(self, request):
        data = request.data
        status_param = data.get("status", "").lower()
        tree_id = data.get("tree_id", None)
        raw_species_id = data.get("species_id", None)

        logger.info(
            f"Received review request: status={status_param}, tree_id={tree_id}, species_id={raw_species_id}")

        if status_param not in ["approve", "reject"]:
            logger.warning("Invalid status parameter received.")
            return failure("Invalid status parameter. Use 'approve' or 'reject'.", error_code=400)

        if tree_id is None:
            logger.warning("Tree ID not provided.")
            return failure("Tree id not found")

        try:
            tree = Tree.objects.select_related("country", "planting_organization").get(id=tree_id)
            logger.info(f"Fetched Tree with ID {tree_id}")

            comments = data.get("comments", "")

            if status_param == "reject":
                if not comments:
                    logger.warning("Rejection without comments attempted.")
                    return failure("Comments are required for rejection.", error_code=400)
                tree.review_state = Tree.ReviewState.REJECTED
                tree.rejection_reason = comments
            else:
                tree.review_state = Tree.ReviewState.APPROVED
                tree.rejection_reason = comments if comments else ""

            if raw_species_id is not None:
                try:
                    assigned_species_id = int(str(raw_species_id).strip())
                    logger.info(f"Trying to fetch AssignedSpecies with ID: {assigned_species_id}")
                    assigned_species = AssignedSpecies.objects.select_related("species").get(id=assigned_species_id)
                    species = assigned_species.species
                    logger.info(f"Successfully fetched species: {species}")
                except AssignedSpecies.DoesNotExist:
                    logger.error(f"AssignedSpecies with ID {raw_species_id} does not exist.")
                    return failure("Invalid species ID: assigned species not found.", error_code=400)
                except Exception as e:
                    logger.exception(f"Failed while fetching assigned species: {e}")
                    return failure(f"Error fetching assigned species: {str(e)}", error_code=400)

                if tree.species_id != species.id:
                    # Prevent UniqueConstraint violation
                    # if Tree.objects.exclude(id=tree.id).filter(
                    #         species=species,
                    #         planting_organization=tree.planting_organization,
                    #         country=tree.country,
                    #         latitude=tree.latitude,
                    #         longitude=tree.longitude,
                    # ).exists():
                    #     logger.warning("Unique constraint violation would occur on species update.")
                    #     return failure(
                    #         "A tree with the same organization, species, and location already exists.",
                    #         error_code=400,
                    #     )

                    tree.species = species
                    tree.planting_cost_usd = assigned_species.planting_cost_usd
                    tree.is_native = assigned_species.is_native
                    logger.info(f"Tree species updated to {species.id}. Cost & native flag updated.")

            try:
                tree.save()
            except IntegrityError as e:
                logger.exception("Integrity error while saving tree.")
                return failure("Saving this tree violates a unique constraint. Please check input data.",
                               error_code=400)

            logger.info(f"Tree {tree_id} review status updated successfully.")
            return success("Tree review status updated successfully", {})

        except Tree.DoesNotExist:
            logger.error(f"Tree with ID {tree_id} not found.")
            return failure("Tree not found", error_code=400)
        except Exception as e:
            logger.exception(f"Unexpected error while updating tree {tree_id}: {e}")
            return failure(f"An error occurred: {str(e)}", error_code=500)
