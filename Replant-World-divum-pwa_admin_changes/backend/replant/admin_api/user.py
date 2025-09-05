from rest_framework.response import Response
from rest_framework.validators import UniqueValidator
from rest_framework.views import APIView
from rest_framework import serializers

from replant.admin_api.authentication import CsrfExemptSessionAuthentication
from replant.integrations.sendgrid import send_email
from replant.logging import logger
from replant.pagination import PageNumberPagination
from replant.response import success, failure
from replant.models import User, Country, PlantingOrganization, Tree
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated

class UserSerializer(serializers.ModelSerializer):
    country = serializers.PrimaryKeyRelatedField(
        queryset=Country.objects.all(), allow_null=True
    )
    planting_organization = serializers.PrimaryKeyRelatedField(
        queryset=PlantingOrganization.objects.all(), allow_null=True
    )
    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="This email already exists."
            )
        ]
    )
    username = serializers.CharField(
        required=True,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="This username already exists."
            )
        ],
        error_messages={
            "required": "username is a required property"
        }
    )
    role = serializers.CharField(required=True)

    def validate_role(self, value):
        return value.upper()
    phone_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["username", "email", "role", "phone_number", "planting_organization", "country"]

class UserListSerializer(serializers.ModelSerializer):
    country = serializers.CharField(source="country.name", read_only=True)  # Convert ID to Name in GET
    planting_organization = serializers.CharField(source="planting_organization.name", read_only=True)  # Convert ID to Name in GET
    date_joined = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source="id", read_only=True)  # Rename 'id' to 'user_id'
    class Meta:
        model = User
        fields = ["username", "email", "role", "phone_number", "planting_organization", "country","date_joined","user_id"]


    def get_date_joined(self, obj):
        """Return timestamp in ISO 8601 format with microseconds."""
        return obj.date_joined.isoformat() if obj.date_joined else None


class UserAPIView(APIView):
    # authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]
    class CustomPagination(PageNumberPagination):
        page_size = 10
        page_size_query_param = 'per_page'
        max_page_size = 100

    def post(self, request):
        """Handles user creation"""
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return success("User created successfully",
                {"username": serializer.validated_data["username"]})
        return failure(serializer.errors)

    def get(self, request, user_id=None):
        """Handles user listing (with pagination) or retrieving a single user (without pagination)"""

        if user_id:
            try:
                user = User.objects.get(id=user_id, role="PLANTER")
            except User.DoesNotExist:
                return failure("User not found", error_code=400)

            tree_count = Tree.objects.filter(planting_organization=user.planting_organization).count()

            user_data = UserListSerializer(user).data
            user_data["number_of_trees"] = tree_count

            return success("User fetched successfully", user_data)

        planting_org_name = request.query_params.get("organisation_name", None)
        country_id = request.query_params.get("country_id", None)
        organization_id = request.query_params.get("organization_id",None)
        username = request.query_params.get("username", None)  # New username search key
        users = User.objects.filter(role="PLANTER").order_by("-date_joined")

        if planting_org_name:
            users = users.filter(
                planting_organization__name__icontains=planting_org_name
            )
        if country_id:
            users = users.filter(country_id=country_id)
        if organization_id:
            users = users.filter(planting_organization_id=organization_id)
        if username:
            users = users.filter(username__icontains=username)

        paginator = self.CustomPagination()
        result_page = paginator.paginate_queryset(users, request)

        user_data = []
        for user in result_page:
            tree_count = Tree.objects.filter(planting_organization=user.planting_organization).count()


            user_dict = UserListSerializer(user).data
            user_dict["number_of_trees"] = tree_count

            user_data.append(user_dict)

        content = {
            "data": user_data,
            "count": paginator.page.paginator.count,
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link(),
        }

        return success("Users fetched successfully", content)


class UserPasswordResetView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, user_id=None):
        if not user_id:
            return failure("User ID is required")

        try:
            user = User.objects.get(pk=user_id)
            reset_link = user.get_password_reset_link()
            return success("Password reset link generated successfully", {"reset_link": reset_link})
        except User.DoesNotExist:
            return failure("User not found")


class ForgotPasswordAPIView(APIView):

    def post(self, request):
        """Handles forgot password functionality by sending a reset link to the user's email."""
        email = request.data.get("email")

        if not email:
            return failure("Email is required", error_code=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return failure("User with this email does not exist", error_code=400)


        reset_link = user.get_password_reset_link()

        email_context = {"reset_link": reset_link, "user": user}
        subject = "Password Reset Request"
        template_name = "password_reset"

        try:
            logger.info(f"Email context {email_context}")
            send_email(to=user.email, template_name=template_name, subject=subject, context=email_context)
        except Exception as e:
            return failure(f"Failed to send email: {str(e)}", error_code=500)

        return success("Password reset email sent successfully", {"email": user.email})


class UserNameAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch users where username is not null or empty, and only distinct usernames
        users = (
            User.objects
            .filter(role="PLANTER")
            .exclude(username__isnull=True)
            .exclude(username="")
            .values("id", "username")
            .distinct()
        )


        unique_usernames = {}
        for user in users:
            username = user["username"]
            if username not in unique_usernames:
                unique_usernames[username] = user["id"]

        # Now build the response list
        user_list = [{"id": id, "name": name} for name, id in unique_usernames.items()]

        return Response(user_list)