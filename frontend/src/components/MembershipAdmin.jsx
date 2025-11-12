import React, { useState, useEffect } from 'react';

function MembershipAdmin() {
  const [memberships, setMemberships] = useState([]);
  
  // --- Estados para el formulario ---
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  
  // --- Nuevo estado para saber si estamos editando ---
  const [editingId, setEditingId] = useState(null); // null = creando, (un id) = editando

  // Carga las membresías existentes al iniciar
  useEffect(() => {
    fetchMemberships();
  }, []);

  // --- FUNCIÓN 1: Cargar membresías (GET) ---
  const fetchMemberships = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/memberships/');
      if (!response.ok) throw new Error('Error al cargar datos');
      const data = await response.json();
      setMemberships(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // --- FUNCIÓN 2: Manejar envío de formulario (POST o PUT) ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene que la página se recargue

    const membershipData = {
      name: name,
      price: price,
      duration_days: parseInt(duration),
    };

    // Decide si crear (POST) o actualizar (PUT)
    const isEditing = editingId !== null;
    const url = isEditing
      ? `http://localhost:8000/api/memberships/${editingId}/` // URL de actualización
      : 'http://localhost:8000/api/memberships/';           // URL de creación
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          // Nota: Si DRF te da problemas de CSRF, descomenta la siguiente línea
          // 'X-CSRFToken': getCookie('csrftoken'), // Necesitarías una función getCookie
        },
        body: JSON.stringify(membershipData),
      });

      if (!response.ok) throw new Error('Error al guardar la membresía');

      const savedData = await response.json();

      if (isEditing) {
        // Si editamos, reemplazamos el item viejo en la lista
        setMemberships(
          memberships.map((m) => (m.id === editingId ? savedData : m))
        );
      } else {
        // Si creamos, lo añadimos al final de la lista
        setMemberships([...memberships, savedData]);
      }

      // Limpia el formulario y el estado de edición
      handleCancel();
      
    } catch (error) {
      console.error('Error al enviar:', error);
    }
  };

  // --- NUEVA FUNCIÓN 3: Cargar datos en el formulario para editar ---
  const handleEdit = (membership) => {
    setName(membership.name);
    setPrice(membership.price);
    setDuration(membership.duration_days);
    setEditingId(membership.id); // ¡Importante! Marca que estamos editando
  };

  // --- NUEVA FUNCIÓN 4: Borrar una membresía (DELETE) ---
  const handleDelete = async (id) => {
    // Pedir confirmación
    if (!window.confirm('¿Estás seguro de que quieres borrar esta membresía?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/memberships/${id}/`, {
        method: 'DELETE',
        headers: {
          // 'X-CSRFToken': getCookie('csrftoken'), // (Si es necesario)
        },
      });

      if (!response.ok) throw new Error('Error al borrar');

      // Si se borra con éxito (status 204), filtramos la lista
      setMemberships(memberships.filter((m) => m.id !== id));

    } catch (error) {
      console.error('Error al borrar:', error);
    }
  };

  // --- NUEVA FUNCIÓN 5: Limpiar el formulario ---
  const handleCancel = () => {
    setName('');
    setPrice('');
    setDuration('');
    setEditingId(null);
  };

  const isEditing = editingId !== null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Gestión de Membresías</h1>

      {/* --- SECCIÓN 1: Formulario (Ahora es para Crear y Editar) --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-3">
          {isEditing ? `Editando: ${name}` : 'Nueva Membresía'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio</label>
              <input type="number" step="0.01" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duración (días)</label>
              <input type="number" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
          </div>
          
          {/* --- Botones de Enviar y Cancelar --- */}
          <div className="mt-4 flex space-x-2">
            <button
              type="submit"
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700"
            >
              {isEditing ? 'Actualizar Membresía' : 'Guardar Membresía'}
            </button>
            
            {/* Botón de Cancelar (solo visible si estamos editando) */}
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- SECCIÓN 2: Tabla de membresías --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-3">Membresías Existentes</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="text-left p-2 border">Nombre</th>
              <th className="text-left p-2 border">Precio</th>
              <th className="text-left p-2 border">Duración (días)</th>
              <th className="text-left p-2 border">Acciones</th> 
            </tr>
          </thead>
          <tbody>
            {memberships.map((membership) => (
              <tr key={membership.id} className="hover:bg-gray-100">
                <td className="p-2 border">{membership.name}</td>
                <td className="p-2 border">${membership.price}</td>
                <td className="p-2 border">{membership.duration_days}</td>
                
                {/* --- Nuevos Botones de Acción --- */}
                <td className="p-2 border">
                  <button
                    onClick={() => handleEdit(membership)}
                    className="bg-green-500 text-white text-sm py-1 px-2 rounded-md hover:bg-green-600 mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(membership.id)}
                    className="bg-red-500 text-white text-sm py-1 px-2 rounded-md hover:bg-red-600"
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MembershipAdmin;