from rest_framework import status
from rest_framework.test import APIClient

from replant.models import User, UserHistory


def test_create_user_history_empty_ok(
    user_client: APIClient,
):
    response = user_client.post("/api/user-history", data={"history": []})

    assert response.status_code == status.HTTP_204_NO_CONTENT


def test_create_user_history_ok(
    user_client: APIClient,
    user: User,
):
    data = {
        "history": [
            {
                "created_at": "2024-03-29T08:37:39.063Z",
                "error_name": "GeolocationPositionError",
                "error_message": "Timeout expired",
                "event_type": "LOCATION_FAILED",
                "browser": "Brave",
                "browser_version": "123.0.0.0",
                "device": "Macintosh",
                "os": "Mac OS",
                "os_version": "10",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            }
        ]
    }
    response = user_client.post("/api/user-history", data=data)

    assert response.status_code == status.HTTP_204_NO_CONTENT

    user_history_log = UserHistory.objects.get()
    assert user_history_log.event_type == UserHistory.EventType.LOCATION_FAILED
    assert (
        user_history_log.user_agent
        == "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    )
    assert user_history_log.os == "Mac OS"
    assert user_history_log.os_version == "10"
    assert user_history_log.browser == "Brave"
    assert user_history_log.browser_version == "123.0.0.0"
    assert user_history_log.device == "Macintosh"
    assert user_history_log.error_name == "GeolocationPositionError"
    assert user_history_log.error_message == "Timeout expired"
    assert user_history_log.user == user
    assert str(user_history_log.created_at) == "2024-03-29 08:37:39.063000+00:00"


def test_create_user_history_unauthorized(api_client: APIClient):
    response = api_client.post("/api/user-history")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
