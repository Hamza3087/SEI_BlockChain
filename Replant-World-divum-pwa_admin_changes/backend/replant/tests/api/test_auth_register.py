from model_bakery import baker
from pytest_mock import MockerFixture
from rest_framework import status
from rest_framework.test import APIClient

from replant.models import User


def test_register_ok(api_client: APIClient):
    data = {
        "username": "user",
        "phone_number": "+48888234567",
        "password": "DifficultPassword8*",
        "country": 2,
    }

    response = api_client.post("/api/auth/register", data=data)

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json() == {
        "username": "user",
        "phone_number": "+48888234567",
        "country": 2,
    }
    new_user = User.objects.filter(username="user").first()
    assert new_user is not None
    assert new_user.phone_number == "+48888234567"
    assert new_user.country is not None
    assert new_user.country.id == 2


def test_register_user_already_exists(api_client: APIClient):
    baker.make(User, username="user", phone_number="+48888234567")
    data = {
        "username": "user",
        "phone_number": "+48888234567",
        "password": "DifficultPassword8*",
        "country": 2,
    }

    response = api_client.post("/api/auth/register", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {
        "username": ["A user with that username already exists."]
    }


def test_register_invalid_phone_number(api_client: APIClient):
    data = {
        "username": "user",
        "phone_number": "+488882345674",
        "password": "DifficultPassword8*",
        "country": 2,
    }

    response = api_client.post("/api/auth/register", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {
        "phone_number": ["The phone number entered is not valid."]
    }


def test_register_invalid_country(api_client: APIClient):
    data = {
        "username": "user",
        "phone_number": "+48888234567",
        "password": "DifficultPassword8*",
        "country": 2000,
    }

    response = api_client.post("/api/auth/register", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {
        "country": ['Invalid pk "2000" - object does not exist.']
    }


def test_register_assert_password_validation_called(
    api_client: APIClient,
    mocker: MockerFixture,
):
    validate_password_mock = mocker.patch(
        "replant.api.utils.validate_password_in_serializer"
    )
    data = {
        "username": "user",
        "phone_number": "+48888234567",
        "password": "DifficultPassword8*",
        "country": 2,
    }

    api_client.post("/api/auth/register", data=data)

    validate_password_mock.assert_called_once_with("DifficultPassword8*", mocker.ANY)
    assert validate_password_mock.call_args.args[1].username == "user"
