from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, serializers, status
from rest_framework.request import Request
from rest_framework.response import Response

from replant.integrations import sendgrid
from replant.models import User

from . import utils


class ReqisterSponsorResendSerializer(serializers.Serializer):
    email = utils.EmailCaseInsensitiveField()


@extend_schema_view(post=extend_schema(responses={status.HTTP_204_NO_CONTENT: None}))
class RegisterSponsorResendView(generics.GenericAPIView):
    serializer_class = ReqisterSponsorResendSerializer

    def post(self, request: Request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        user = User.objects.filter(email=email).first()

        if user and not user.is_email_verified:
            sendgrid.send_email(
                to=email,
                template_name="email_verification",
                subject="Confirm your email address",
                context={"verification_link": user.get_email_verification_link()},
            )

        return Response(status=status.HTTP_204_NO_CONTENT)
