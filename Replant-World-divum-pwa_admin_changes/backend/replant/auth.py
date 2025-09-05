from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
from drf_spectacular.authentication import SessionScheme
from rest_framework import authentication
from rest_framework.request import Request


class SessionAuthentication(authentication.SessionAuthentication):
    """
    This class is needed, because REST Framework's default SessionAuthentication does never return 401's,
    because they cannot fill the WWW-Authenticate header with a valid value in the 401 response. As a
    result, we cannot distinguish calls that are not unauthorized (401 unauthorized) and calls for which
    the user does not have permission (403 forbidden). See https://github.com/encode/django-rest-framework/issues/5968

    We do set authenticate_header function in SessionAuthentication, so that a value for the WWW-Authenticate
    header can be retrieved and the response code is automatically set to 401 in case of unauthenticated requests.
    """

    def authenticate_header(self, request: Request):
        return "Session"


class OpenAPISessionScheme(SessionScheme):
    target_class = "replant.auth.SessionAuthentication"


class SpecialCharacterValidator:
    SPECIAL_CHARS = ("!", "@", "#", "$", "%", "^", "&", "*")

    def validate(self, password, user=None):
        if not any(c in self.SPECIAL_CHARS for c in password):
            raise ValidationError(
                _(
                    f"This password must contain at least one of {self.SPECIAL_CHARS} special characters."
                ),
                code="password_without_special_character",
            )

    def get_help_text(self):
        return _(
            f"Your password must contain at least one of {self.SPECIAL_CHARS} special characters."
        )


class DigitValidator:
    def validate(self, password: str, user=None):
        if not any(c.isdigit() for c in password):
            raise ValidationError(
                _("This password must contain at least 1 digit."),
                code="password_without_digits",
            )

    def get_help_text(self):
        return _("Your password must contain at least 1 digit.")


class UppercaseValidator:
    def validate(self, password: str, user=None):
        if not any(c.isupper() for c in password):
            raise ValidationError(
                _("This password must contain at least 1 uppercase character."),
                code="password_without_uppercase",
            )

    def get_help_text(self):
        return _("Your password must contain at least 1 uppercase character.")


class LowercaseValidator:
    def validate(self, password: str, user=None):
        if not any(c.islower() for c in password):
            raise ValidationError(
                _("This password must contain at least 1 lowercase character."),
                code="password_without_lowercase",
            )

    def get_help_text(self):
        return _("Your password must contain at least 1 lowercase character.")


class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        """
        Based on base class method. The hash will be invalidated after user verifies
        the email or after timeout. For now using same timeout as for password reset:
        settings.PASSWORD_RESET_TIMEOUT (3 days).
        """
        return f"{user.pk}{user.is_email_verified}{timestamp}"


email_token_generator = EmailVerificationTokenGenerator()
