from rest_framework import routers
from django.urls import path, include

from replant.admin_api.dashboard import AdminDashboardView
from replant.admin_api.organization import OrganizationView, OrganizationNameListView
from replant.admin_api.species import SpeciesView, AssignSpeciesView, SpeciesCommonNameListView
from replant.admin_api.sponsor import SponsorListView
from replant.admin_api.tree import TreeListView, TreeDetailView, TreeReviewView
from replant.admin_api.user import UserAPIView, UserPasswordResetView, ForgotPasswordAPIView


from replant.admin_api.sponsor import AssignNFTView, TreesStatusView


from replant.admin_api.dashboard import AdminStatisticsView

from replant.admin_api.species import SpeciesDeleteView, SpeciesIucnNameListView

from replant.admin_api.sponsor import SponsorParticularView

from replant.admin_api.sponsor import NftHistoryView

from replant.admin_api.organization import TreeCountryView

from replant.admin_api.user import UserNameAPIView

from replant.admin_api.sponsor import MintNFTView

from replant.admin_api.sponsor import SponsorCreateOrUpdateView

from replant.admin_api.report import ReportGenerationView

from replant.admin_api.sponsor import SponosorNameListView

from replant.admin_api.species import OrganizationSpeciesDeleteView

from replant.admin_api.sponsor import AssignTreesView

from replant.admin_api.organization import OrganizationUsdView

from replant.admin_api.organization import GenerateSignupLinkView

from replant.admin_api.sponsor import AssignSponosorTreesView

from replant.admin_api.organization import OrganizationEditView

from replant.admin_api.tree import TreeListingView

from replant.admin_api.dashboard import AdminDashboardStatisticsView

from replant.admin_api.report import DashboardReportGenerationView

v1_router = routers.SimpleRouter(trailing_slash=False)

urlpatterns = [
    # User APIs
    path("v1/admin/users", UserAPIView.as_view(), name="users"), # List & Create
    path("v1/admin/users/<int:user_id>/", UserAPIView.as_view(), name="get-user"),
    path("v1/admin/reset-password/<int:user_id>/", UserPasswordResetView.as_view(), name="reset-password"),
    path("v1/admin/forgot-password", ForgotPasswordAPIView.as_view(), name="forgot-password"),
    path("v1/admin/users/common-names", UserNameAPIView.as_view(), name="users-name"),

    # Organization APIs
    path("v1/admin/organisation", OrganizationView.as_view(), name="organization"),
    path("v1/admin/organisation/<int:organization_id>/", OrganizationView.as_view(), name="get-organization"),
        path("v1/admin/organisation-usd/<int:organization_id>/", OrganizationUsdView.as_view(), name="get-organization-usd"),
    path("v1/admin/organization/common-names", OrganizationNameListView.as_view(), name="organization-common-names"),
    path("v1/admin/organization/species/delete", OrganizationSpeciesDeleteView.as_view(), name="organization-species-delete"),
    path("v1/admin/generate-signup-link/<int:org_id>/", GenerateSignupLinkView.as_view(), name='generate_signup_link'),
    path("v1/admin/edit_organisation/<int:organization_id>", OrganizationEditView.as_view(), name="organization-edit"),

    # Species APIs
    path("v1/admin/species", SpeciesView.as_view(), name="species"),  # List & Create
    path("v1/admin/species/<int:species_id>/", SpeciesView.as_view(), name="species-detail"),
    path("v1/admin/species/delete/", SpeciesDeleteView.as_view(), name="species-delete"),


    # Assign Species API
    path("v1/admin/assign_species", AssignSpeciesView.as_view(), name="assign_species"),
    path("v1/admin/species/common-names", SpeciesCommonNameListView.as_view(), name="species-common-names"),
    path("v1/admin/species/iucn", SpeciesIucnNameListView.as_view(), name="species-iucn-names"),

    # Sponsor API s
    path("v1/admin/sponsors", SponsorListView.as_view(), name="sponsor-list"),
    path("v1/admin/particular/sponsor/<int:sponsor_id>", SponsorParticularView.as_view(), name="sponsor-details"),
    path("v1/admin/sponsors/trees", TreesStatusView.as_view(), name="trees-listing"),
    path("v1/admin/add/sponsors", SponsorCreateOrUpdateView.as_view(), name="sponsor-create-update"),
    path("v1/admin/assign-nft-old", AssignNFTView.as_view(), name="assign-nft"),
    path("v1/admin/assign-nft-new", AssignTreesView.as_view(), name="assign-nft-trees"),
    path("v1/admin/assign-nft", AssignSponosorTreesView.as_view(), name="assign-nft-sponsor-trees"),
    path("v1/admin/sponsor/common-names", SponosorNameListView.as_view(), name="species-common-names"),

    # NFT History API s
    path("v1/admin/nft/history", NftHistoryView.as_view(), name="nft-history-listing"),
    path("v1/admin/mint/nft", MintNFTView.as_view(), name="mint-nft"),


    # Dashboard API s
    path("v1/admin/dashboard", AdminDashboardView.as_view(), name="dashboard-info"),
    path("v1/admin/statistics", AdminDashboardStatisticsView.as_view(), name="statistics-info"),

    # Trees API s
    # path("v1/admin/trees", TreeListView.as_view(), name="tress"),
    path("v1/admin/trees", TreeListingView.as_view(), name="tress"),
    path("v1/admin/trees/<int:tree_id>/", TreeDetailView.as_view(), name="tree-info"),
    path("v1/admin/tree_review", TreeReviewView.as_view(), name="tree-review"),

    # Country API s
    path("v1/admin/countries", TreeCountryView.as_view(), name="organization-counties"),

    # Report Generation API s
    path("v1/admin/report", DashboardReportGenerationView.as_view(), name="organization-counties"),
]
