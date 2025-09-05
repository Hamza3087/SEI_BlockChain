import pytest
from rest_framework import serializers

from replant.api.utils import validate_password_in_serializer
from replant.models import User


def test_invalid_password_user_attribute_similar():
    user = User(username="myusername")
    password = "Myusername1@"

    with pytest.raises(
        serializers.ValidationError,
        match="password.*The password is too similar to the username.",
    ):
        validate_password_in_serializer(password, user)


def test_invalid_password_too_short():
    user = User(username="user")
    password = "Di8*"

    with pytest.raises(
        serializers.ValidationError,
        match="password.*This password is too short. It must contain at least 8 characters.",
    ):
        validate_password_in_serializer(password, user)


def test_invalid_password_too_common():
    user = User(username="user")
    password = "password123"

    with pytest.raises(
        serializers.ValidationError,
        match="password.*This password is too common.",
    ):
        validate_password_in_serializer(password, user)


def test_invalid_password_special_character_missing():
    user = User(username="user")
    password = "DifficultPassword8"

    with pytest.raises(
        serializers.ValidationError,
        match=r"password.*This password must contain at least one of \('\!', '@', '#', '\$', '%', '\^', '&', '\*'\) special characters.",
    ):
        validate_password_in_serializer(password, user)


def test_invalid_password_digit_missing():
    user = User(username="user")
    password = "DifficultPassword*"

    with pytest.raises(
        serializers.ValidationError,
        match="password.*This password must contain at least 1 digit.",
    ):
        validate_password_in_serializer(password, user)


def test_invalid_password_missing_uppercase():
    user = User(username="user")
    password = "difficultpassword8*"

    with pytest.raises(
        serializers.ValidationError,
        match="password.*This password must contain at least 1 uppercase character.",
    ):
        validate_password_in_serializer(password, user)


def test_invalid_password_missing_lowercase():
    user = User(username="user")
    password = "DIFFICULTPASSWORD8*"

    with pytest.raises(
        serializers.ValidationError,
        match="password.*This password must contain at least 1 lowercase character.",
    ):
        validate_password_in_serializer(password, user)
