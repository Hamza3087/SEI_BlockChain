from django.contrib import admin

from replant.models import Species

from .utils import TrackableModelAdmin


@admin.register(Species)
class SpeciesAdmin(TrackableModelAdmin):
    list_display = (
        "common_name",
        "botanical_name",
        "iucn_status",
    )
    list_filter = ("iucn_status",)
    ordering = ("common_name",)

    search_fields = ("common_name", "botanical_name")
    fields = (
        "common_name",
        "botanical_name",
        "iucn_status",
        "created_at",
        "updated_at",
    )
    readonly_fields = (
        "created_at",
        "updated_at",
    )
