from django.contrib.auth import get_user_model
from django.db import models


class TrackableModel(models.Model):
    created_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.PROTECT,
        related_name="%(class)s_created_by",
    )
    updated_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.PROTECT,
        null=True,
        related_name="%(class)s_updated_by",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
