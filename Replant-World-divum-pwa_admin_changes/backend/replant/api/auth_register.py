from django.db import transaction
from rest_framework import generics, serializers

from replant.models import User

from . import utils


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "phone_number", "country", "password")
        extra_kwargs = {
            "password": {"write_only": True},
            "country": {"required": True, "allow_null": False},
        }

    def validate(self, attrs: dict):
        username = attrs["username"]
        password = attrs["password"]

        # UserAttributeSimilarityValidator requires user object to validate password
        user = User(username=username)
        utils.validate_password_in_serializer(password, user)

        return attrs

    @transaction.atomic
    def create(self, validated_data: dict):
        return User.objects.create_user(
            username=validated_data["username"],
            phone_number=validated_data["phone_number"],
            country=validated_data["country"],
            password=validated_data["password"],
        )


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
