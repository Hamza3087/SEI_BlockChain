from model_bakery import baker
from rest_framework import status
from rest_framework.test import APIClient

from replant.models import Country, PlantingOrganization, Sponsor, User


def test_get_user_planter_ok(
    api_client: APIClient,
    country: Country,
    planting_organization: PlantingOrganization,
):
    user = baker.make(
        User,
        username="user",
        phone_number="+48888234567",
        planting_organization=planting_organization,
        country=country,
    )
    api_client.force_login(user)

    response = api_client.get("/api/user")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "username": "user",
        "email": None,
        "phone_number": "+48888234567",
        "country": {"id": 1, "name": "Aruba"},
        "planting_organization": {"name": "Green World"},
        "sponsor": None,
    }


def test_get_user_sponsor_ok(api_client: APIClient):
    sponsor = baker.make(Sponsor, type=Sponsor.Type.INDIVIDUAL, name="Jon Snow")
    user = baker.make(
        User,
        role=User.Role.SPONSOR,
        email="jon.snow@example.com",
        sponsor=sponsor,
    )
    api_client.force_login(user)

    response = api_client.get("/api/user")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "username": None,
        "email": "jon.snow@example.com",
        "phone_number": "",
        "country": None,
        "planting_organization": None,
        "sponsor": {"type": "INDIVIDUAL", "name": "Jon Snow", "bio": "", "logo": None},
    }


def test_get_user_unauthorized(api_client: APIClient):
    response = api_client.get("/api/user")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_update_user_planter_ok(
    api_client: APIClient,
    planting_organization: PlantingOrganization,
    country: Country,
):
    user = baker.make(
        User,
        username="user",
        phone_number="+48888234567",
        planting_organization=planting_organization,
        country=country,
    )
    api_client.force_login(user)

    data: dict = {"sponsor": None}  # nothing yet is implemented
    response = api_client.put("/api/user", data=data)
    assert response.status_code == status.HTTP_200_OK


def test_update_user_sponsor_ok(api_client: APIClient, image_b64: str):
    sponsor = baker.make(Sponsor, type=Sponsor.Type.INDIVIDUAL, name="Jon Snow")
    user = baker.make(
        User,
        role=User.Role.SPONSOR,
        email="jon.snow@example.com",
        sponsor=sponsor,
    )
    api_client.force_login(user)

    data = {
        "sponsor": {"name": "Changed Snow", "bio": "lorem ipsum", "logo": image_b64}
    }
    response = api_client.put("/api/user", data=data)
    assert response.status_code == status.HTTP_200_OK

    sponsor = Sponsor.objects.get()
    assert sponsor.name == "Changed Snow"
    assert sponsor.bio == "lorem ipsum"
    assert bool(sponsor.logo)


def test_update_user_sponsor_validation(api_client: APIClient):
    sponsor = baker.make(Sponsor, type=Sponsor.Type.INDIVIDUAL, name="Jon Snow")
    user = baker.make(
        User,
        role=User.Role.PLANTER,
        email="jon.snow@example.com",
        sponsor=sponsor,
    )
    api_client.force_login(user)

    data = {"sponsor": None}
    response = api_client.put("/api/user", data=data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"sponsor": "Sponsor cannot be null"}


def test_update_user_planter_validation(api_client: APIClient, image_b64: str):
    user = baker.make(
        User,
        role=User.Role.PLANTER,
        email="jon.snow@example.com",
    )
    api_client.force_login(user)

    data = {
        "sponsor": {"name": "Changed Snow", "bio": "lorem ipsum", "logo": image_b64}
    }
    response = api_client.put("/api/user", data=data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"sponsor": "No sponsor is associated with the user"}


def test_update_user_unauthorized(api_client: APIClient):
    response = api_client.put("/api/user", data={})

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
