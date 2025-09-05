from django.http.request import HttpRequest
from django.utils import timezone


class TimeZoneMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request: HttpRequest):
        user = request.user
        if not user.is_anonymous:
            timezone.activate(user.time_zone)
        return self.get_response(request)
