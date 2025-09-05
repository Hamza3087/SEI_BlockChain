from rest_framework import status
from rest_framework.test import APIClient

from replant.models import User


def test_logout_ok(api_client: APIClient):
    User.objects.create_user(username="user", password="DifficultPassword8*")
    data = {"username": "user", "password": "DifficultPassword8*"}

    response = api_client.post("/api/auth/login", data=data)

    assert response.status_code == status.HTTP_200_OK

    response = api_client.post("/api/auth/logout")

    assert response.status_code == status.HTTP_204_NO_CONTENT

    response = api_client.post("/api/auth/logout")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
