from model_bakery import baker
from pytest_mock import MockerFixture
from rest_framework import status
from rest_framework.test import APIClient

from replant.models import User


def test_register_sponsor_resend_ok(api_client: APIClient, mocker: MockerFixture):
    baker.make(User, email="jon.snow@example.com", is_email_verified=False)
    mail_mock = mocker.patch("replant.integrations.sendgrid.send_email")
    data = {"email": "jon.snow@example.com"}

    response = api_client.post("/api/auth/register-sponsor-resend", data=data)

    assert response.status_code == status.HTTP_204_NO_CONTENT

    mail_mock.assert_called_once_with(
        to="jon.snow@example.com",
        template_name="email_verification",
        subject="Confirm your email address",
        context=mocker.ANY,
    )


def test_register_sponsor_resend_user_not_found_skip(
    api_client: APIClient, mocker: MockerFixture
):
    mail_mock = mocker.patch("replant.integrations.sendgrid.send_email")
    data = {"email": "jon.snow@example.com"}

    response = api_client.post("/api/auth/register-sponsor-resend", data=data)

    assert response.status_code == status.HTTP_204_NO_CONTENT

    mail_mock.assert_not_called()


def test_register_sponsor_resend_user_already_verified_skip(
    api_client: APIClient, mocker: MockerFixture
):
    baker.make(User, email="jon.snow@example.com", is_email_verified=True)
    mail_mock = mocker.patch("replant.integrations.sendgrid.send_email")
    data = {"email": "jon.snow@example.com"}

    response = api_client.post("/api/auth/register-sponsor-resend", data=data)

    assert response.status_code == status.HTTP_204_NO_CONTENT

    mail_mock.assert_not_called()
