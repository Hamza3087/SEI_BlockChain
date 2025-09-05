from admin_auto_filters.filters import AutocompleteFilterFactory
from django.contrib import admin
from django.http.request import HttpRequest
from django.utils.html import format_html
from rangefilter.filters import DateRangeFilterBuilder

from replant.models import Species, Tree

from .utils import TrackableModelAdmin


@admin.register(Tree)
class TreeAdmin(TrackableModelAdmin):
    list_display = (
        "id",
        "species",
        "review_state",
        "minting_state",
        "sponsor",
        "nft_id",
        "created_by",
        "created_at",
    )

    fields = (
        "id",
        "review_state",
        "rejection_reason",
        "image_tag",
        "image",
        "latitude",
        "longitude",
        "planting_organization",
        "country",
        "species",
        "iucn_status",
        "is_native",
        "planting_cost_usd",
        "sponsor",
        "nft_id",
        "nft_mint_tx",
        "image_cid",
        "metadata_cid",
        "created_by",
        "created_at",
        "tile_index",
    )

    list_filter = [
        ("created_at", DateRangeFilterBuilder(title="By Created at")),
        AutocompleteFilterFactory(title="Sponsor", base_parameter_name="sponsor"),
        AutocompleteFilterFactory(title="Created by", base_parameter_name="created_by"),
        "review_state",
        "minting_state",
    ]

    def image_tag(self, obj: Tree):
        return format_html(
            '<img style="max-height: 600px; max-width: 100vw; object-fit: contain;" src="{}" />'.format(
                obj.image.url
            )
        )

    @admin.display(description="IUCN status")
    def iucn_status(self, obj: Tree):
        return Species.IucnStatus(obj.species.iucn_status).name

    def has_add_permission(self, request: HttpRequest) -> bool:
        return False

    def has_change_permission(
        self, request: HttpRequest, obj: Tree | None = None
    ) -> bool:
        return False

    def has_delete_permission(
        self, request: HttpRequest, obj: Tree | None = None
    ) -> bool:
        return False

    def get_queryset(self, request: HttpRequest):
        return (
            super()
            .get_queryset(request)
            .select_related("species", "sponsor", "created_by")
        )
