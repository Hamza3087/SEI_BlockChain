from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils.http import urlsafe_base64_decode
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, serializers, status
from rest_framework.request import Request
from rest_framework.response import Response

from replant.auth import email_token_generator
from replant.models import User


class RegisterSponsorVerifySerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()

    def validate(self, attrs: dict):
        uid = attrs["uid"]
        token = attrs["token"]

        try:
            uid = urlsafe_base64_decode(uid).decode()
            user = User.objects.select_for_update().get(pk=uid)
        except (
            TypeError,
            ValueError,
            OverflowError,
            User.DoesNotExist,
            ValidationError,
        ):
            raise serializers.ValidationError({"uid": ["Invalid value."]})

        if not email_token_generator.check_token(user, token):
            raise serializers.ValidationError({"token": ["Invalid value."]})

        attrs["user"] = user
        return attrs

    def save(self):
        user: User = self.validated_data["user"]
        user.is_email_verified = True
        user.save()


@extend_schema_view(post=extend_schema(responses={status.HTTP_204_NO_CONTENT: None}))
class RegisterSponsorVerifyView(generics.GenericAPIView):
    serializer_class = RegisterSponsorVerifySerializer

    @transaction.atomic
    def post(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
