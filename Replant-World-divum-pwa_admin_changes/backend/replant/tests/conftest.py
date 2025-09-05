import base64
import pathlib
from io import BytesIO

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from model_bakery import baker
from PIL import Image
from rest_framework.test import APIClient
from time_machine import travel

from replant.models import Country, PlantingOrganization, User

baker.generators.add(
    "phonenumber_field.modelfields.PhoneNumberField", lambda: "+48888234567"
)


@pytest.fixture(autouse=True)
def _always_use_db(db):
    """To avoid having to use the db fixture in every test."""


@pytest.fixture(autouse=True)
def _use_in_memory_storage_backend(settings):
    settings.STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.InMemoryStorage",
        },
    }


@pytest.fixture(autouse=True)
def time():
    with travel("2024-01-01", tick=False) as ft:
        yield ft


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def country():
    return Country.objects.filter(id=1, name="Aruba").first()


@pytest.fixture
def planting_organization(country: Country):
    return baker.make(
        PlantingOrganization,
        name="Green World",
        countries=[country],
    )


@pytest.fixture
def user(country: Country, planting_organization: PlantingOrganization):
    return baker.make(
        User,
        role=User.Role.PLANTER,
        planting_organization=planting_organization,
        country=country,
    )


@pytest.fixture
def user_client(user: User, api_client: APIClient):
    api_client.force_login(user)
    return api_client


@pytest.fixture
def image_b64():
    image = Image.new("1", size=(1, 1), color=0)

    in_memory_file = BytesIO()
    image.save(in_memory_file, format="png")

    return base64.b64encode(in_memory_file.getvalue()).decode()


@pytest.fixture
def images_path() -> pathlib.Path:
    return pathlib.Path(__file__).parent / "images"


@pytest.fixture
def simple_uploaded_file(images_path: pathlib.Path) -> SimpleUploadedFile:
    red_image = images_path / "red.png"
    return SimpleUploadedFile(
        name="red.png", content=red_image.read_bytes(), content_type="image/png"
    )
