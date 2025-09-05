from django.contrib import admin
from django.http.request import HttpRequest

from replant.models import TreesCluster

from .utils import TrackableModelAdmin


@admin.register(TreesCluster)
class TreesClusterAdmin(TrackableModelAdmin):
    list_display = (
        "id",
        "latitude",
        "longitude",
        "zoom",
        "number_of_trees",
        "tile_index",
    )

    list_filter = ("zoom",)

    def has_add_permission(self, request: HttpRequest) -> bool:
        return False

    def has_change_permission(
        self, request: HttpRequest, obj: TreesCluster | None = None
    ) -> bool:
        return False

    def has_delete_permission(
        self, request: HttpRequest, obj: TreesCluster | None = None
    ) -> bool:
        return False
