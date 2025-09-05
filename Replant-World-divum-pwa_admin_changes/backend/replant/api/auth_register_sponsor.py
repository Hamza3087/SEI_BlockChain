from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from drf_extra_fields.fields import Base64ImageField
from rest_framework import generics, serializers

from replant.integrations import sendgrid
from replant.models import Sponsor, User

from . import utils


class RegisterSponsorSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=Sponsor.Type.choices, write_only=True)
    name = serializers.CharField(max_length=100, write_only=True)
    email = utils.EmailCaseInsensitiveField(max_length=254)
    password = serializers.CharField(
        max_length=128, write_only=True, validators=[validate_password]
    )
    bio = serializers.CharField(allow_blank=True, write_only=True)
    logo = Base64ImageField(allow_null=True, write_only=True)

    def validate_email(self, email: str):
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return email

    def validate(self, attrs: dict):
        email = attrs["email"]
        password = attrs["password"]

        # UserAttributeSimilarityValidator requires user object to validate password
        user = User(email=email)
        utils.validate_password_in_serializer(password, user)

        return attrs

    @transaction.atomic
    def create(self, validated_data: dict):
        type_ = validated_data["type"]
        name = validated_data["name"]
        email = validated_data["email"]
        password = validated_data["password"]
        bio = validated_data["bio"]
        logo = validated_data["logo"]

        sponsor, _ = Sponsor.objects.update_or_create(
            contact_person_email=email,
            defaults={
                "type": type_,
                "name": name,
                "wallet_address": None,
                "bio": bio,
                "logo": logo,
            },
        )
        user = User.objects.create_user(
            role=User.Role.SPONSOR, email=email, password=password, sponsor=sponsor
        )

        try:
            sendgrid.send_email(
                to=email,
                template_name="email_verification",
                subject="Confirm your email address",
                context={"verification_link": user.get_email_verification_link()},
            )
        except sendgrid.SendGridAPIError:
            raise serializers.ValidationError(
                {
                    "non_field_errors": [
                        "Registration is not possible now. Try again later."
                    ]
                }
            )
        return user


class RegisterSponsorView(generics.CreateAPIView):
    serializer_class = RegisterSponsorSerializer
