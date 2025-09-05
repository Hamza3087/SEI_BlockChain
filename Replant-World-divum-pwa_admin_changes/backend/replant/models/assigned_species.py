from django.core.validators import MinValueValidator
from django.db import models

from .utils import TrackableModel


class AssignedSpecies(TrackableModel):
    planting_organization = models.ForeignKey(
        "replant.PlantingOrganization",
        on_delete=models.PROTECT,
        verbose_name="planting organization / community",
    )
    country = models.ForeignKey("replant.Country", on_delete=models.PROTECT)
    species = models.ForeignKey("replant.Species", on_delete=models.PROTECT)

    is_native = models.BooleanField()
    planting_cost_usd = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="planting cost USD",
        validators=[MinValueValidator(0)],
    )

    class Meta:
        verbose_name_plural = "assigned species"
        constraints = [
            models.UniqueConstraint(
                fields=["planting_organization", "country", "species"],
                name="unique_planting_organization_country_species",
                violation_error_message="This Species in this Planting Organization and Country already exists.",
            )
        ]

    def __str__(self):
        return str(self.species)
