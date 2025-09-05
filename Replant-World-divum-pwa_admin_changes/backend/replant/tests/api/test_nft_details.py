from model_bakery import baker
from rest_framework import status
from rest_framework.test import APIClient

import env
from replant.models import Sponsor, Tree


def test_nft_details(user_client: APIClient):
    sponsor = baker.make(Sponsor, name="Foo")
    tree = baker.make(
        Tree,
        sponsor=sponsor,
        nft_id=123,
        minting_state=Tree.MintingState.MINTED,
        image="image-url",
    )

    response = user_client.get("/api/nfts/123")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
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
