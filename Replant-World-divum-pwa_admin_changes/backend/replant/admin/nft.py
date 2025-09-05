from admin_auto_filters.filters import AutocompleteFilterFactory
from django.contrib import admin

from replant.models import Nft

from .tree import TreeAdmin


@admin.register(Nft)
class NftAdmin(TreeAdmin):
    list_filter = [
        AutocompleteFilterFactory(title="Sponsor", base_parameter_name="sponsor"),
    ]
