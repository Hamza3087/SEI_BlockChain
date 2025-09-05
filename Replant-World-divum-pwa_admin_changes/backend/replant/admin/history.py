from django.contrib import admin
from django.http.request import HttpRequest
from rangefilter.filters import DateRangeFilterBuilder

from replant.models import History


@admin.register(History)
class HistoryAdmin(admin.ModelAdmin):
    list_display = ("event_type", "message", "created_at")
    fields = ("event_type", "message", "created_at", "details")
    list_filter = (
        "event_type",
        ("created_at", DateRangeFilterBuilder(title="By Created at")),
    )

    def has_add_permission(self, request: HttpRequest) -> bool:
        return False

    def has_change_permission(
        self, request: HttpRequest, obj: History | None = None
    ) -> bool:
        return False

    def has_delete_permission(
        self, request: HttpRequest, obj: History | None = None
    ) -> bool:
        return False
