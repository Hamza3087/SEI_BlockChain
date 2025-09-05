
from django.utils.deprecation import MiddlewareMixin

from replant.logging import logger


class RequestResponseMiddleware(MiddlewareMixin):
    def process_request(self, request):
        """Executed BEFORE request processing"""
        request_body = request.body.decode("utf-8") if request.body else None
        logger.info(f"Before Request: {request.method} {request.path}, \n Body: {request_body}")

    def process_response(self, request, response):
        """Executed AFTER request processing"""
        logger.info(f"After Request: {request.method} {request.path} - Status: {response.status_code}")
        return response