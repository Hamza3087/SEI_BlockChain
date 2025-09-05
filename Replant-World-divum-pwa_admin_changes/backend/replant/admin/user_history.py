from django.contrib import admin
from django.http.request import HttpRequest
from rangefilter.filters import DateRangeFilterBuilder

from replant.models import UserHistory


@admin.register(UserHistory)
class UserHistoryAdmin(admin.ModelAdmin):
    list_display = ("event_type", "error_name", "os", "browser", "device", "created_at")
    list_filter = (
        "event_type",
        "os",
        "browser",
        ("created_at", DateRangeFilterBuilder(title="By Created at")),
    )

    def has_add_permission(self, request: HttpRequest) -> bool:
        return False

    def has_change_permission(
        self, request: HttpRequest, obj: UserHistory | None = None
    ) -> bool:
        return False

    def has_delete_permission(
        self, request: HttpRequest, obj: UserHistory | None = None
    ) -> bool:
        return False
