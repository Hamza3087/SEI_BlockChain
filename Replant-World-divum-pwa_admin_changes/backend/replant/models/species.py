from django.db import models

from .utils import TrackableModel


class Species(TrackableModel):
    class IucnStatus(models.TextChoices):
        CRITICALLY_ENDANGERED = "CR"
        ENDANGERED = "EN"
        VULNERABLE = "VU"
        NEAR_THREATENED = "NT"
        LEAST_CONCERN = "LC"
        DATA_DEFICIENT = "DD"

    common_name = models.CharField(max_length=200, unique=True)
    botanical_name = models.CharField(max_length=200, unique=True)

    iucn_status = models.CharField(max_length=2, choices=IucnStatus.choices)

    class Meta:
        verbose_name_plural = "species"

    def __str__(self):
        return f"{self.common_name} ({self.botanical_name})"
