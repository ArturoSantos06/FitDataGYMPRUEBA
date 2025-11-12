from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MembershipTypeViewSet

# Crea un router y registra nuestro viewset
router = DefaultRouter()
router.register(r'memberships', MembershipTypeViewSet, basename='membershiptype')

# Las URLs del API son determinadas automáticamente por el router
urlpatterns = [
    path('', include(router.urls)),
]