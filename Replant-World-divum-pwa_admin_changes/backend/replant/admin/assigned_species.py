from admin_auto_filters.filters import AutocompleteFilterFactory
from django import forms
from django.contrib import admin

from replant.models import AssignedSpecies
from replant.models.planting_organization import PlantingOrganization

from .utils import TrackableModelAdmin


class AssignedSpeciesForm(forms.ModelForm):
    class Meta:
        model = AssignedSpecies
        fields = (
            "planting_organization",
            "country",
            "species",
            "is_native",
            "planting_cost_usd",
        )

    def clean(self):
        cleaned_data: dict = super().clean()

        if self.errors:
            return

        planting_organization: PlantingOrganization | None = cleaned_data.get(
            "planting_organization"
        )
        country = cleaned_data.get("country")

        if (
            planting_organization
            and country
            and country not in planting_organization.countries.all()
        ):
            raise forms.ValidationError(
                {"country": ["Only organization's countries can be selected."]}
            )


@admin.register(AssignedSpecies)
class AssignedSpeciesAdmin(TrackableModelAdmin):
    list_display = (
        "species",
        "planting_organization",
        "country",
        "is_native",
        "planting_cost_usd",
    )
    list_filter = (
        AutocompleteFilterFactory(
            title="Planting organization / community",
            base_parameter_name="planting_organization",
        ),
    )
    autocomplete_fields = (
        "planting_organization",
        "country",
        "species",
    )

    fields = (
        "planting_organization",
        "country",
        "species",
        "is_native",
        "planting_cost_usd",
        "created_at",
        "updated_at",
    )
    readonly_fields = (
        "created_at",
        "updated_at",
    )
    form = AssignedSpeciesForm

    class Media:
        js = ("js/search.js",)

    def get_readonly_fields(self, request, obj):
        if obj is None:
            return self.readonly_fields
        return list(self.readonly_fields) + [
            "planting_organization",
            "country",
            "species",
            "is_native",
        ]

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        field = super().formfield_for_dbfield(db_field, request, **kwargs)
        # Make country dropdown filtered by planting organization
        # Source: https://bitbucket.org/danilovmy/django-con-us-2022/src/master/autocompletes/
        if db_field.name == "planting_organization":
            field.widget.attrs.update({"onchange": "search(this);", "data-name": "country"})  # type: ignore
        return field
