from datetime import timedelta
from typing import TYPE_CHECKING
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone

import env

if TYPE_CHECKING:
    from .user import User


class PasscodeManager(models.Manager["Passcode"]):
    def get_latest_valid(self):
        return (
            self.get_queryset()
            .filter(expires_at__gt=timezone.now())
            .order_by("-created_at")
            .first()
        )

    def get_latest_org_valid(self, planting_org):
        return (
            self.get_queryset()
            .filter(
                planting_organization=planting_org,
                expires_at__gt=timezone.now()
            )
            .order_by("-created_at")
            .first()
        )

    def generate(self, by: "User"):
        return self.create(
            expires_at=timezone.now() + timedelta(days=env.PASSCODE_VALID_DAYS),
            created_by=by,
        )


class Passcode(models.Model):
    code = models.UUIDField(unique=True, default=uuid4)
    planting_organization = models.ForeignKey(
        "replant.PlantingOrganization",
        on_delete=models.CASCADE,
        related_name="passcodes",
        verbose_name="planting organization / community",
    )
    created_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        null=True,
        related_name="%(class)s_created_by",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    objects: PasscodeManager = PasscodeManager()

    def __str__(self):
        return self.code

    @property
    def is_valid(self):
        return self.expires_at > timezone.now()
