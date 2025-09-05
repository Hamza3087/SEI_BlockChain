# from django.http import HttpResponse
# from django.views import View
# import pandas as pd
# from replant.models import Tree
# from django.utils.timezone import localtime
#
# class ReportGenerationView(View):
#     def get(self, request):
#         # Query all tree records
#         trees = Tree.objects.select_related('species', 'sponsor', 'planting_organization')
#
#         # Prepare data list
#         data = []
#
#         for tree in trees:
#             data.append({
#                 "Tree ID": tree.id,
#                 "Latitude": tree.latitude,
#                 "Longitude": tree.longitude,
#                 "Review State": tree.review_state,
#                 "Is Native": "Yes" if tree.is_native == 1 else "No",  # Modified this line
#                 "Planting Cost (USD)": tree.planting_cost_usd,
#                 "Country Name" : tree.country.name,
#                 # "Captured At": localtime(tree.captured_at).strftime("%Y-%m-%d %H:%M:%S"),
#                 # "Created At": localtime(tree.created_at).strftime("%Y-%m-%d %H:%M:%S"),
#                 "Captured At": localtime(tree.captured_at).strftime("%b %d, %Y at %I:%M %p"),
#                 "Created At": localtime(tree.created_at).strftime("%b %d, %Y at %I:%M %p"),
#                 "Sponsor Name": tree.sponsor.name if tree.sponsor else "N/A",
#                 "Sponsor Type": tree.sponsor.type if tree.sponsor else "N/A",
#                 # "Minting State" : tree.minting_state,
#                 "Minting State": {
#                     "PENDING": "Pending",
#                     "MINTED": "Minted",
#                     "TO_BE_MINTED": "To be minted"
#                 }.get(tree.minting_state, tree.minting_state.title() if tree.minting_state else "N/A"),
#
#                 # "Sponsor Assigned Trees": tree.sponsor.assigned_trees if tree.sponsor.assigned_trees else "N/A",
#                 "Sponsor Email": tree.sponsor.contact_person_email if tree.sponsor else "N/A",
#                 "Species Common Name": tree.species.common_name if tree.species else "N/A",
#                 "Species Botanical Name": tree.species.botanical_name if tree.species else "N/A",
#                 "Species IUCN Status": tree.species.get_iucn_status_display() if tree.species else "N/A",
#                 "Planting Org Name": tree.planting_organization.name if tree.planting_organization else "N/A",
#                 "Planting Org Contact": tree.planting_organization.contact_person_full_name if tree.planting_organization else "N/A",
#                 "Planting Org Email": tree.planting_organization.contact_person_email if tree.planting_organization else "N/A",
#             })
#
#         # Create DataFrame
#         df = pd.DataFrame(data)
#
#         # Create Excel file in memory
#         response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
#         response['Content-Disposition'] = 'attachment; filename=tree_report.xlsx'
#
#         with pd.ExcelWriter(response, engine='openpyxl') as writer:
#             df.to_excel(writer, sheet_name='Tree Report', index=False)
#
#         return response


import csv
from django.http import HttpResponse, JsonResponse
from django.views import View
from collections import Counter
from replant.models import Tree

class ReportGenerationView(View):
    def get(self, request):
        trees = Tree.objects.select_related('species').all()
        total_planted = trees.count()
        review_counter = Counter(trees.values_list('review_state', flat=True))
        native_count = trees.filter(is_native=True).count()
        non_native_count = total_planted - native_count
        species_count = trees.values('species').distinct().count()  # New line

        iucn_statuses = ['DD', 'LC', 'NT', 'VU', 'EN', 'CR']
        iucn_counter = {status: 0 for status in iucn_statuses}
        total_cost = sum(tree.planting_cost_usd or 0 for tree in trees)

        # IUCN counting
        for tree in trees:
            if tree.species and tree.species.iucn_status in iucn_counter:
                iucn_counter[tree.species.iucn_status] += 1

        # Create HTTP response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=tree_full_report.csv'
        writer = csv.writer(response)

        # Header row
        writer.writerow([
            "PLANTED", "PENDING", "APPROVED", "REJECTED", "VALUE",
            "% NATIVE", "% NON NATIVE", "NO. OF SPECIES",  # New column added
            "% DATA DEFICIENT (DD)", "% LEAST CONCERN (LC)", "% NEAR THREATENED (NT)",
            "% VULNERABLE (VU)", "% ENDANGERED (EN)", "% CRITICALLY ENDANGERED (CR)",
            "COMMON NAME", "BOTANICAL NAME", "NATIVE / NON NATIVE",
            "IUCN STATUS", "COST", "TOTAL VERIFIED"
        ])

        # Summary row
        writer.writerow([
            total_planted,
            review_counter.get('PENDING', 0),
            review_counter.get('APPROVED', 0),
            review_counter.get('REJECTED', 0),
            total_cost,
            round((native_count / total_planted) * 100, 2) if total_planted else 0,
            round((non_native_count / total_planted) * 100, 2) if total_planted else 0,
            species_count,  # New value added
            *[round((iucn_counter[status] / total_planted) * 100, 2) if total_planted else 0 for status in iucn_statuses],
            "", "", "", "", "", ""
        ])

        # Per-species breakdown
        species_seen = set()
        for tree in trees:
            species = tree.species
            if species and species.id not in species_seen:
                species_seen.add(species.id)
                species_trees = trees.filter(species=species)

                common_name = species.common_name
                botanical_name = species.botanical_name
                native_status = "Native" if species_trees.filter(is_native=True).count() >= species_trees.filter(is_native=False).count() else "Non Native"
                iucn = species.get_iucn_status_display() if hasattr(species, 'get_iucn_status_display') else species.iucn_status
                species_cost = sum(t.planting_cost_usd or 0 for t in species_trees)
                verified_count = species_trees.filter(review_state='APPROVED').count()

                writer.writerow([
                    "", "", "", "", "", "", "", "", "", "", "", "", "","",
                    common_name, botanical_name, native_status, iucn, species_cost, verified_count
                ])

        return response


