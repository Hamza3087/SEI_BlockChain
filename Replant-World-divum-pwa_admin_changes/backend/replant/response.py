from rest_framework.response import Response
from rest_framework import status


def success(message, content=None, status_code=status.HTTP_200_OK):
    """
    Standardized Success Response
    """
    data = {"message": message}
    if content is not None:
        data["content"] = content
    return Response(data, status=status_code)


def failure(message, error_code=status.HTTP_400_BAD_REQUEST, status_code=status.HTTP_400_BAD_REQUEST):
    """
    Standardized Failure Response
    """
    data = {"message": message, "error_code": error_code}
    return Response(data, status=status_code)
