from rest_framework import viewsets
from .models import MembershipType
from .serializers import MembershipTypeSerializer

# Create your views here.

class MembershipTypeViewSet(viewsets.ModelViewSet):
    """
    Un ViewSet para ver y editar los tipos de membresía.
    """
    queryset = MembershipType.objects.all()
    serializer_class = MembershipTypeSerializer