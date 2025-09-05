from datetime import timedelta
from decimal import Decimal as D
from uuid import UUID

import pytest
from model_bakery import baker
from pytest_mock import MockerFixture
from rest_framework import status
from rest_framework.test import APIClient
from time_machine import TimeMachineFixture

from replant.models import AssignedSpecies, Species, Tree, User
from replant.tests import matchers


def test_list_trees_ok(
    user_client: APIClient,
    user: User,
    time: TimeMachineFixture,
):
    jackfruit = baker.make(
        Species,
        common_name="Jackfruit",
        botanical_name="Artocarpus heterophyllus",
    )
    tree_a = baker.make(
        Tree,
        image="c8302c9252744cdc831c45fea17ce36b.jpeg",
        latitude="-1.422354",
        longitude="120.237897",
        planting_organization=user.planting_organization,
        country=user.country,
        species=jackfruit,
        created_by=user,
        captured_at="2023-12-31T23:00:00Z",
    )
    time.shift(timedelta(seconds=1))
    tree_b = baker.make(
        Tree,
        image="bf5435a8b61946d78fbf8e5ef2f24859.jpeg",
        latitude="-2.422354",
        longitude="121.237897",
        planting_organization=user.planting_organization,
        country=user.country,
        species=jackfruit,
        created_by=user,
        captured_at="2023-12-31T23:00:01Z",
    )

    response = user_client.get("/api/trees")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "count": 2,
        "next": None,
        "previous": None,
        "results": [
            {
                "id": tree_b.id,
                "species": {
                    "common_name": "Jackfruit",
                    "botanical_name": "Artocarpus heterophyllus",
                },
                "review_state": "PENDING",
                "rejection_reason": "",
                "image": "http://testserver/django-files/bf5435a8b61946d78fbf8e5ef2f24859.jpeg",
                "latitude": "-2.422354",
                "longitude": "121.237897",
                "captured_at": "2023-12-31T23:00:01Z",
                "created_at": "2024-01-01T00:00:01Z",
            },
            {
                "id": tree_a.id,
                "species": {
                    "common_name": "Jackfruit",
                    "botanical_name": "Artocarpus heterophyllus",
                },
                "review_state": "PENDING",
                "rejection_reason": "",
                "image": "http://testserver/django-files/c8302c9252744cdc831c45fea17ce36b.jpeg",
                "latitude": "-1.422354",
                "longitude": "120.237897",
                "captured_at": "2023-12-31T23:00:00Z",
                "created_at": "2024-01-01T00:00:00Z",
            },
        ],
    }


def test_list_trees_empty(user_client: APIClient):
    response = user_client.get("/api/trees")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "count": 0,
        "next": None,
        "previous": None,
        "results": [],
    }


def test_list_trees_skip(user_client: APIClient, user: User):
    # Trees created by other users
    baker.make(Tree, 5)

    response = user_client.get("/api/trees")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "count": 0,
        "next": None,
        "previous": None,
        "results": [],
    }


@pytest.mark.parametrize(
    "role",
    [
        None,
        User.Role.SPONSOR,
        User.Role.PLANTING_ORGANIZATION,
    ],
)
def test_list_trees_not_planter(api_client: APIClient, role: User.Role | None):
    user = baker.make(User, role=role)
    api_client.force_login(user)

    response = api_client.get("/api/trees")

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_list_trees_unauthorized(api_client: APIClient):
    response = api_client.get("/api/trees")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_create_tree_ok(
    user_client: APIClient,
    user: User,
    image_b64: str,
    mocker: MockerFixture,
):
    mocker.patch(
        "uuid.uuid4", return_value=UUID("bf5435a8-b619-46d7-8fbf-8e5ef2f24859")
    )
    jackfruit = baker.make(
        Species,
        common_name="Jackfruit",
        botanical_name="Artocarpus heterophyllus",
    )
    assigned_jackfruit = baker.make(
        AssignedSpecies,
        planting_organization=user.planting_organization,
        country=user.country,
        species=jackfruit,
        is_native=True,
        planting_cost_usd=D("1"),
    )
    data = {
        "assigned_species_id": assigned_jackfruit.id,
        "image": image_b64,
        "latitude": "-1.422354",
        "longitude": "120.237897",
        "captured_at": "2023-12-31T23:00:00Z",
    }

    response = user_client.post("/api/trees", data=data)

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json() == {
        "id": matchers.Any(int),
        "species": {
            "common_name": "Jackfruit",
            "botanical_name": "Artocarpus heterophyllus",
        },
        "review_state": "PENDING",
        "rejection_reason": "",
        "image": "http://testserver/django-files/bf5435a8b61946d78fbf8e5ef2f24859.png",
        "latitude": "-1.422354",
        "longitude": "120.237897",
        "captured_at": "2023-12-31T23:00:00Z",
        "created_at": "2024-01-01T00:00:00Z",
    }

    new_tree = Tree.objects.get()
    assert new_tree.review_state == Tree.ReviewState.PENDING
    assert new_tree.image.name == "bf5435a8b61946d78fbf8e5ef2f24859.png"
    assert new_tree.latitude == D("-1.422354")
    assert new_tree.longitude == D("120.237897")
    assert new_tree.planting_organization == user.planting_organization
    assert new_tree.country == user.country
    assert new_tree.species == jackfruit
    assert new_tree.is_native
    assert new_tree.planting_cost_usd == D("1")


