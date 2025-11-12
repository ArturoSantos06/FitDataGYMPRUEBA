from django.contrib import admin
from django.urls import path, re_path, include # Asegúrate de que 'include' esté aquí
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),

    # --- ¡LÍNEA AÑADIDA! ---
    # Todas las URLs de 'gymapp.urls' ahora empezarán con 'api/'
    path('api/', include('gymapp.urls')), 

    # Esta ruta "catch-all" de React siempre debe ir AL FINAL
    re_path(r'^.*$', TemplateView.as_view(template_name='base.html')),
]