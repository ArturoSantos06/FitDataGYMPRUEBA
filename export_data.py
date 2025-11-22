import os
import django
import sys

# Configurar Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gym.settings")
django.setup()

from django.core.management import call_command

def exportar():
    print("📦 Exportando datos a 'datos_gym.json' en UTF-8...")
    
    # Abrimos el archivo forzando UTF-8 para que Linux lo entienda
    with open('datos_gym.json', 'w', encoding='utf-8') as f:
        call_command(
            'dumpdata', 
            exclude=['auth.permission', 'contenttypes', 'sessions', 'admin.logentry'], 
            indent=2, 
            stdout=f
        )
    
    print("✅ ¡Exportación completada con éxito!")

if __name__ == "__main__":
    exportar()