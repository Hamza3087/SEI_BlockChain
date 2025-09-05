from typing import cast

from django.contrib import admin
from django.core.exceptions import PermissionDenied
from django.http import Http404, HttpRequest, HttpResponseRedirect
from django.urls import path, reverse
from django.utils.html import format_html

from replant.models import PlantingOrganization, User

from .utils import TrackableModelAdmin


@admin.register(PlantingOrganization)
class PLantingOrganizationAdmin(TrackableModelAdmin):
    list_display = (
        "name",
        "contact_person_email",
        "created_at",
    )
    search_fields = (
        "name",
        "contact_person_email",
    )
    ordering = ("name",)

    filter_horizontal = ("countries",)
    fields = (
        "name",
        "contact_person_full_name",
        "contact_person_email",
        "countries",
        "get_signup_link",
        "created_at",
        "updated_at",
    )
    readonly_fields = (
        "get_signup_link",
        "created_at",
        "updated_at",
    )

    def has_delete_permission(
        self, request: HttpRequest, obj: PlantingOrganization | None = None
    ) -> bool:
        return False

    @admin.display(description="Signup link")
    def get_signup_link(self, obj: PlantingOrganization) -> str:
        if obj.pk is None:
            return "-"

        model_info = self.opts.app_label, self.opts.model_name
        if obj.valid_signup_link:
            return format_html(
                "{}",
                obj.valid_signup_link,
            )
        return format_html(
            '<a class="button" href="{}">Generate link</a>',
            reverse("admin:%s_%s_generate_link" % model_info, args=(obj.pk,)),
        )

    def get_urls(self):
        urls = super().get_urls()
        model_info = self.opts.app_label, self.opts.model_name
        my_urls = [
            path(
                "<pk>/generate_link/",
                self.admin_site.admin_view(self.generate_link_view),
                name="%s_%s_generate_link" % model_info,
            )
        ]
        return my_urls + urls

    @admin.options.csrf_protect_m
    def generate_link_view(self, request: HttpRequest, pk: str):
        planting_org: PlantingOrganization | None = self.get_object(request, pk)

        if not self.has_change_permission(request, planting_org):
            raise PermissionDenied()

        if planting_org is None:
            raise Http404(f"No {self.opts.object_name} matches the given query.")

        user = cast(User, request.user)
        planting_org.passcodes.generate(by=user)

        model_info = self.opts.app_label, self.opts.model_name
        return HttpResponseRedirect(
            reverse("admin:%s_%s_change" % model_info, args=(pk,))
        )
