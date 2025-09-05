from typing import TYPE_CHECKING, Type

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

if TYPE_CHECKING:
    from .models import User


class UsernameOrEmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        UserModel: "Type[User]" = get_user_model()

        if username is None and email is None or password is None:
            return
        try:
            if username is not None:
                user = UserModel.objects.get(username=username)
            else:
                user = UserModel.objects.get(email=email)
        except UserModel.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user (#20760).
            UserModel().set_password(password)
        else:
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