class DashboardReportGenerationView(View):
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
        trees = Tree.objects.select_related("species", "planting_organization", "sponsor").all()

        # --- Apply filters dynamically ---
        if species_id:
            trees = trees.filter(species_id=species_id)
        if organization_id:
            trees = trees.filter(planting_organization_id=organization_id)
        if sponsor_id:
            trees = trees.filter(sponsor_id=sponsor_id)
        if planted_by:
            trees = trees.filter(created_by_id=planted_by)
        if planted_from:
            trees = trees.filter(created_at__date__gte=planted_from)
        if planted_to:
            trees = trees.filter(created_at__date__lte=planted_to)
        if organization_name:
            trees = trees.filter(planting_organization__name__icontains=organization_name)
        if minted_status:
            trees = trees.filter(minting_state=minted_status.upper())
        if sponsor_type:
            trees = trees.filter(sponsor__type=sponsor_type)
        if iucn_id:
            trees = trees.filter(species__iucn_status=iucn_id)

        if not trees.exists():
            return JsonResponse(
                {"message": "No data found to generate report" , "error_code":400},
                status=400
            )

        # --- Existing report generation logic (works whether filters applied or not) ---
        total_planted = trees.count()
        review_counter = Counter(trees.values_list('review_state', flat=True))
        native_count = trees.filter(is_native=True).count()
        non_native_count = total_planted - native_count
        species_count = trees.values('species').distinct().count()

        iucn_statuses = ['DD', 'LC', 'NT', 'VU', 'EN', 'CR']
        iucn_counter = {status: 0 for status in iucn_statuses}
        total_cost = sum(tree.planting_cost_usd or 0 for tree in trees)

        # IUCN counting
        for tree in trees:
            if tree.species and tree.species.iucn_status in iucn_counter:
                iucn_counter[tree.species.iucn_status] += 1

        # Create HTTP response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=tree_full_report.csv'
        writer = csv.writer(response)

        # Header row
        writer.writerow([
            "PLANTED", "PENDING", "APPROVED", "REJECTED", "VALUE",
            "% NATIVE", "% NON NATIVE", "NO. OF SPECIES",
            "% DATA DEFICIENT (DD)", "% LEAST CONCERN (LC)", "% NEAR THREATENED (NT)",
            "% VULNERABLE (VU)", "% ENDANGERED (EN)", "% CRITICALLY ENDANGERED (CR)",
            "COMMON NAME", "BOTANICAL NAME", "NATIVE / NON NATIVE",
            "IUCN STATUS", "COST", "TOTAL VERIFIED"
        ])

        # Summary row
        writer.writerow([
            total_planted,
            review_counter.get('PENDING', 0),
            review_counter.get('APPROVED', 0),
            review_counter.get('REJECTED', 0),
            total_cost,
            round((native_count / total_planted) * 100, 2) if total_planted else 0,
            round((non_native_count / total_planted) * 100, 2) if total_planted else 0,
            species_count,
            *[round((iucn_counter[status] / total_planted) * 100, 2) if total_planted else 0 for status in iucn_statuses],
            "", "", "", "", "", ""
        ])

        # Per-species breakdown
        species_seen = set()
        for tree in trees:
            species = tree.species
            if species and species.id not in species_seen:
                species_seen.add(species.id)
                species_trees = trees.filter(species=species)

                common_name = species.common_name
                botanical_name = species.botanical_name
                native_status = "Native" if species_trees.filter(is_native=True).count() >= species_trees.filter(is_native=False).count() else "Non Native"
                iucn = species.get_iucn_status_display() if hasattr(species, 'get_iucn_status_display') else species.iucn_status
                species_cost = sum(t.planting_cost_usd or 0 for t in species_trees)
                verified_count = species_trees.filter(review_state='APPROVED').count()

                writer.writerow([
                    "", "", "", "", "", "", "", "", "", "", "", "", "", "",
                    common_name, botanical_name, native_status, iucn, species_cost, verified_count
                ])

        return response
