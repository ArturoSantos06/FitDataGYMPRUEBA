from django.contrib import admin
from .models import MembershipType # 1. Importa tu modelo

# Register your models here.

# 2. Esta línea "registra" el modelo en el panel de admin
admin.site.register(MembershipType)