from django.core import management
from django.test import override_settings

from replant import clustering
from replant.models import Tree, TreesCluster


@override_settings(DEBUG=True)
def test_clustering():
    management.call_command("loaddata", "fixtures.json")
    management.call_command(
        "generate_fake_data",
        planters=2,
        organizations=2,
        sponsors=2,
        trees=100,
        planting_areas=10,
        minting_state=Tree.MintingState.MINTED,
    )
    clustering.cluster_trees()
    assert TreesCluster.objects.count() > 0


def test_clustering_no_trees():
    clustering.cluster_trees()
    assert TreesCluster.objects.count() == 0
