from typing import cast

from rest_framework import permissions

from replant.models import User


class IsPlanter(permissions.BasePermission):
    """
    Check whether user is a planter.
    """

    def has_permission(self, request, view):
        user = cast(User, request.user)
        return user.is_planter
