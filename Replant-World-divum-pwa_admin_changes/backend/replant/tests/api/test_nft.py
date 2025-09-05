from model_bakery import baker
from rest_framework import status
from rest_framework.test import APIClient

import env
from replant.models import Sponsor, Tree


def test_nft_listing_single(user_client: APIClient):
    sponsor = baker.make(Sponsor, name="Foo")
    tree = baker.make(
        Tree,
        sponsor=sponsor,
        nft_id=123,
        minting_state=Tree.MintingState.MINTED,
        image="image-url",
    )

    response = user_client.get("/api/nfts")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "count": 1,
        "limit": 10,
        "offset": 0,
        "results": [
            {
                "botanical_name": tree.species.botanical_name,
                "common_name": tree.species.common_name,
                "iucn_status": tree.species.iucn_status,
                "country": tree.country.name,
                "created_at": "2024-01-01",
                "image": f"http://testserver/django-files/{tree.image}",
                "latitude": str(tree.latitude),
                "longitude": str(tree.longitude),
                "nft_collection": env.SEI_NFT_ADDRESS,
                "nft_id": tree.nft_id,
                "planter": tree.created_by.username,
                "planting_cost_usd": str(tree.planting_cost_usd),
                "planting_organization": tree.planting_organization.name,
                "sponsor": tree.sponsor.name,
            }
        ],
    }


def test_nft_listing_filtering(user_client: APIClient):
    sponsor = baker.make(Sponsor, name="Foo")
    other_sponsor = baker.make(Sponsor)

    # The following should be included.
    baker.make(
        Tree,
        sponsor=sponsor,
        nft_id=1,
        minting_state=Tree.MintingState.MINTED,
    )
    baker.make(
        Tree,
        sponsor=sponsor,
        nft_id=2,
        minting_state=Tree.MintingState.MINTED,
    )
    baker.make(
        Tree,
        sponsor=other_sponsor,
        nft_id=3,
        minting_state=Tree.MintingState.MINTED,
    )

    # Should be ignored because not minted.
    baker.make(
        Tree,
        sponsor=sponsor,
        minting_state=Tree.MintingState.PENDING,
        planting_cost_usd=10,
        nft_id=4,
    )

    response = user_client.get("/api/nfts")
    assert response.status_code == status.HTTP_200_OK
    nft_ids = [tree["nft_id"] for tree in response.json()["results"]]
    assert nft_ids == [3, 2, 1]

    response = user_client.get("/api/nfts", {"sponsor": sponsor.id})
    assert response.status_code == status.HTTP_200_OK
    nft_ids = [tree["nft_id"] for tree in response.json()["results"]]
    assert nft_ids == [2, 1]

    response = user_client.get("/api/nfts", {"sponsor": other_sponsor.id})
    assert response.status_code == status.HTTP_200_OK
    nft_ids = [tree["nft_id"] for tree in response.json()["results"]]
    assert nft_ids == [3]

    # Not existing sponsor.
    response = user_client.get("/api/nfts", {"sponsor": 123123})
    assert response.status_code == status.HTTP_400_BAD_REQUEST
