from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.response import Response
from rest_framework.views import APIView


class CSRFCookieView(APIView):
    """Simple endpoint to set the CSRF cookie via GET.

    This is useful for SPAs that don't render Django templates but still need
    a CSRF cookie in the browser before making POST/PUT/DELETE requests.
    """

    @method_decorator(ensure_csrf_cookie)
    def get(self, request, *args, **kwargs):
        return Response(status=204)

