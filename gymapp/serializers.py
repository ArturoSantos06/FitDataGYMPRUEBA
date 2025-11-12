from rest_framework import serializers
from .models import MembershipType

class MembershipTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipType
        # Define los campos del modelo que el API expondrá
        fields = ['id', 'name', 'price', 'duration_days']