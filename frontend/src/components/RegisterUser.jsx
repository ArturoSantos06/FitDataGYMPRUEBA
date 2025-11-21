import React, { useState, useEffect } from 'react';

function RegisterUser({ onUserRegistered }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    membership_id: '', // ID de la membresía a comprar
    payment_method: 'EFECTIVO' // Método de pago
  });
  
  const [memberships, setMemberships] = useState([]); 
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  // Cargar membresías al iniciar
  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await fetch(`${API_URL}/api/memberships/`);
        if (response.ok) {
          const data = await response.json();
          setMemberships(data.results || data);
        }
      } catch (err) {
        console.error("Error cargando membresías", err);
      }
    };
    fetchMemberships();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const token = localStorage.getItem('token');

    // Validar que haya seleccionado membresía
    if (!formData.membership_id) {
      setError("Por favor selecciona una membresía para el cliente.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/register-with-membership/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        const errorMsg = errData.error || errData.detail || 'Error al registrar.';
        throw new Error(errorMsg);
      }

      await response.json();
      setMessage('¡Cliente registrado y membresía asignada con éxito!');
      
      setFormData({
        username: '', email: '', password: '', first_name: '', last_name: '', membership_id: '', payment_method: 'EFECTIVO'
      });

      if (onUserRegistered) onUserRegistered();

    } catch (err) {
      setError(err.message);
    }
  };

  // Precio de la membresía seleccionada para mostrarlo
  const selectedMembershipPrice = memberships.find(m => m.id.toString() === formData.membership_id)?.price || 0;

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl mb-6 border-t-4 border-purple-500 text-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-400">
        Registrar Nuevo Cliente + Membresía
      </h2>
      
      {message && <p className="mb-3 text-green-400 bg-green-900 p-3 rounded-lg border border-green-700">{message}</p>}
      {error && <p className="mb-3 text-red-400 bg-red-900 p-3 rounded-lg border border-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* DATOS PERSONALES */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nombre de Usuario</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-blue-500" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Correo Electrónico</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-blue-500" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nombre(s)</label>
          <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-blue-500" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Apellidos</label>
          <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-blue-500" required />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña Temporal</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-blue-500" required />
        </div>

        {/* SECCIÓN DE PAGO Y MEMBRESÍA */}
        <div className="md:col-span-2 border-t border-gray-700 pt-4 mt-2">
            <h3 className="text-lg font-bold text-cyan-400 mb-4">Datos de la Membresía Inicial</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Seleccionar Membresía</label>
                    <select 
                        name="membership_id" 
                        value={formData.membership_id} 
                        onChange={handleChange} 
                        className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-cyan-500"
                        required
                    >
                        <option value="">-- Elige una opción --</option>
                        {memberships.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.name} - ${m.price} ({m.duration_days} días)
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Método de Pago</label>
                    <select 
                        name="payment_method" 
                        value={formData.payment_method} 
                        onChange={handleChange} 
                        className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-cyan-500"
                    >
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="TARJETA">Tarjeta</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                    </select>
                </div>
            </div>

            {formData.membership_id && (
                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-600 flex justify-between items-center">
                    <span className="text-gray-300 font-bold">Total a Cobrar:</span>
                    <span className="text-2xl font-extrabold text-green-400">${selectedMembershipPrice}</span>
                </div>
            )}
        </div>

        <div className="md:col-span-2 mt-2">
          <button
            type="submit"
            className="w-full bg-linear-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition duration-300 shadow-lg uppercase tracking-widest"
          >
            Registrar y Cobrar
          </button>
        </div>

      </form>
    </div>
  );
}

export default RegisterUser;