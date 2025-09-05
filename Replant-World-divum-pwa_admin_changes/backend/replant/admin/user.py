from typing import cast

from django.contrib import admin, messages
from django.core.exceptions import BadRequest
from django.http import Http404, HttpRequest, HttpResponseRedirect
from django.urls import path
from django.utils.html import format_html

from replant.models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display_links = ("username", "email")
    list_display = (
        "username",
        "email",
        "role",
        "planting_organization",
        "date_joined",
    )
    search_fields = ("username", "planting_organization__name")
    fields = (
        "username",
        "email",
        "role",
        "phone_number",
        "planting_organization",
        "country",
        "sponsor",
        "date_joined",
        "last_login",
        "password_reset_link",
    )

    def password_reset_link(self, obj: User):
        if obj.pk is None:
            return ""

        url = obj.get_password_reset_link()
        return format_html(
            """<a class="button" onclick="this.outerHTML='{}'">Show</a>""", url
        )

    def has_add_permission(self, request: HttpRequest) -> bool:
        return False

    def has_change_permission(
        self, request: HttpRequest, obj: User | None = None
    ) -> bool:
        return False

    def has_delete_permission(
        self, request: HttpRequest, obj: User | None = None
    ) -> bool:
        return False

    def get_form(self, *args, **kwargs):
        kwargs.update({"help_texts": {"username": None}})
        return super().get_form(*args, **kwargs)

    def get_urls(self):
        urls = super().get_urls()
        model_info = self.opts.app_label, self.opts.model_name
        my_urls = [
            path(
                "time-zone/",
                self.admin_site.admin_view(self.change_time_zone),
                name="%s_%s_change_time_zone" % model_info,
            )
        ]
        return my_urls + urls

    @admin.options.csrf_protect_m
    def change_time_zone(self, request: HttpRequest):
        if request.method == "POST":
            time_zone = request.POST.get("time-zone")
            user = cast(User, request.user)
            original_page = request.META["HTTP_REFERER"]

            if not any(el[0] == time_zone for el in user.TIME_ZONES):
                raise BadRequest("Invalid time zone.")
            else:
                user.time_zone = time_zone
                user.save()
                messages.success(request, "Time zone changed successfully.")

            return HttpResponseRedirect(original_page)

        raise Http404()
