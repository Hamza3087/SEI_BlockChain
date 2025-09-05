from django.db import models


class TreesCluster(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=["tile_index", "zoom"]),
        ]

    longitude = models.FloatField()
    latitude = models.FloatField()
    zoom = models.PositiveIntegerField()
    tile_index = models.PositiveIntegerField()
    number_of_trees = models.PositiveIntegerField()
