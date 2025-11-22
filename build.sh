#!/usr/bin/env bash
# Salir si hay error
set -o errexit

# 1. Frontend
echo "Construyendo Frontend..."
cd frontend
npm install
npm run build
cd ..

# 2. Backend
echo "Instalando dependencias..."
pip install -r requirements.txt

# 3. Estáticos
echo "Recolectando estáticos..."
python manage.py collectstatic --no-input

# 4. Migraciones (Crea tablas vacías)
echo "Corriendo migraciones..."
python manage.py migrate

# 5. CARGAR TUS DATOS (Aquí ocurre la magia)
echo "Cargando respaldo de datos..."
python manage.py loaddata datos_gym.json
