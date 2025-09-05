from django.conf.locale.en import formats as en_formats
from django.contrib import admin
from django.contrib.auth.models import Group

from .assigned_species import AssignedSpecies
from .country import CountryAdmin
from .history import HistoryAdmin
from .nft import Nft
from .planting_organization import PLantingOrganizationAdmin
from .species import SpeciesAdmin
from .sponsor import SponsorAdmin
from .tree import TreeAdmin
from .tree_to_mint import TreeToMintAdmin
from .tree_to_review import TreeToReviewAdmin
from .trees_cluster import TreesClusterAdmin
from .user import UserAdmin
from .user_history import UserHistoryAdmin

admin.site.unregister(Group)
admin.site.site_url = ""

en_formats.DATE_FORMAT = "Y-m-d"
en_formats.DATETIME_FORMAT = "Y-m-d H:i"
