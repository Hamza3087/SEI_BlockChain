from django.db import models

from .tree import Tree


class TreeToMintManager(models.Manager):
    def get_queryset(self):
        return Tree.objects.filter(
            sponsor__isnull=False,
            review_state=Tree.ReviewState.APPROVED,
        ).exclude(minting_state=Tree.MintingState.MINTED)


class TreeToMint(Tree):
    class Meta:
        proxy = True
        verbose_name_plural = "trees to mint"

    objects: TreeToMintManager = TreeToMintManager()  # type: ignore
