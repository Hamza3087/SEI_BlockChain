from django.db import models

from .tree import Tree


class NftManager(models.Manager):
    def get_queryset(self):
        return Tree.objects.filter(minting_state=Tree.MintingState.MINTED)


class Nft(Tree):
    class Meta:
        proxy = True
        verbose_name_plural = "NFTs"

    objects: NftManager = NftManager()  # type: ignore
