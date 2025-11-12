
from django.db import models

# Create your models here.

class MembershipType(models.Model):
    name = models.CharField(max_length=150, unique=True, verbose_name="Nombre")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    duration_days = models.IntegerField(verbose_name="Duración (en días)")

    def __str__(self):
        return f"{self.name} (${self.price})"