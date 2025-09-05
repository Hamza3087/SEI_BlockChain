from django.urls import path
from rest_framework import routers

from .assigned_species import AssignedSpeciesView
from .auth_login import LoginView
from .auth_login_email import LoginEmailView
from .auth_logout import LogoutView
from .auth_register import RegisterView
from .auth_register_sponsor import RegisterSponsorView
from .auth_register_sponsor_resend import RegisterSponsorResendView
from .auth_register_sponsor_verify import RegisterSponsorVerifyView
from .auth_register_to_organization import RegisterToOrganizationView
from .auth_reset_password import ResetPasswordView
from .country import CountryView
from .nft import NftView
from .sponsor import SponsorView
from .status import StatusView
from .tree import TreeView
from .tree_cluster import TreeClustersView
from .tree_point import TreePointsView
from .tree_summary import TreeSummaryView
from .user import UserView
from .user_history import UserHistoryView

router = routers.SimpleRouter(trailing_slash=False)

router.register("sponsors", SponsorView)
router.register("nfts", NftView)

urlpatterns = [
    path("assigned-species", AssignedSpeciesView.as_view()),
    path("auth/login", LoginView.as_view()),
    path("auth/login-email", LoginEmailView.as_view()),
    path("auth/logout", LogoutView.as_view()),
    path("auth/register", RegisterView.as_view()),
    path("auth/register-sponsor", RegisterSponsorView.as_view()),
    path("auth/register-sponsor-verify", RegisterSponsorVerifyView.as_view()),
    path("auth/register-sponsor-resend", RegisterSponsorResendView.as_view()),
    path(
        "auth/register-to-organization/<uuid:code>",
        RegisterToOrganizationView.as_view(),
    ),
    path("auth/reset-password", ResetPasswordView.as_view()),
    path("countries", CountryView.as_view()),
    path("trees", TreeView.as_view()),
    path("trees/summary", TreeSummaryView.as_view()),
    path("tree-clusters", TreeClustersView.as_view()),
    path("tree-points", TreePointsView.as_view()),
    path("status", StatusView.as_view()),
    path("user", UserView.as_view()),
    path("user-history", UserHistoryView.as_view()),
    *router.urls,
]
