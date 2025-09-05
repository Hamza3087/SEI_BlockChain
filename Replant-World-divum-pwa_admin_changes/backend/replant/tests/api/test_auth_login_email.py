from rest_framework import status
from rest_framework.test import APIClient

from replant.models import User


def test_login_email_ok(api_client: APIClient):
    User.objects.create_user(
        email="jon.snow@example.com",
        password="DifficultPassword8*",
        is_email_verified=True,
    )
    data = {"email": "jon.snow@example.com", "password": "DifficultPassword8*"}

    response = api_client.post("/api/auth/login-email", data=data)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"email": "jon.snow@example.com", "is_first_login": True}
    assert "sessionid" in response.cookies


def test_login_email_second_login_ok(api_client: APIClient):
    User.objects.create_user(
        email="jon.snow@example.com",
        password="DifficultPassword8*",
        is_email_verified=True,
    )
    data = {"email": "jon.snow@example.com", "password": "DifficultPassword8*"}

    response = api_client.post("/api/auth/login-email", data=data)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"email": "jon.snow@example.com", "is_first_login": True}
    assert "sessionid" in response.cookies

    response = api_client.post("/api/auth/logout")

    assert response.status_code == status.HTTP_204_NO_CONTENT

    response = api_client.post("/api/auth/login-email", data=data)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"email": "jon.snow@example.com", "is_first_login": False}


def test_login_email_incorrect_password(api_client: APIClient):
    User.objects.create_user(
        email="jon.snow@example.com",
        password="DifficultPassword8*",
        is_email_verified=True,
    )
    data = {"email": "jon.snow@example.com", "password": "WrongPassword"}

    response = api_client.post("/api/auth/login-email", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"non_field_errors": ["Incorrect email or password."]}


def test_login_email_user_not_found(api_client: APIClient):
    data = {"email": "jon.snow@example.com", "password": "DifficultPassword8*"}

    response = api_client.post("/api/auth/login-email", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"non_field_errors": ["Incorrect email or password."]}


def test_login_email_not_verified(api_client: APIClient):
    User.objects.create_user(
        email="jon.snow@example.com",
        password="DifficultPassword8*",
        is_email_verified=False,
    )
    data = {"email": "jon.snow@example.com", "password": "DifficultPassword8*"}

    response = api_client.post("/api/auth/login-email", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"non_field_errors": ["Email is not verified yet."]}
