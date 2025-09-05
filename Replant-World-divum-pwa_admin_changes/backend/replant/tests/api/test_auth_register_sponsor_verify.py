from datetime import timedelta

from model_bakery import baker
from rest_framework import status
from rest_framework.test import APIClient
from time_machine import TimeMachineFixture

from replant.models import User


def _get_uid_and_token(user: User):
    password_reset_link = user.get_email_verification_link()
    uid = password_reset_link.split("uid=")[-1].split("&")[0]
    token = password_reset_link.split("token=")[-1]
    return uid, token


def test_register_sponsor_verify_ok(api_client: APIClient):
    user = baker.make(User, is_email_verified=False)
    uid, token = _get_uid_and_token(user)
    data = {
        "uid": uid,
        "token": token,
    }

    response = api_client.post("/api/auth/register-sponsor-verify", data=data)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    user.refresh_from_db()
    assert user.is_email_verified


def test_register_sponsor_verify_invalid_uid(api_client: APIClient):
    user = baker.make(User, is_email_verified=False)
    _, token = _get_uid_and_token(user)
    data = {
        "uid": "x",
        "token": token,
    }

    response = api_client.post("/api/auth/register-sponsor-verify", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"uid": ["Invalid value."]}


def test_register_sponsor_verify_invalid_token(api_client: APIClient):
    user = baker.make(User, is_email_verified=False)
    uid, _ = _get_uid_and_token(user)
    data = {
        "uid": uid,
        "token": "x",
    }

    response = api_client.post("/api/auth/register-sponsor-verify", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"token": ["Invalid value."]}


def test_register_sponsor_verify_user_already_verified(api_client: APIClient):
    user = baker.make(User, is_email_verified=False)
    uid, token = _get_uid_and_token(user)
    data = {
        "uid": uid,
        "token": token,
    }

    response = api_client.post("/api/auth/register-sponsor-verify", data=data)

    assert response.status_code == status.HTTP_204_NO_CONTENT

    response = api_client.post("/api/auth/register-sponsor-verify", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"token": ["Invalid value."]}


def test_register_sponsor_verify_token_expired(
    api_client: APIClient, time: TimeMachineFixture
):
    user = baker.make(User, is_email_verified=False)
    uid, token = _get_uid_and_token(user)
    time.shift(timedelta(days=3, seconds=1))
    data = {
        "uid": uid,
        "token": token,
    }

    response = api_client.post("/api/auth/register-sponsor-verify", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"token": ["Invalid value."]}
