from datetime import timedelta

from django.db import models
from django.db.models.functions import NullIf
from django.utils import timezone
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, mixins, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from replant.models import Nft, Sponsor


class SponsorListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsor
        fields = ("id", "name")


class SponsorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsor
        fields = (
            "id",
            "name",
            "bio",
            "logo",
            "trees",
            "species",
            "total_trees_cost_usd",
        )

    trees = serializers.SerializerMethodField()
    species = serializers.SerializerMethodField()
    total_trees_cost_usd = serializers.SerializerMethodField()

    def _get_nfts(self, obj: Sponsor):
        return Nft.objects.filter(sponsor=obj)

    def get_trees(self, obj: Sponsor):
        return self._get_nfts(obj).count()

    def get_species(self, obj: Sponsor):
        result = self._get_nfts(obj).aggregate(models.Count("species", distinct=True))
        return result["species__count"]

    def get_total_trees_cost_usd(self, obj: Sponsor):
        result = self._get_nfts(obj).aggregate(models.Sum("planting_cost_usd"))
        return result["planting_cost_usd__sum"] or 0


class SponsorTopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsor
        fields = (
            "id",
            "name",
            "type",
            "logo",
            "trees",
            "trend_pct",
        )

    trees = serializers.IntegerField()
    trend_pct = serializers.IntegerField()


class SponsorAllSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsor
        fields = (
            "id",
            "name",
            "type",
            "logo",
            "trees",
            "species",
            "total_trees_cost_usd",
        )

    trees = serializers.IntegerField()
    species = serializers.IntegerField()
    total_trees_cost_usd = serializers.DecimalField(max_digits=12, decimal_places=2)


@extend_schema_view(
    all=extend_schema(responses={status.HTTP_200_OK: SponsorAllSerializer(many=True)}),
    top=extend_schema(responses={status.HTTP_200_OK: SponsorTopSerializer(many=True)}),
)
class SponsorView(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    queryset = Sponsor.objects.order_by("name")
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

    def get_serializer_class(self):
        if self.action == "list":
            return SponsorListSerializer
        elif self.action == "top":
            return SponsorTopSerializer
        elif self.action == "all":
            return SponsorAllSerializer
        return SponsorSerializer

    @action(methods=["get"], detail=False, pagination_class=None, filter_backends=[])
    def top(self, request: Request):
        trees = models.Count("nfts__id")
        latest_trees = models.Count(
            "nfts__id",
            filter=models.Q(nfts__minted_at__gte=timezone.now() - timedelta(days=7)),
        )

        queryset = (
            Sponsor.objects.filter(nfts__minting_state=Nft.MintingState.MINTED)
            .annotate(
                trees=trees,
                trend_pct=latest_trees * 100 / NullIf(trees, 0),
            )
            .order_by("-trees", "id")[:5]
        )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(methods=["get"], detail=False, filter_backends=[])
    def all(self, request: Request):
        # TODO: Move to /sponsors after switching to new designs
        queryset = (
            Sponsor.objects.filter(nfts__minting_state=Nft.MintingState.MINTED)
            .annotate(
                trees=models.Count("nfts__id"),
                species=models.Count("nfts__species", distinct=True),
                total_trees_cost_usd=models.Sum("nfts__planting_cost_usd"),
            )
            .order_by("-trees", "id")
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
