from datetime import timedelta

from pytest_mock import MockerFixture
from rest_framework import status
from rest_framework.test import APIClient
from time_machine import TimeMachineFixture

from replant.models import User


def _get_uid_and_token(user: User):
    password_reset_link = user.get_password_reset_link()
    uid = password_reset_link.split("uid=")[-1].split("&")[0]
    token = password_reset_link.split("token=")[-1]
    return uid, token


def test_reset_password_ok(api_client: APIClient, user: User):
    uid, token = _get_uid_and_token(user)
    data = {
        "uid": uid,
        "token": token,
        "password": "DifficultPassword8*",
    }

    response = api_client.post("/api/auth/reset-password", data=data)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    user.refresh_from_db()
    assert user.check_password("DifficultPassword8*")


def test_reset_password_invalid_uid(api_client: APIClient, user: User):
    _, token = _get_uid_and_token(user)
    data = {
        "uid": "x",
        "token": token,
        "password": "DifficultPassword8*",
    }

    response = api_client.post("/api/auth/reset-password", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"uid": ["Invalid value."]}


def test_reset_password_invalid_token(api_client: APIClient, user: User):
    uid, _ = _get_uid_and_token(user)
    data = {
        "uid": uid,
        "token": "x",
        "password": "DifficultPassword8*",
    }

    response = api_client.post("/api/auth/reset-password", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"token": ["Invalid value."]}


def test_reset_password_changed_in_mean_time(api_client: APIClient, user: User):
    uid, token = _get_uid_and_token(user)
    data = {
        "uid": uid,
        "token": token,
        "password": "DifficultPassword8*",
    }

    response = api_client.post("/api/auth/reset-password", data=data)

    assert response.status_code == status.HTTP_204_NO_CONTENT

    response = api_client.post("/api/auth/reset-password", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"token": ["Invalid value."]}


def test_reset_password_token_expired(
    api_client: APIClient, user: User, time: TimeMachineFixture
):
    uid, token = _get_uid_and_token(user)
    time.shift(timedelta(days=3, seconds=1))
    data = {
        "uid": uid,
        "token": token,
        "password": "DifficultPassword8*",
    }

    response = api_client.post("/api/auth/reset-password", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"token": ["Invalid value."]}


def test_reset_password_assert_password_validation_called(
    api_client: APIClient,
    mocker: MockerFixture,
    user: User,
):
    validate_password_mock = mocker.patch(
        "replant.api.utils.validate_password_in_serializer"
    )
    uid, token = _get_uid_and_token(user)
    data = {
        "uid": uid,
        "token": token,
        "password": "DifficultPassword8*",
    }

    api_client.post("/api/auth/reset-password", data=data)

    validate_password_mock.assert_called_once_with("DifficultPassword8*", user)
