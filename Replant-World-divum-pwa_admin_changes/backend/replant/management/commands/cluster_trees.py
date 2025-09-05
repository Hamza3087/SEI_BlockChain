import djclick as click
from django.db import transaction

from replant import clustering


@click.command()
@transaction.atomic
def cluster_trees():
    clustering.cluster_trees()
