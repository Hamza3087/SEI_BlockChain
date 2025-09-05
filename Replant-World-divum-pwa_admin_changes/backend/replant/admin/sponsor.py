import itertools
from collections import defaultdict
from decimal import Decimal as D
from enum import auto

from django import forms
from django.contrib import admin, messages
from django.contrib.admin.widgets import AutocompleteSelect
from django.db import models, transaction
from django.http.request import HttpRequest
from django.http.response import HttpResponse
from django.shortcuts import redirect, render
from django.urls import URLPattern, path, reverse
from django.utils.html import format_html

from replant.models import PlantingOrganization, Sponsor, Tree


class SponsorNeedingTreesFilter(admin.SimpleListFilter):
    title = "need trees assignment"

    parameter_name = "need_trees_assignment"

    def lookups(self, request, model_admin):
        return [
            ("yes", "Yes"),
            ("no", "No"),
        ]

    def queryset(self, request, queryset):
        trees_filter = models.Q(assigned_trees__lt=models.F("nft_ordered")) | models.Q(
            assigned_trees_usd__lt=models.F("nft_ordered_usd")
        )
        if self.value() == "yes":
            return queryset.filter(trees_filter)
        elif self.value() == "no":
            return queryset.exclude(trees_filter)


class AssignTreesForm(forms.Form):
    class TreeFilter(models.TextChoices):
        ALL_TREES = auto()
        EXACT_COST = auto()
        MAX_COST = auto()

    organization = forms.ModelChoiceField(
        queryset=PlantingOrganization.objects.all(),
        widget=AutocompleteSelect(
            Tree._meta.get_field("planting_organization"), admin.site  # type:ignore
        ),
    )

    tree_filter = forms.ChoiceField(
        widget=forms.RadioSelect,
        choices=TreeFilter.choices,
        initial=TreeFilter.ALL_TREES,
    )

    max_tree_cost = forms.DecimalField(
        min_value=D(0),
        required=False,
        label="Max cost of a single tree [USD]",
    )

    exact_tree_cost = forms.DecimalField(
        min_value=D(0),
        required=False,
        label="Exact cost of a single tree [USD]",
    )


