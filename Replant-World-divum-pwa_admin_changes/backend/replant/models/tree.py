import uuid
from enum import auto
from typing import TYPE_CHECKING

from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Count
from django_fsm import FSMField

from replant.consts import FILEBASE_IPFS_STORAGE_URL, NFT_STORAGE_URL

from .utils import TrackableModel

if TYPE_CHECKING:
    from .user import User


class TreeManager(models.Manager):
    def get_review_state_count(self, user: "User"):
        return (
            self.get_queryset()
            .filter(created_by=user)
            .values("review_state")
            .annotate(review_state_count=Count("review_state"))
        )

    def only_awaiting_sponsor(self):
        return self.filter(
            review_state=Tree.ReviewState.APPROVED,
            sponsor__isnull=True,
        )


def image_upload_to(model: models.Model, filename: str) -> str:
    _, ext = filename.rsplit(".", 1)
    return f"{uuid.uuid4().hex}.{ext}"


class Tree(TrackableModel):
    class ReviewState(models.TextChoices):
        PENDING = auto()
        APPROVED = auto()
        REJECTED = auto()

    class MintingState(models.TextChoices):
        PENDING = auto()
        TO_BE_MINTED = auto()
        MINTED = auto()
        FAILED = auto()

    class StorageProvider(models.TextChoices):
        NFT_STORAGE = auto()
        FILEBASE = auto()

    review_state = FSMField(
        choices=ReviewState.choices, default=ReviewState.PENDING, db_index=True
    )
    rejection_reason = models.CharField(max_length=100, default="", blank=True)
    minting_state = FSMField(
        choices=MintingState.choices, default=MintingState.PENDING, db_index=True
    )

    image = models.ImageField(upload_to=image_upload_to)
    image_cid = models.URLField(
        max_length=128, default="", blank=True, verbose_name="image CID"
    )
    metadata_cid = models.URLField(
        max_length=128, default="", blank=True, verbose_name="metadata CID"
    )
    storage_provider = models.CharField(
        max_length=32, choices=StorageProvider.choices, default=StorageProvider.FILEBASE
    )

    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    tile_index = models.PositiveIntegerField(db_index=True)
    captured_at = models.DateTimeField()

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
    sponsor = models.ForeignKey(
        "replant.Sponsor",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="nfts",
    )

    nft_id = models.PositiveIntegerField(
        unique=True, null=True, blank=True, db_index=True, verbose_name="NFT ID"
    )
    nft_mint_tx = models.CharField(max_length=64, default="", blank=True)
    minted_at = models.DateTimeField(null=True)

    objects: TreeManager = TreeManager()

    def __str__(self):
        return str(self.pk)

    @property
    def ipfs_image_url(self) -> str:
        match self.storage_provider:
            case Tree.StorageProvider.NFT_STORAGE:
                return ipfs_nft_storage_url(
                    cid=self.image_cid, nft_id=self.nft_id, extension="png"
                )
            case Tree.StorageProvider.FILEBASE:
                return ipfs_filebase_url(cid=self.image_cid)
            case _:
                raise Exception

    @property
    def ipfs_metadata_url(self) -> str:
        match self.storage_provider:
            case Tree.StorageProvider.NFT_STORAGE:
                return ipfs_nft_storage_url(
                    cid=self.metadata_cid, nft_id=self.nft_id, extension="json"
                )
            case Tree.StorageProvider.FILEBASE:
                return ipfs_filebase_url(cid=self.metadata_cid)
            case _:
                raise Exception


def ipfs_nft_storage_url(cid: str | None, nft_id: int, extension: str) -> str:
    if cid:
        return NFT_STORAGE_URL.format(cid=cid, nft_id=nft_id, extension=extension)
    return ""


def ipfs_filebase_url(cid: str | None) -> str:
    if cid:
        return FILEBASE_IPFS_STORAGE_URL.format(cid=cid)
    return ""
