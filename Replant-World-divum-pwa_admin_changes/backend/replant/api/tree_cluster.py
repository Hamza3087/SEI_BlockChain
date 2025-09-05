from django.db import models
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import exceptions, generics, serializers

from replant.models import TreesCluster


class TreeClusterSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreesCluster
        fields = (
            "id",
            "latitude",
            "longitude",
            "number_of_trees",
            "zoom",
        )


@extend_schema_view(
    get=extend_schema(
        parameters=[
            OpenApiParameter(name="zoom", type=int, required=True),
            OpenApiParameter(name="index", type=int, required=True),
        ]
    )
)
class TreeClustersView(generics.ListAPIView):
    serializer_class = TreeClusterSerializer
    queryset = TreesCluster.objects.all()
    pagination_class = None

    def filter_queryset(self, queryset: models.QuerySet[TreesCluster]):
        try:
            zoom = int(self.request.query_params["zoom"])
            index = int(self.request.query_params["index"])
        except (KeyError, ValueError):
            raise exceptions.ValidationError("zoom and index params must be provided")
        return queryset.filter(zoom=zoom, tile_index=index)
