from datetime import timedelta

from django.utils import timezone
from model_bakery import baker
from rest_framework import status
from rest_framework.test import APIClient

from replant.models import Species, Sponsor, Tree


def test_sponsors_list(user_client: APIClient):
    sponsor_a = baker.make(Sponsor, name="Foo")
    sponsor_b = baker.make(Sponsor, name="Foobar")

    response = user_client.get("/api/sponsors", {"search": "foo"})
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["results"] == [
        {"id": sponsor_a.id, "name": "Foo"},
        {"id": sponsor_b.id, "name": "Foobar"},
    ]

    response = user_client.get("/api/sponsors", {"search": "fooBAR"})
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["results"] == [
        {"id": sponsor_b.id, "name": "Foobar"},
    ]

    response = user_client.get("/api/sponsors", {"search": "non-existing"})
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["results"] == []


def test_sponsors_retrieve_no_trees(user_client: APIClient):
    sponsor = baker.make(
        Sponsor,
        name="Foo",
        bio="lorem ipsum",
        logo="c8302c9252744cdc831c45fea17ce36b.jpeg",
    )

    response = user_client.get(f"/api/sponsors/{sponsor.id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "id": sponsor.id,
        "name": "Foo",
        "species": 0,
        "total_trees_cost_usd": 0,
        "trees": 0,
        "bio": "lorem ipsum",
        "logo": "http://testserver/django-files/c8302c9252744cdc831c45fea17ce36b.jpeg",
    }


def test_sponsors_retrieve_with_trees(user_client: APIClient):
    sponsor = baker.make(Sponsor, name="Foo")
    other_sponsor = baker.make(Sponsor)
    species_a = baker.make(Species)
    species_b = baker.make(Species)

    # Should be ignored because not minted.
    baker.make(
        Tree,
        sponsor=sponsor,
        minting_state=Tree.MintingState.PENDING,
        species=species_a,
        planting_cost_usd=10,
    )

    # Should be ignored because other sponsor.
    baker.make(
        Tree,
        sponsor=other_sponsor,
        minting_state=Tree.MintingState.MINTED,
        species=species_a,
        planting_cost_usd=10,
    )

    # The following should be included.
    baker.make(
        Tree,
        sponsor=sponsor,
        minting_state=Tree.MintingState.MINTED,
        species=species_a,
        planting_cost_usd=10,
    )
    baker.make(
        Tree,
        sponsor=sponsor,
        minting_state=Tree.MintingState.MINTED,
        species=species_a,
        planting_cost_usd=15,
    )
    baker.make(
        Tree,
        sponsor=sponsor,
        minting_state=Tree.MintingState.MINTED,
        species=species_b,
        planting_cost_usd=5,
    )

    response = user_client.get(f"/api/sponsors/{sponsor.id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "id": sponsor.id,
        "name": "Foo",
        "species": 2,
        "total_trees_cost_usd": 30,
        "trees": 3,
        "bio": "",
        "logo": None,
    }


def test_sponsors_top_no_trees(user_client: APIClient):
    baker.make(Sponsor)

    response = user_client.get("/api/sponsors/top")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_sponsors_top_with_trees(user_client: APIClient):
    sponsor_1 = baker.make(Sponsor, name="Sponsor1", type=Sponsor.Type.COMPANY)
    sponsor_2 = baker.make(Sponsor, name="Sponsor2", type=Sponsor.Type.INDIVIDUAL)
    species_a = baker.make(Species)
    species_b = baker.make(Species)

    # Should be ignored because not minted.
    baker.make(
        Tree,
        sponsor=sponsor_1,
        minting_state=Tree.MintingState.PENDING,
        minted_at=timezone.now(),
        species=species_a,
        planting_cost_usd=10,
    )

    baker.make(
        Tree,
        sponsor=sponsor_1,
        minting_state=Tree.MintingState.MINTED,
        minted_at=timezone.now() - timedelta(days=8),
        species=species_a,
        planting_cost_usd=10,
    )
    baker.make(
        Tree,
        sponsor=sponsor_1,
        minting_state=Tree.MintingState.MINTED,
        minted_at=timezone.now(),
        species=species_a,
        planting_cost_usd=15,
    )
    baker.make(
        Tree,
        sponsor=sponsor_1,
        minting_state=Tree.MintingState.MINTED,
        minted_at=timezone.now(),
        species=species_b,
        planting_cost_usd=5,
    )

    baker.make(
        Tree,
        sponsor=sponsor_2,
        minting_state=Tree.MintingState.MINTED,
        minted_at=timezone.now(),
        species=species_a,
        planting_cost_usd=10,
    )

    response = user_client.get("/api/sponsors/top")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [
        {
            "id": sponsor_1.id,
            "name": "Sponsor1",
            "type": "COMPANY",
            "logo": None,
            "trees": 3,
            "trend_pct": 66,
        },
        {
            "id": sponsor_2.id,
            "name": "Sponsor2",
            "type": "INDIVIDUAL",
            "logo": None,
            "trees": 1,
            "trend_pct": 100,
        },
    ]


def test_sponsors_all_no_trees(user_client: APIClient):
    baker.make(Sponsor)

    response = user_client.get("/api/sponsors/all")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "count": 0,
        "next": None,
        "previous": None,
        "results": [],
    }


def test_sponsors_all_with_trees(user_client: APIClient):
    sponsor_1 = baker.make(Sponsor, name="Sponsor1", type=Sponsor.Type.COMPANY)
    sponsor_2 = baker.make(Sponsor, name="Sponsor2", type=Sponsor.Type.INDIVIDUAL)
    species_a = baker.make(Species)
    species_b = baker.make(Species)

    # Should be ignored because not minted.
    baker.make(
        Tree,
        sponsor=sponsor_1,
        minting_state=Tree.MintingState.PENDING,
        species=species_a,
        planting_cost_usd=10,
    )

    baker.make(
        Tree,
        sponsor=sponsor_1,
        minting_state=Tree.MintingState.MINTED,
        species=species_a,
        planting_cost_usd=10,
    )
    baker.make(
        Tree,
        sponsor=sponsor_1,
        minting_state=Tree.MintingState.MINTED,
        species=species_a,
        planting_cost_usd=15,
    )
    baker.make(
        Tree,
        sponsor=sponsor_1,
        minting_state=Tree.MintingState.MINTED,
        species=species_b,
        planting_cost_usd=5,
    )

    baker.make(
        Tree,
        sponsor=sponsor_2,
        minting_state=Tree.MintingState.MINTED,
        species=species_a,
        planting_cost_usd=10,
    )

    response = user_client.get("/api/sponsors/all")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "count": 2,
        "next": None,
        "previous": None,
        "results": [
            {
                "id": sponsor_1.id,
                "name": "Sponsor1",
                "type": "COMPANY",
                "logo": None,
                "trees": 3,
                "species": 2,
                "total_trees_cost_usd": "30.00",
            },
            {
                "id": sponsor_2.id,
                "name": "Sponsor2",
                "type": "INDIVIDUAL",
                "logo": None,
                "trees": 1,
                "species": 1,
                "total_trees_cost_usd": "10.00",
            },
        ],
    }
