from rest_framework import status
from rest_framework.test import APIClient


def test_list_countries_ok(api_client: APIClient):
    response = api_client.get("/api/countries")

    assert response.status_code == status.HTTP_200_OK
    assert response.json()[:10] == [
        {"id": 2, "name": "Afghanistan"},
        {"id": 6, "name": "Albania"},
        {"id": 65, "name": "Algeria"},
        {"id": 11, "name": "American Samoa"},
        {"id": 7, "name": "Andorra"},
        {"id": 3, "name": "Angola"},
        {"id": 4, "name": "Anguilla"},
        {"id": 12, "name": "Antarctica"},
        {"id": 14, "name": "Antigua and Barbuda"},
        {"id": 9, "name": "Argentina"},
    ]
