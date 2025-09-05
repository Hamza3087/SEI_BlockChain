from rest_framework import generics, serializers

from replant.models import Country


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = (
            "id",
            "name",
        )


class CountryView(generics.ListAPIView):
    serializer_class = CountrySerializer
    queryset = Country.objects.all()
    pagination_class = None
