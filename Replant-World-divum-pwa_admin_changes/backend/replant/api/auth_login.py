from django.contrib import auth
from rest_framework import generics, serializers
from rest_framework.request import Request
from rest_framework.response import Response


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs: dict):
        request = self.context["request"]
        username = attrs["username"]
        password = attrs["password"]

        user = auth.authenticate(request, username=username, password=password)

        if user is None:
            raise serializers.ValidationError("Incorrect username or password.")

        attrs["user"] = user
        return attrs


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        auth.login(request, user)
        return Response(serializer.data)
