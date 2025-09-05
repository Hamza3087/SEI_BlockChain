from admin_auto_filters.filters import AutocompleteFilterFactory
from django import forms
from django.contrib import admin
from django.http.request import HttpRequest
from django.utils.html import format_html
from rangefilter.filters import DateRangeFilterBuilder

from replant.models import AssignedSpecies, Tree, TreeToReview

from .utils import TrackableModelAdmin

CHOICES = (
    (Tree.ReviewState.APPROVED, "Approve"),
    (Tree.ReviewState.REJECTED, "Reject"),
)


class TreeToReviewForm(forms.ModelForm):
    rejection_reason = forms.CharField(
        widget=forms.Textarea({"cols": "13", "rows": "8"}), required=False
    )
    review_state = forms.ChoiceField(widget=forms.RadioSelect, choices=CHOICES)

    class Meta:
        model = TreeToReview
        fields = (
            "species",
            "review_state",
            "rejection_reason",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["species"].widget.can_view_related = False
        self.fields["species"].widget.can_add_related = False
        self.fields["species"].widget.can_change_related = False
        self.fields["species"].widget.can_delete_related = False

    def clean_species(self):
        initial_species_id = self.initial["species"]
        species = self.cleaned_data["species"]

        if initial_species_id != species.id:
            assigned_species = AssignedSpecies.objects.filter(
                planting_organization=self.instance.planting_organization,
                country=self.instance.country,
                species=species,
            ).first()

            if assigned_species is None:
                self.add_error(
                    "species",
                    f"Species is not yet assigned to this planting organization / community in {self.instance.country}.",
                )

            else:
                self.instance.planting_cost_usd = assigned_species.planting_cost_usd
                self.instance.is_native = assigned_species.is_native

        return species

    def clean(self):
        cleaned_data = super().clean()

        if self.errors:
            return

        review_state = cleaned_data["review_state"]
        rejection_reason = cleaned_data.get("rejection_reason")

        if review_state == Tree.ReviewState.REJECTED and not rejection_reason:
            raise forms.ValidationError(
                {"rejection_reason": ["This field is required."]}
            )

        if review_state != Tree.ReviewState.REJECTED and rejection_reason:
            raise forms.ValidationError(
                {
                    "rejection_reason": [
                        "This field is only required in case of rejection."
                    ]
                }
            )


@admin.register(TreeToReview)
class TreeToReviewAdmin(TrackableModelAdmin):
    list_display_links = None
    list_display = (
        "image_tag",
        "species",
        "planting_organization",
        "created_by",
        "created_at_date",
        "rejection_reason",
        "review_state",
    )
    list_editable = (
        "species",
        "review_state",
        "rejection_reason",
    )
    autocomplete_fields = ("species",)
    list_per_page = 10
    list_max_show_all = 0
    list_filter = (
        ("created_at", DateRangeFilterBuilder(title="By Created at")),
        AutocompleteFilterFactory(title="Species", base_parameter_name="species"),
        AutocompleteFilterFactory(
            title="Planting organization / community",
            base_parameter_name="planting_organization",
        ),
        AutocompleteFilterFactory(title="Created by", base_parameter_name="created_by"),
    )
    show_facets = False
    change_list_template = "admin/change_list_tree_review.html"

    fields = (
        "id",
        "review_state",
        "image_tag",
        "image",
        "latitude",
        "longitude",
        "planting_organization",
        "country",
        "species",
        "is_native",
        "planting_cost_usd",
        "created_by",
        "created_at",
    )
    readonly_fields = fields

    class Media:
        css = {"all": ("css/tree_to_review.css",)}

    def image_tag(self, obj: TreeToReview):
        return format_html('<img class="image-tag" src="{}" />', obj.image.url)

    @admin.display(description="created at", ordering="created_at__date")
    def created_at_date(self, obj: TreeToReview):
        return obj.created_at.date()

    def has_add_permission(self, request: HttpRequest) -> bool:
        return False

    def has_change_permission(
        self, request: HttpRequest, obj: TreeToReview | None = None
    ) -> bool:
        return True

    def has_delete_permission(
        self, request: HttpRequest, obj: TreeToReview | None = None
    ) -> bool:
        return False

    def get_changelist_form(self, request, **kwargs):
        kwargs.setdefault("form", TreeToReviewForm)
        return super().get_changelist_form(request, **kwargs)

    def get_queryset(self, request: HttpRequest):
        return (
            super()
            .get_queryset(request)
            .select_related("species", "planting_organization", "country", "created_by")
        )
