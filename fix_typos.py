import os
import django

# Configurar Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gym.settings")
django.setup()

from gymapp.models import MembershipType

def corregir_acentos():
    print("🔍 Buscando errores de codificación...")
    corregidos = 0
    
    # Recorrer todos los tipos de membresía
    for membresia in MembershipType.objects.all():
        if 'Ý' in membresia.name:
            nombre_viejo = membresia.name
            # Reemplazar la letra rota por la í con acento
            membresia.name = membresia.name.replace('Ý', 'í')
            membresia.save()
            print(f"✅ Corregido: {nombre_viejo}  --->  {membresia.name}")
            corregidos += 1
            
    print(f"✨ ¡Listo! Se corrigieron {corregidos} registros.")

if __name__ == "__main__":
    corregir_acentos()