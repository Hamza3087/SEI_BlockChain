from collections import OrderedDict
from typing import Optional

from django.db.models.query import QuerySet
from rest_framework import pagination
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


class PageNumberPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class LimitOffsetPagination(pagination.LimitOffsetPagination):
    max_limit = 200

    def prepare_pagination(self, queryset: QuerySet, request: Request):
        self.count: int = self.get_count(queryset)
        self.offset: int = self.get_offset(request)
        self.request = request

        limit = self.get_limit(request)
        self.limit: int = limit if limit else 0

        return queryset

    def get_limit(self, request: Request):
        limit = super().get_limit(request) or 10
        return min(limit, self.max_limit)

    def paginate_queryset(
        self, queryset: QuerySet, request: Request, view: Optional[APIView] = None
    ):
        queryset = self.prepare_pagination(queryset, request)

        if self.count == 0 or self.offset > self.count:
            return []

        return list(queryset[self.offset : self.offset + self.limit])  # noqa

    def get_pagination_dict(self, data: list):
        return OrderedDict(
            [
                ("count", self.count),
                ("offset", self.offset),
                ("limit", self.limit),
                ("results", data),
            ]
        )

    def get_paginated_response(self, data: list):
        return Response(self.get_pagination_dict(data))
