from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.utils.http import urlsafe_base64_decode
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, serializers, status
from rest_framework.request import Request
from rest_framework.response import Response

from replant.models import User

from . import utils


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs: dict):
        uid = attrs["uid"]
        token = attrs["token"]
        password = attrs["password"]

        try:
            uid = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=uid)
        except (
            TypeError,
            ValueError,
            OverflowError,
            User.DoesNotExist,
            ValidationError,
        ):
            raise serializers.ValidationError({"uid": ["Invalid value."]})

        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError({"token": ["Invalid value."]})

        utils.validate_password_in_serializer(password, user)

        attrs["user"] = user
        return attrs

    def save(self):
        user: User = self.validated_data["user"]
        user.set_password(self.validated_data["password"])
        user.save()


@extend_schema_view(post=extend_schema(responses={status.HTTP_204_NO_CONTENT: None}))
class ResetPasswordView(generics.GenericAPIView):
    serializer_class = ResetPasswordSerializer

    def post(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
