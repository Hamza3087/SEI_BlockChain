from django.db import transaction
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, serializers, status
from rest_framework.request import Request
from rest_framework.response import Response

from replant.models import Country, Passcode, PlantingOrganization, User

from . import utils
from .country import CountrySerializer


class PlantingOrganizationSerializer(serializers.ModelSerializer):
    countries = CountrySerializer(many=True)

    class Meta:
        model = PlantingOrganization
        fields = (
            "name",
            "countries",
        )


class PasscodeRegisterSerializer(serializers.ModelSerializer):
    planting_organization = PlantingOrganizationSerializer()

    class Meta:
        model = Passcode
        fields = ("planting_organization",)


class RegisterToOrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "phone_number", "country", "password")
        extra_kwargs = {
            "password": {"write_only": True},
            "username": {"required": True, "allow_null": False},
            "phone_number": {"required": True, "allow_null": False},
            "country": {"required": True, "allow_null": False},
        }

    def _validate_country(
        self, planting_organization: PlantingOrganization, country: Country
    ):
        if country not in planting_organization.countries.all():
            raise serializers.ValidationError(
                {"country": ["Only organization's countries can be selected."]}
            )

    def validate(self, attrs: dict):
        passcode: Passcode = self.context["passcode"]
        username = attrs["username"]
        password = attrs["password"]
        country = attrs["country"]

        planting_organization = passcode.planting_organization
        self._validate_country(planting_organization, country)

        # UserAttributeSimilarityValidator requires user object to validate password
        user = User(username=username)
        utils.validate_password_in_serializer(password, user)

        attrs["planting_organization"] = planting_organization
        return attrs

    @transaction.atomic
    def create(self, validated_data: dict):
        return User.objects.create_user(
            role=User.Role.PLANTER,
            planting_organization=validated_data["planting_organization"],
            username=validated_data["username"],
            phone_number=validated_data["phone_number"],
            country=validated_data["country"],
            password=validated_data["password"],
        )


@extend_schema_view(
    post=extend_schema(
        responses={
            status.HTTP_201_CREATED: RegisterToOrganizationSerializer,
        }
    ),
)
class RegisterToOrganizationView(generics.GenericAPIView):
    queryset = Passcode.objects.all()
    lookup_field = "code"

    def get_serializer_class(self):
        if self.request.method == "GET":
            return PasscodeRegisterSerializer
        return RegisterToOrganizationSerializer

    def get_object(self) -> Passcode:
        passcode: Passcode = super().get_object()

        if not passcode.is_valid:
            raise serializers.ValidationError(
                {"non_field_errors": ["The code has expired."]}
            )

        return passcode

    def get(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def post(self, request: Request, *args, **kwargs) -> Response:
        passcode = self.get_object()

        serializer = self.get_serializer(data=request.data)
        serializer.context["passcode"] = passcode
        serializer.is_valid(raise_exception=True)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