@admin.register(Sponsor)
class SponsorAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "type",
        "wallet_address",
        "contact_person_email",
        "get_nft_ordered",
        "get_nft_ordered_usd",
    )
    search_fields = (
        "name",
        "wallet_address",
        "contact_person_email",
    )
    ordering = ("name",)
    list_filter = (
        SponsorNeedingTreesFilter,
        "type",
    )

    fields = (
        "type",
        "name",
        "wallet_address",
        "contact_person_email",
        "nft_ordered",
        "nft_ordered_usd",
        "additional_info",
        "assigned_trees",
        "assigned_trees_usd",
    )
    readonly_fields = (
        "assigned_trees",
        "assigned_trees_usd",
    )

    actions = ("assign_trees",)

    @admin.display(
        description="NFT ordered",
        ordering="nft_ordered",
    )
    def get_nft_ordered(self, obj: Sponsor):
        return self._format_order(
            obj, f"{obj.assigned_trees} / {obj.nft_ordered or " - "}"
        )

    @admin.display(description="NFT ordered [USD]", ordering="nft_ordered_usd")
    def get_nft_ordered_usd(self, obj: Sponsor):
        return self._format_order(
            obj,
            f"{format_usd(obj.assigned_trees_usd)} / {format_usd(obj.nft_ordered_usd)}",
        )

    def _format_order(self, obj: Sponsor, text: str):
        html = f'<div class="bold {"" if obj.is_eligible_to_trees_assignment else "green"}">{text}</div>'
        return format_html(html)

    def has_delete_permission(
        self, request: HttpRequest, obj: Sponsor | None = None
    ) -> bool:
        return False

    def get_urls(self) -> list[URLPattern]:
        urls = super().get_urls()
        model_info = self.opts.app_label, self.opts.model_name
        my_urls = [
            path(
                "assign_trees/",
                self.admin_site.admin_view(self.assign_trees_view),
                name="%s_%s_assign_trees" % model_info,
            )
        ]
        return my_urls + urls

    @admin.action(description="Assign trees")
    def assign_trees(self, request: HttpRequest, queryset: models.QuerySet[Sponsor]):
        sponsor_ids = queryset.values_list("pk", flat=True)
        url = reverse("admin:replant_sponsor_assign_trees")
        return redirect(
            f"{url}?sponsor_ids={", ".join(str(_id) for _id in sponsor_ids)}"
        )

    @admin.options.csrf_protect_m
    def assign_trees_view(self, request: HttpRequest) -> HttpResponse:
        sponsor_ids = request.GET.get("sponsor_ids", "").split(",")
        sponsors: list[Sponsor] = list(self.model.objects.filter(id__in=sponsor_ids))
        organization_trees_count = 0
        tree_filter = AssignTreesForm.TreeFilter.ALL_TREES
        exact_tree_cost = D(0)
        max_tree_cost = D(0)
        organization: PlantingOrganization | None = None
        trees_per_sponsor: dict[Sponsor, list[Tree]] = {}

        non_eligible_sponsors = [
            sponsor
            for sponsor in sponsors
            if not sponsor.is_eligible_to_trees_assignment
        ]
        if non_eligible_sponsors:
            messages.warning(
                request,
                f"Sponsors {non_eligible_sponsors} have already been assigned the ordered number of trees.",
            )
            return redirect("admin:replant_sponsor_changelist")

        if request.method == "POST":
            form = AssignTreesForm(request.POST)

            if form.is_valid():
                organization = form.cleaned_data["organization"]
                tree_filter = form.cleaned_data.get("tree_filter")
                assert organization

                trees_qs = Tree.objects.only_awaiting_sponsor().filter(
                    planting_organization=organization
                )
                organization_trees_count = trees_qs.count()

                if tree_filter == AssignTreesForm.TreeFilter.EXACT_COST:
                    exact_tree_cost = form.cleaned_data.get("exact_tree_cost")
                    if exact_tree_cost is not None:
                        trees_qs = trees_qs.filter(planting_cost_usd=exact_tree_cost)

                if tree_filter == AssignTreesForm.TreeFilter.MAX_COST:
                    max_tree_cost = form.cleaned_data.get("max_tree_cost")
                    if max_tree_cost is not None:
                        trees_qs = trees_qs.filter(planting_cost_usd__lte=max_tree_cost)

                # Limit the number of trees to fetch into memory.
                trees = list(trees_qs[:10_000])

                if not trees:
                    messages.warning(
                        request, "There are no trees matching provided criteria."
                    )
                else:
                    trees_per_sponsor = simulate_trees_distribution(
                        sponsors=sponsors,
                        trees=trees,
                    )

                    if form.data.get("step2"):
                        assign_trees(trees_per_sponsor)
                        messages.success(
                            request, "Trees successfully assigned to sponsores."
                        )
                        return redirect("admin:replant_sponsor_changelist")
        else:
            form = AssignTreesForm()

        sponsor_dicts = [
            {
                "id": sponsor.id,
                "name": sponsor.name,
                "additional_info": sponsor.additional_info,
                "assigned_trees": sponsor.assigned_trees,
                "nft_ordered": sponsor.nft_ordered or "-",
                "assigned_trees_usd": format_usd(sponsor.assigned_trees_usd),
                "nft_ordered_usd": format_usd(sponsor.nft_ordered_usd),
                "trees_to_assign": sponsor.trees_to_assign,
                "trees_to_assign_usd": format_usd(sponsor.trees_to_assign_usd),
                "trees_given": len(trees_per_sponsor.get(sponsor, [])),
                "trees_given_usd": format_usd(
                    sum(
                        tree.planting_cost_usd
                        for tree in trees_per_sponsor.get(sponsor, [])
                    )
                ),
            }
            for sponsor in sponsors
        ]

        total_assigned_trees = sum(len(trees) for trees in trees_per_sponsor.values())

        return render(
            request,
            "admin/sponsor_assign_trees.html",
            {
                **self.admin_site.each_context(request),
                "title": "Assign trees",
                "sponsors": sponsor_dicts,
                "form": form,
                "trees_count": organization_trees_count - total_assigned_trees,
                "total_assigned_trees": total_assigned_trees,
                "organization": organization,
                "tree_filter": tree_filter,
                "max_tree_cost": max_tree_cost,
                "exact_tree_cost": exact_tree_cost,
                "action_label": (
                    "Assign trees" if organization else "Preview trees assignment"
                ),
            },
        )


def simulate_trees_distribution(
    sponsors: list[Sponsor],
    trees: list[Tree],
) -> dict[Sponsor, list[Tree]]:
    sponsors = [
        sponsor for sponsor in sponsors if sponsor.is_eligible_to_trees_assignment
    ]
    if not sponsors:
        return {}

    trees_per_sponsor: dict[Sponsor, list[Tree]] = defaultdict(list)
    sponsors_cycle = itertools.cycle(sponsors)

    for tree in trees:
        sponsor = next(sponsors_cycle)

        if sponsor.nft_ordered_usd:
            if tree.planting_cost_usd > sponsor.trees_to_assign_usd:
                sponsor = find_sponsor_for_tree(tree, sponsors)
                if sponsor is None:
                    # Ignore the tree
                    continue

        sponsor.assigned_trees_usd += tree.planting_cost_usd
        sponsor.assigned_trees += 1

        trees_per_sponsor[sponsor].append(tree)

        if not sponsor.is_eligible_to_trees_assignment:
            sponsors.remove(sponsor)
            if not sponsors:
                return trees_per_sponsor
            sponsors_cycle = itertools.cycle(sponsors)

    return trees_per_sponsor


def find_sponsor_for_tree(tree: Tree, sponsors: list[Sponsor]):
    for sponsor in sponsors:
        if tree.planting_cost_usd <= sponsor.trees_to_assign_usd or sponsor.nft_ordered:
            return sponsor
    return None


@transaction.atomic
def assign_trees(trees_per_sponsor: dict[Sponsor, list[Tree]]):
    for sponsor, trees in trees_per_sponsor.items():
        tree_ids = [tree.id for tree in trees]
        Tree.objects.only_awaiting_sponsor().filter(id__in=tree_ids).update(
            sponsor=sponsor
        )
        sponsor.save(update_fields=["assigned_trees", "assigned_trees_usd"])


def format_usd(amount: D | None) -> str:
    if amount is None:
        return "-"
    return f"${amount:,.2f}"
