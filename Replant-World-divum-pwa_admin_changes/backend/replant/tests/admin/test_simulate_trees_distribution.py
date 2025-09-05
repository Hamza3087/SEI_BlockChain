from decimal import Decimal as D

import pytest

from replant.admin.sponsor import simulate_trees_distribution
from replant.models import Sponsor, Tree


@pytest.fixture(autouse=True)
def _always_use_db():
    """Disables db"""


last_sponsor_id = -1
last_tree_id = -1


def make_sponsor(**kwargs):
    global last_sponsor_id
    last_sponsor_id += 1
    return Sponsor(
        id=last_sponsor_id,
        name=str(last_sponsor_id),
        wallet_address=str(last_sponsor_id),
        **kwargs,
    )


def make_tree(planting_cost_usd: D | None = None):
    global last_tree_id
    last_tree_id += 1
    return Tree(id=last_tree_id, planting_cost_usd=planting_cost_usd or D(0))


def test_simulate_trees_distribution_empty_data():
    result = simulate_trees_distribution(sponsors=[], trees=[])
    assert result == {}


def test_simulate_trees_distribution_single_sponsor_quantity_consume_all_trees():
    sponsor = make_sponsor(nft_ordered=5)
    trees = [make_tree(), make_tree()]

    result = simulate_trees_distribution(sponsors=[sponsor], trees=trees)

    assert result == {sponsor: [trees[0], trees[1]]}
    assert sponsor.assigned_trees == 2
    assert sponsor.assigned_trees_usd == D(0)


def test_simulate_trees_distribution_single_sponsor_quantity_fulfill():
    sponsor = make_sponsor(nft_ordered=5)
    trees = [make_tree() for _ in range(10)]

    result = simulate_trees_distribution(sponsors=[sponsor], trees=trees)

    assert result == {sponsor: [trees[0], trees[1], trees[2], trees[3], trees[4]]}
    assert sponsor.assigned_trees == 5
    assert sponsor.assigned_trees_usd == D(0)


def test_simulate_trees_distribution_single_sponsor_usd():
    sponsor = make_sponsor(nft_ordered_usd=D(10))
    trees = [
        make_tree(planting_cost_usd=D(2)),
        make_tree(planting_cost_usd=D(1)),
        make_tree(planting_cost_usd=D(5)),
        make_tree(planting_cost_usd=D(3)),
    ]

    result = simulate_trees_distribution(sponsors=[sponsor], trees=trees)
    assert result == {sponsor: [trees[0], trees[1], trees[2]]}
    assert sponsor.assigned_trees == 3
    assert sponsor.assigned_trees_usd == D(8)


def test_simulate_trees_distribution_two_sponsors_quantity_consume_all_trees():
    sponsors = [
        make_sponsor(nft_ordered=5),
        make_sponsor(nft_ordered=3),
    ]
    trees = [make_tree() for _ in range(5)]

    result = simulate_trees_distribution(sponsors=sponsors, trees=trees)
    assert result == {
        sponsors[0]: [trees[0], trees[2], trees[4]],
        sponsors[1]: [trees[1], trees[3]],
    }
    assert sponsors[0].assigned_trees == 3
    assert sponsors[1].assigned_trees == 2


def test_simulate_trees_distribution_two_sponsors_quantity_fullfil():
    sponsors = [
        make_sponsor(nft_ordered=5),
        make_sponsor(nft_ordered=3),
    ]
    trees = [make_tree() for _ in range(10)]

    result = simulate_trees_distribution(sponsors=sponsors, trees=trees)
    assert result == {
        sponsors[0]: [trees[0], trees[2], trees[4], trees[6], trees[7]],
        sponsors[1]: [trees[1], trees[3], trees[5]],
    }
    assert sponsors[0].assigned_trees == 5
    assert sponsors[1].assigned_trees == 3


def test_simulate_trees_distribution_two_sponsors_usd():
    sponsors = [
        make_sponsor(nft_ordered_usd=D(10)),
        make_sponsor(nft_ordered_usd=D(3)),
    ]
    trees = [
        make_tree(planting_cost_usd=D(2)),
        make_tree(planting_cost_usd=D(1)),
        make_tree(planting_cost_usd=D(5)),
        make_tree(planting_cost_usd=D(3)),
    ]

    result = simulate_trees_distribution(sponsors=sponsors, trees=trees)
    assert result == {
        sponsors[0]: [trees[0], trees[2], trees[3]],
        sponsors[1]: [trees[1]],
    }
    assert sponsors[0].assigned_trees == 3
    assert sponsors[0].assigned_trees_usd == 10
    assert sponsors[1].assigned_trees == 1
    assert sponsors[1].assigned_trees_usd == 1


def test_simulate_trees_distribution_single_sponsor_usd_skip_expensive_trees():
    sponsor = make_sponsor(nft_ordered_usd=D(10))
    trees = [
        make_tree(planting_cost_usd=D(20)),  # to be skipped
        make_tree(planting_cost_usd=D(1)),
        make_tree(planting_cost_usd=D(20)),  # to be skipped
        make_tree(planting_cost_usd=D(3)),
    ]

    result = simulate_trees_distribution(sponsors=[sponsor], trees=trees)
    assert result == {sponsor: [trees[1], trees[3]]}
    assert sponsor.assigned_trees == 2
    assert sponsor.assigned_trees_usd == D(4)


def test_simulate_trees_distribution_two_sponsors_usd_skip_expensive_trees():
    sponsors = [
        make_sponsor(nft_ordered_usd=D(10)),
        make_sponsor(nft_ordered_usd=D(70)),
    ]
    trees = [
        make_tree(planting_cost_usd=D(20)),
        make_tree(planting_cost_usd=D(1)),
        make_tree(planting_cost_usd=D(20)),
        make_tree(planting_cost_usd=D(20)),
        make_tree(planting_cost_usd=D(3)),
        make_tree(planting_cost_usd=D(20)),
    ]

    result = simulate_trees_distribution(sponsors=sponsors, trees=trees)
    # The following result is not perfect. The trees could be distributed better but who cares.
    assert result == {
        sponsors[0]: [trees[4]],
        sponsors[1]: [trees[0], trees[1], trees[2], trees[3]],
    }


def test_simulate_trees_distribution_two_sponsors_mixed():
    sponsors = [
        make_sponsor(nft_ordered_usd=D(10)),
        make_sponsor(nft_ordered=D(3)),
    ]
    trees = [
        make_tree(planting_cost_usd=D(20)),
        make_tree(planting_cost_usd=D(1)),
        make_tree(planting_cost_usd=D(20)),
        make_tree(planting_cost_usd=D(20)),
        make_tree(planting_cost_usd=D(3)),
        make_tree(planting_cost_usd=D(20)),
    ]

    result = simulate_trees_distribution(sponsors=sponsors, trees=trees)
    assert result == {
        sponsors[0]: [trees[4]],
        sponsors[1]: [trees[0], trees[1], trees[2]],
    }
