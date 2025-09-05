from typing import TYPE_CHECKING

from django.db import models

import env

from .utils import TrackableModel

if TYPE_CHECKING:
    from .passcode import PasscodeManager


class PlantingOrganization(TrackableModel):
    name = models.CharField(max_length=100, unique=True)
    contact_person_full_name = models.CharField(max_length=50)
    contact_person_email = models.EmailField()

    countries = models.ManyToManyField(
        "replant.Country", related_name="planting_organizations"
    )
    passcodes: "PasscodeManager"

    class Meta:
        verbose_name = "planting organization / community"
        verbose_name_plural = "planting organizations / communities"

    def __str__(self):
        return self.name

    @property
    def valid_signup_link(self):
        passcode = self.passcodes.get_latest_valid()
        if passcode:
            return f"{env.UPLOAD_APP_URL}/signup-org?code={passcode.code}"
        return None
