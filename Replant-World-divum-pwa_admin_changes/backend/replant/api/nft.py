from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, serializers, viewsets

import env
from replant.models import Nft
from replant.pagination import LimitOffsetPagination


class NftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nft
        fields = (
            "common_name",
            "botanical_name",
            "iucn_status",
            "image",
            "country",
            "planting_cost_usd",
            "planter",
            "planting_organization",
            "latitude",
            "longitude",
            "sponsor",
            "nft_collection",
            "nft_id",
            "created_at",
        )

    common_name = serializers.CharField(source="species.common_name")
    botanical_name = serializers.CharField(source="species.botanical_name")
    iucn_status = serializers.CharField(source="species.iucn_status")
    country = serializers.CharField(source="country.name")
    planter = serializers.CharField(source="created_by.username")
    planting_organization = serializers.CharField(source="planting_organization.name")
    sponsor = serializers.CharField(source="sponsor.name")
    nft_collection = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()

    def get_nft_collection(self, obj: Nft):
        return env.SEI_NFT_ADDRESS

    def get_created_at(self, obj: Nft):
        return obj.created_at.date()


class NftView(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    lookup_field = "nft_id"
    serializer_class = NftSerializer
    queryset = Nft.objects.select_related(
        "species",
        "country",
        "created_by",
        "planting_organization",
        "sponsor",
    ).order_by("-nft_id")
    pagination_class = LimitOffsetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["sponsor"]
