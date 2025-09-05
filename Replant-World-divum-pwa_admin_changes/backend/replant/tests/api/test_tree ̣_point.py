from model_bakery import baker
from rest_framework import status
from rest_framework.test import APIClient

from replant.models import Tree
from replant.tests import matchers


def test_listing_tree_points(user_client: APIClient):
    baker.make(
        Tree,
        minting_state=Tree.MintingState.MINTED,
        nft_id=1,
        tile_index=1000,
    )
    baker.make(
        Tree,
        minting_state=Tree.MintingState.MINTED,
        nft_id=2,
        tile_index=1000,
    )
    baker.make(
        Tree,
        minting_state=Tree.MintingState.PENDING,
        nft_id=3,
        tile_index=1000,
    )
    baker.make(
        Tree,
        minting_state=Tree.MintingState.MINTED,
        nft_id=4,
        tile_index=1001,
    )

    response = user_client.get("/api/tree-points")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == ["index param must be provided"]

    response = user_client.get("/api/tree-points?index=1002")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []

    response = user_client.get("/api/tree-points?index=1000")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [
        {
            "latitude": matchers.Any(float),
            "longitude": matchers.Any(float),
            "nft_id": 1,
        },
        {
            "latitude": matchers.Any(float),
            "longitude": matchers.Any(float),
            "nft_id": 2,
        },
    ]
