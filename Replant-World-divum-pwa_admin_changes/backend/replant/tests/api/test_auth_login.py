from rest_framework import status
from rest_framework.test import APIClient

from replant.models import User


def test_login_ok(api_client: APIClient):
    User.objects.create_user(username="user", password="DifficultPassword8*")
    data = {"username": "user", "password": "DifficultPassword8*"}

    response = api_client.post("/api/auth/login", data=data)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"username": "user"}
    assert "sessionid" in response.cookies


def test_login_incorrect_password(api_client: APIClient):
    User.objects.create_user(username="user", password="DifficultPassword8*")
    data = {"username": "user", "password": "WrongPassword"}

    response = api_client.post("/api/auth/login", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"non_field_errors": ["Incorrect username or password."]}


def test_login_user_not_found(api_client: APIClient):
    data = {"username": "user", "password": "DifficultPassword8*"}

    response = api_client.post("/api/auth/login", data=data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"non_field_errors": ["Incorrect username or password."]}
