import os
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.contrib.auth.models import User
from rest_framework import viewsets, mixins, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

# Importar modelos y serializers
from .models import MembershipType, UserMembership, Producto, Venta
from .serializers import (
    MembershipTypeSerializer, 
    UserMembershipSerializer, 
    UserSerializer, 
    ProductoSerializer, 
    VentaSerializer
)

# --- LÓGICA INTELIGENTE DE ENTORNO ---
ESTOY_EN_LA_NUBE = 'RENDER' in os.environ

if ESTOY_EN_LA_NUBE:
    BaseViewSet = viewsets.ReadOnlyModelViewSet
else:
    BaseViewSet = viewsets.ModelViewSet

# ---------------------------------------------------
# VIEWSETS
# ---------------------------------------------------

class MembershipTypeViewSet(BaseViewSet):
    queryset = MembershipType.objects.all()
    serializer_class = MembershipTypeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

# --- AQUÍ ESTÁ LA LÓGICA DE RENOVACIÓN CORREGIDA ---
class UserMembershipViewSet(BaseViewSet):
    queryset = UserMembership.objects.all().order_by('-start_date')
    serializer_class = UserMembershipSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def create(self, request, *args, **kwargs):
        if ESTOY_EN_LA_NUBE:
             return Response({'error': 'Modo Lectura'}, status=status.HTTP_403_FORBIDDEN)

        user_id = request.data.get('user')
        membership_type_id = request.data.get('membership_type')
        
        # 1. Buscamos si ya existe UN registro de este tipo para este usuario
        existing = UserMembership.objects.filter(
            user_id=user_id,
            membership_type_id=membership_type_id
        ).first() # Tomamos el primero que encuentre

        today = timezone.now().date()
        
        # Obtenemos la duración del tipo de membresía
        # (Necesitamos buscar el objeto MembershipType para saber sus días)
        membership_type = MembershipType.objects.get(id=membership_type_id)
        duration = membership_type.duration_days
        
        if duration == 0: duration = 1 # Ajuste para DayPass

        if existing:
            # --- CASO A: YA EXISTE (ACTIVA O VENCIDA) -> ACTUALIZAMOS ---
            
            if existing.end_date >= today:
                # ESTÁ ACTIVA: Extendemos la fecha final
                existing.end_date = existing.end_date + timedelta(days=duration)
                mensaje = f'¡Renovación Exitosa! Se extendió hasta: {existing.end_date}'
            else:
                # ESTÁ VENCIDA: Reiniciamos las fechas desde HOY
                existing.start_date = today
                existing.end_date = today + timedelta(days=duration)
                mensaje = f'¡Reactivación Exitosa! Nueva vigencia hasta: {existing.end_date}'
            
            existing.save()
            
            serializer = self.get_serializer(existing)
            return Response({
                'message': mensaje,
                **serializer.data
            }, status=status.HTTP_200_OK)

        else:
            # --- CASO B: NUNCA HA TENIDO ESTA MEMBRESÍA -> CREAMOS ---
            # (Esto solo pasaría si en el registro no se le asignó esta específica)
            return super().create(request, *args, **kwargs)

class UserViewSet(BaseViewSet):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class ProductoViewSet(BaseViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class VentaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Venta.objects.all().order_by('-fecha')
    serializer_class = VentaSerializer
    permission_classes = [IsAuthenticated]

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_venta(request):
    if ESTOY_EN_LA_NUBE:
        return Response({'error': 'Modo Demo'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    try:
        with transaction.atomic():
            nueva_venta = Venta.objects.create(
                cliente_id=data.get('cliente_id'),
                total=data['total'],
                metodo_pago=data['metodo_pago'],
                detalle_productos=str(data['productos'])
            )

            for item in data['productos']:
                prod_db = Producto.objects.get(id=item['id'])
                if prod_db.stock < item['cantidad']:
                    raise Exception(f"Stock insuficiente: {prod_db.nombre}")
                prod_db.stock -= item['cantidad']
                prod_db.save()

            return Response({'status': 'success', 'venta_id': nueva_venta.id}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

# --- Vista especial para Registro + Membresía ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_user_with_membership(request):
    if ESTOY_EN_LA_NUBE:
         return Response({'error': 'Modo Demo'}, status=status.HTTP_403_FORBIDDEN)
         
    data = request.data
    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name']
            )
            membership = MembershipType.objects.get(id=data['membership_id'])
            UserMembership.objects.create(user=user, membership_type=membership)
            Venta.objects.create(
                cliente=user,
                total=membership.price,
                metodo_pago=data['payment_method'],
                detalle_productos=f"[{{'nombre': '{membership.name}', 'precio': {membership.price}, 'cantidad': 1}}]"
            )
            return Response({'status': 'Creado'}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=400)