def test_create_tree_assigned_species_doesnt_exists(
    user_client: APIClient,
    image_b64: str,
):
    data = {
        "assigned_species_id": 9999999,
        "image": image_b64,
        "latitude": "-1.422354",
        "longitude": "120.237897",
        "captured_at": "2023-12-31T23:00:00Z",
    }

    response = user_client.post("/api/trees", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {
        "assigned_species_id": ["Assigned species with provided ID does not exist."]
    }


def test_create_tree_different_planting_organization(
    user_client: APIClient,
    user: User,
    image_b64: str,
):
    jackfruit = baker.make(
        Species,
        common_name="Jackfruit",
        botanical_name="Artocarpus heterophyllus",
    )
    baker.make(
        AssignedSpecies,
        country=user.country,
        species=jackfruit,
    )
    data = {
        "assigned_species_id": 9999999,
        "image": image_b64,
        "latitude": "-1.422354",
        "longitude": "120.237897",
        "captured_at": "2023-12-31T23:00:00Z",
    }

    response = user_client.post("/api/trees", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {
        "assigned_species_id": ["Assigned species with provided ID does not exist."]
    }


def test_create_tree_different_country(
    user_client: APIClient,
    user: User,
    image_b64: str,
):
    jackfruit = baker.make(
        Species,
        common_name="Jackfruit",
        botanical_name="Artocarpus heterophyllus",
    )
    baker.make(
        AssignedSpecies,
        planting_organization=user.planting_organization,
        country_id=2,
        species=jackfruit,
    )
    data = {
        "assigned_species_id": 9999999,
        "image": image_b64,
        "latitude": "-1.422354",
        "longitude": "120.237897",
        "captured_at": "2023-12-31T23:00:00Z",
    }

    response = user_client.post("/api/trees", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {
        "assigned_species_id": ["Assigned species with provided ID does not exist."]
    }


def test_create_tree_tree_already_uploaded(
    user_client: APIClient,
    user: User,
    image_b64: str,
    mocker: MockerFixture,
):
    mocker.patch(
        "uuid.uuid4", return_value=UUID("bf5435a8-b619-46d7-8fbf-8e5ef2f24859")
    )
    jackfruit = baker.make(
        Species,
        common_name="Jackfruit",
        botanical_name="Artocarpus heterophyllus",
    )
    assigned_jackfruit = baker.make(
        AssignedSpecies,
        planting_organization=user.planting_organization,
        country=user.country,
        species=jackfruit,
        is_native=True,
        planting_cost_usd=D("1"),
    )
    baker.make(Tree, created_by=user, captured_at="2023-12-31T23:00:00Z")
    data = {
        "assigned_species_id": assigned_jackfruit.id,
        "image": image_b64,
        "latitude": "-1.422354",
        "longitude": "120.237897",
        "captured_at": "2023-12-31T23:00:00Z",
    }

    response = user_client.post("/api/trees", data=data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"captured_at": ["Tree has been already uploaded."]}


@pytest.mark.parametrize(
    "role",
    [
        None,
        User.Role.SPONSOR,
        User.Role.PLANTING_ORGANIZATION,
    ],
)
def test_create_tree_not_planter(api_client: APIClient, role: User.Role | None):
    user = baker.make(User, role=role)
    api_client.force_login(user)

    response = api_client.post("/api/trees")

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_create_tree_unauthorized(api_client: APIClient):
    response = api_client.post("/api/trees")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
