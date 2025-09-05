from unittest.mock import MagicMock

import pytest
from model_bakery import baker
from pytest_mock import MockerFixture
from rest_framework import status
from rest_framework.test import APIClient

from replant.integrations import sendgrid
from replant.models import Sponsor, User
from replant.tests import matchers

DEFAULT_DATA = {
    "type": "INDIVIDUAL",
    "name": "Jon Snow",
    "email": "jon.snow@example.com",
    "password": "DifficultPassword8*",
    "bio": "",
    "logo": None,
}


@pytest.fixture(autouse=True)
def send_email_mock(mocker: MockerFixture) -> MagicMock:
    return mocker.patch("replant.integrations.sendgrid.send_email")


def test_register_sponsor_ok(api_client: APIClient, send_email_mock: MagicMock):
    response = api_client.post("/api/auth/register-sponsor", data=DEFAULT_DATA)

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json() == {"email": "jon.snow@example.com"}

    new_user = User.objects.filter(email="jon.snow@example.com").first()
    assert new_user is not None
    assert new_user.role == User.Role.SPONSOR

    sponsor: Sponsor = new_user.sponsor
    assert sponsor is not None
    assert sponsor.type == Sponsor.Type.INDIVIDUAL
    assert sponsor.name == "Jon Snow"
    assert sponsor.contact_person_email == "jon.snow@example.com"
    assert sponsor.bio == ""
    assert not bool(sponsor.logo)

    send_email_mock.assert_called_once_with(
        to="jon.snow@example.com",
        template_name="email_verification",
        subject="Confirm your email address",
        context=matchers.Any(dict),
    )


def test_register_sponsor_ok_with_bio_and_logo(api_client: APIClient, image_b64: str):
    data = {**DEFAULT_DATA, "bio": "lorem ipsum", "logo": image_b64}

    response = api_client.post("/api/auth/register-sponsor", data=data)
    assert response.status_code == status.HTTP_201_CREATED

    sponsor = Sponsor.objects.get()
    assert sponsor.bio == "lorem ipsum"
    assert bool(sponsor.logo)


def test_register_sponsor_email_case_insensitive(api_client: APIClient):
    data = {
        **DEFAULT_DATA,
        "email": "jon.SNOW@example.COM ",
    }
    response = api_client.post("/api/auth/register-sponsor", data=data)

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json() == {"email": "jon.snow@example.com"}

    new_user = User.objects.filter(email="jon.snow@example.com").first()
    assert new_user is not None


def test_register_sponsor_user_already_exists(api_client: APIClient):
    baker.make(User, email=DEFAULT_DATA["email"])

    response = api_client.post("/api/auth/register-sponsor", data=DEFAULT_DATA)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"email": ["A user with that email already exists."]}


def test_register_sponsor_invalid_type(api_client: APIClient):
    data = {**DEFAULT_DATA, "type": "XXX"}

    response = api_client.post("/api/auth/register-sponsor", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"type": ['"XXX" is not a valid choice.']}


def test_register_sponsor_invalid_email(api_client: APIClient):
    data = {**DEFAULT_DATA, "email": "jon.snow"}

    response = api_client.post("/api/auth/register-sponsor", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"email": ["Enter a valid email address."]}


def test_register_sponsor_assert_password_validation_called(
    api_client: APIClient, mocker: MockerFixture
):
    validate_password_mock = mocker.patch(
        "replant.api.utils.validate_password_in_serializer"
    )
    response = api_client.post("/api/auth/register-sponsor", data=DEFAULT_DATA)

    assert response.status_code == status.HTTP_201_CREATED
    validate_password_mock.assert_called_once_with("DifficultPassword8*", mocker.ANY)
    assert validate_password_mock.call_args.args[1].email == "jon.snow@example.com"


def test_register_sendgrid_error(api_client: APIClient, mocker: MockerFixture):
    mocker.patch(
        "replant.integrations.sendgrid.send_email",
        side_effect=sendgrid.SendGridAPIError(),
    )

    response = api_client.post("/api/auth/register-sponsor", data=DEFAULT_DATA)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {
        "non_field_errors": ["Registration is not possible now. Try again later."]
    }

    assert User.objects.count() == 0
    assert Sponsor.objects.count() == 0
