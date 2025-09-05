import pytest
from model_bakery import baker
from rest_framework import status
from rest_framework.test import APIClient

from replant.models import AssignedSpecies, Species, User


def test_list_species_ok(
    user_client: APIClient,
    user: User,
):
    jackfruit = baker.make(
        Species,
        common_name="Jackfruit",
        botanical_name="Artocarpus heterophyllus",
    )
    guava = baker.make(
        Species,
        common_name="Guava",
        botanical_name="Psidium guajava",
    )
    assigned_jackfruit = baker.make(
        AssignedSpecies,
        planting_organization=user.planting_organization,
        country=user.country,
        species=jackfruit,
    )
    assigned_guava = baker.make(
        AssignedSpecies,
        planting_organization=user.planting_organization,
        country=user.country,
        species=guava,
    )

    response = user_client.get("/api/assigned-species")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [
        {
            "id": assigned_guava.id,
            "species": {
                "common_name": "Guava",
                "botanical_name": "Psidium guajava",
            },
        },
        {
            "id": assigned_jackfruit.id,
            "species": {
                "common_name": "Jackfruit",
                "botanical_name": "Artocarpus heterophyllus",
            },
        },
    ]


def test_list_species_empty(user_client: APIClient):
    response = user_client.get("/api/assigned-species")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_list_species_skip(user_client: APIClient, user: User):
    # Species from other organization
    baker.make(AssignedSpecies, 5, country=user.country)
    # Species from other countries
    baker.make(AssignedSpecies, 5, planting_organization=user.planting_organization)

    response = user_client.get("/api/assigned-species")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


@pytest.mark.parametrize(
    "role",
    [
        None,
        User.Role.SPONSOR,
        User.Role.PLANTING_ORGANIZATION,
    ],
)
def test_list_species_not_planter(api_client: APIClient, role: User.Role | None):
    user = baker.make(User, role=role)
    api_client.force_login(user)

    response = api_client.get("/api/assigned-species")

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_list_species_unauthorized(api_client: APIClient):
    response = api_client.get("/api/assigned-species")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
