from typing import cast

from django.contrib import admin
from django.http import HttpRequest

from replant.models import User
from replant.models.utils import TrackableModel


class TrackableModelAdmin(admin.ModelAdmin):
    def save_model(self, request: HttpRequest, obj: TrackableModel, form, change):
        user = cast(User, request.user)
        if obj.pk is None:
            obj.created_by = user
        obj.updated_by = user
        super().save_model(request, obj, form, change)
