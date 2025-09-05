from django.contrib import auth
from rest_framework import generics, serializers
from rest_framework.request import Request
from rest_framework.response import Response

from replant.models import User


class LoginEmailSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)
    is_first_login = serializers.BooleanField(read_only=True)

    def validate(self, attrs: dict):
        request = self.context["request"]
        email = attrs["email"]
        password = attrs["password"]

        user: User | None = auth.authenticate(request, username=email, password=password)  # type: ignore

        if user is None:
            raise serializers.ValidationError("Incorrect email or password.")

        attrs["is_first_login"] = user.last_login is None
        attrs["user"] = user
        return attrs


class LoginEmailView(generics.GenericAPIView):
    serializer_class = LoginEmailSerializer

    def post(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        auth.login(request, user)
        return Response(serializer.data)
