from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, views
from rest_framework.request import Request
from rest_framework.response import Response


class StatusView(views.APIView):
    @extend_schema(
        responses=inline_serializer("Status", {"status": serializers.CharField()})
    )
    def get(self, request: Request):
        return Response({"status": "ok"})
