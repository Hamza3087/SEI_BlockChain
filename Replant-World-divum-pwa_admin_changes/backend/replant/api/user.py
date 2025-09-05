from drf_extra_fields.fields import Base64ImageField
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import exceptions, serializers, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from replant.models import PlantingOrganization, Sponsor, User

from .country import CountrySerializer


class PlantingOrganizationSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlantingOrganization
        fields = ("name",)


class SponsorUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsor
        fields = ("type", "name", "bio", "logo")


class SponsorUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsor
        fields = ("name", "bio", "logo")

    logo = Base64ImageField(allow_null=True)

    def update(self, sponsor: Sponsor, validated_data: dict):
        sponsor.name = validated_data["name"]
        sponsor.bio = validated_data["bio"]
        sponsor.logo = validated_data["logo"]
        sponsor.save()
        return sponsor


class UserSerializer(serializers.ModelSerializer):
    country = CountrySerializer()
    planting_organization = PlantingOrganizationSimpleSerializer()
    sponsor = SponsorUserSerializer()
    date_joined = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source="id", read_only=True)

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "phone_number",
            "country",
            "planting_organization",
            "sponsor",
            "date_joined",
            "user_id"
        )
    def get_date_joined(self, obj):
        """Return timestamp in ISO 8601 format with microseconds."""
        return obj.date_joined.isoformat() if obj.date_joined else None


class UserUpdateSerializer(serializers.ModelSerializer):
    sponsor = SponsorUserUpdateSerializer(allow_null=True)

    class Meta:
        model = User
        fields = ("sponsor",)

    def update(self, user: User, validated_data: dict):
        sponsor_data = validated_data.pop("sponsor")
        if bool(user.sponsor) ^ bool(sponsor_data):
            message = {
                "sponsor": (
                    "Sponsor cannot be null"
                    if user.sponsor
                    else "No sponsor is associated with the user"
                )
            }
            raise exceptions.ValidationError(message)

        if sponsor_data:
            sponsor_serializer = SponsorUserUpdateSerializer()
            user.sponsor = sponsor_serializer.update(user.sponsor, sponsor_data)

        return user


@extend_schema_view(put=extend_schema(request=UserUpdateSerializer))
class UserView(views.APIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request: Request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request: Request):
        serializer = UserUpdateSerializer(instance=request.user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)
