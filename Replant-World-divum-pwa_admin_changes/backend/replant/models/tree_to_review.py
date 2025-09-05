from django.db import models

from .tree import Tree


class TreeToReviewManager(models.Manager):
    def get_queryset(self):
        return Tree.objects.filter(review_state=Tree.ReviewState.PENDING)


class TreeToReview(Tree):
    class Meta:
        proxy = True
        verbose_name_plural = "trees to review"

    objects: TreeToReviewManager = TreeToReviewManager()  # type: ignore
