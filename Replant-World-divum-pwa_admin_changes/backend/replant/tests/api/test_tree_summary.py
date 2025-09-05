from model_bakery import baker
from rest_framework import status
from rest_framework.test import APIClient

from replant.models import Tree, User


def test_trees_summary_ok(
    user_client: APIClient,
    user: User,
):
    baker.make(Tree, 2, review_state=Tree.ReviewState.PENDING, created_by=user)
    baker.make(Tree, 4, review_state=Tree.ReviewState.APPROVED, created_by=user)
    baker.make(Tree, 3, review_state=Tree.ReviewState.REJECTED, created_by=user)

    response = user_client.get("/api/trees/summary")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "added_count": 9,
        "pending_review_count": 2,
        "approved_count": 4,
        "rejected_count": 3,
    }


def test_trees_summary_empty(user_client: APIClient):
    response = user_client.get("/api/trees/summary")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "added_count": 0,
        "pending_review_count": 0,
        "approved_count": 0,
        "rejected_count": 0,
    }


def test_trees_summary_skip(user_client: APIClient):
    # Trees created by other users
    baker.make(Tree, 5)

    response = user_client.get("/api/trees/summary")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "added_count": 0,
        "pending_review_count": 0,
        "approved_count": 0,
        "rejected_count": 0,
    }


def test_trees_summary_unauthorized(api_client: APIClient):
    response = api_client.get("/api/trees/summary")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
