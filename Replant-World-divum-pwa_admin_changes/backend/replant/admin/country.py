from django.contrib import admin
from django.http.request import HttpRequest

from replant.models import Country


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)

    def has_module_permission(self, request: HttpRequest):
        return False

    def has_add_permission(self, request: HttpRequest) -> bool:
        return False

    def has_change_permission(
        self, request: HttpRequest, obj: Country | None = None
    ) -> bool:
        return False

    def has_delete_permission(
        self, request: HttpRequest, obj: Country | None = None
    ) -> bool:
        return False

    def _is_ajax(self, request):
        return request.META.get("HTTP_X_REQUESTED_WITH") == "XMLHttpRequest"

    def get_search_results(self, request, queryset, search_term):
        # Used in assigned species admin panel to filter organization's countries
        if self._is_ajax(request):
            planting_organization = request.GET.get("planting_organization")
            if planting_organization:
                queryset = queryset.filter(
                    planting_organizations__in=[planting_organization]
                )
        return super().get_search_results(request, queryset, search_term)
