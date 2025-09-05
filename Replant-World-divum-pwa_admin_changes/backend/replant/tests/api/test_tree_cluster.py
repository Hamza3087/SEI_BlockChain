from model_bakery import baker
from rest_framework import status
from rest_framework.test import APIClient

from replant.models import TreesCluster
from replant.tests import matchers


def test_listing_tree_clusters(user_client: APIClient):
    baker.make(TreesCluster, tile_index=1000, zoom=1, number_of_trees=100)
    baker.make(TreesCluster, tile_index=1000, zoom=1, number_of_trees=200)
    baker.make(TreesCluster, tile_index=1000, zoom=2, number_of_trees=300)
    baker.make(TreesCluster, tile_index=1001, zoom=1, number_of_trees=400)

    response = user_client.get("/api/tree-clusters")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == ["zoom and index params must be provided"]

    response = user_client.get("/api/tree-clusters?index=1000&zoom=1")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [
        {
            "id": matchers.Any(int),
            "latitude": matchers.Any(float),
            "longitude": matchers.Any(float),
            "zoom": 1,
            "number_of_trees": 100,
        },
        {
            "id": matchers.Any(int),
            "latitude": matchers.Any(float),
            "longitude": matchers.Any(float),
            "zoom": 1,
            "number_of_trees": 200,
        },
    ]

    response = user_client.get("/api/tree-clusters?index=1000&zoom=2")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["number_of_trees"] == 300

    response = user_client.get("/api/tree-clusters?index=1001&zoom=1")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["number_of_trees"] == 400

    response = user_client.get("/api/tree-clusters?index=1002&zoom=3")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []
