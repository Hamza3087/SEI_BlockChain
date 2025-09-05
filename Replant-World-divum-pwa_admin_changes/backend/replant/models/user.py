from enum import auto

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.auth.tokens import default_token_generator
from django.db import models
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from phonenumber_field.modelfields import PhoneNumberField

import env
from replant.auth import email_token_generator
from replant.time_zones import TIME_ZONES


class UserManager(BaseUserManager["User"]):
    def create_user(
        self,
        username: str | None = None,
        email: str | None = None,
        password: str | None = None,
        is_staff: bool = False,
        is_superuser: bool = False,
        **kwargs,
    ):
        username = User.normalize_username(username)
        user = User(
            username=username,
            email=email,
            is_staff=is_staff,
            is_superuser=is_superuser,
            **kwargs,
        )
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, username: str, password: str | None = None):
        return self.create_user(
            username=username,
            password=password,
            is_staff=True,
            is_superuser=True,
        )


class User(AbstractUser):
    TIME_ZONES = TIME_ZONES

    class Role(models.TextChoices):
        PLANTER = auto()
        SPONSOR = auto()
        PLANTING_ORGANIZATION = auto()

        @classmethod
        def get_email_based(cls):
            return (cls.SPONSOR, cls.PLANTING_ORGANIZATION)

    username = models.CharField(
        max_length=150,
        validators=[AbstractUser.username_validator],
        error_messages={"unique": "A user with that username already exists."},
        unique=True,
        null=True,
        blank=True,
    )
    email = models.EmailField(unique=True, null=True, blank=True)
    role = models.CharField(max_length=25, choices=Role.choices, null=True)
    is_email_verified = models.BooleanField(default=False)
    phone_number = PhoneNumberField(blank=True)
    country = models.ForeignKey(
        "replant.Country",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
    )
    planting_organization = models.ForeignKey(
        "replant.PlantingOrganization",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        verbose_name="planting organization / community",
    )
    sponsor = models.ForeignKey(
        "replant.Sponsor",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
    )
    time_zone = models.CharField(max_length=40, choices=TIME_ZONES, default="UTC")

    objects: UserManager = UserManager()  # type: ignore[misc,assignment]

    REQUIRED_FIELDS = []

    @property
    def is_planter(self):
        return self.role == User.Role.PLANTER

    def __str__(self):
        return self.username or self.email

    def get_password_reset_link(self):
        uid = urlsafe_base64_encode(force_bytes(self.pk))
        token = default_token_generator.make_token(self)
        return f"{env.UPLOAD_APP_URL}/reset-password?uid={uid}&token={token}"

    def get_email_verification_link(self):
        uid = urlsafe_base64_encode(force_bytes(self.pk))
        token = email_token_generator.make_token(self)
        return f"{env.MARKETPLACE_APP_URL}/email-confirm?uid={uid}&token={token}"
