import React, { useState, useEffect } from 'react';

function UserMembershipList({ refreshTrigger }) {
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const fetchAssignments = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/user-memberships/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al cargar asignaciones');
      const data = await response.json();
      setAssignments(data.results || data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [refreshTrigger]); 

  // Lógica de Filtrado
  const filteredAssignments = assignments.filter(item => {
    const search = searchTerm.toLowerCase();
    const estado = item.is_active ? 'activo' : 'vencido';
    const nombreCompleto = item.user_full_name ? item.user_full_name.toLowerCase() : '';
    
    return (
        item.user_name.toLowerCase().includes(search) ||
        nombreCompleto.includes(search) ||
        item.membership_name.toLowerCase().includes(search) ||
        estado.includes(search)
    );
  });

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl mt-6 border-t-4 border-teal-500 text-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-green-400">
          Estado de Membresías
        </h2>
        
        {/* BUSCADOR */}
        <div className="relative w-full md:w-1/3">
            <input 
                type="text" 
                placeholder="Buscar por usuario, nombre, tipo o estado..." 
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-teal-500 transition-colors placeholder-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
        </div>

        <button 
          onClick={fetchAssignments}
          className="text-sm text-teal-400 hover:text-teal-300 font-semibold transition-colors whitespace-nowrap"
        >
          🔄 Actualizar
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-700 text-left text-gray-300 uppercase text-sm leading-normal">
              <th className="py-3 px-6 border-b border-gray-600">Usuario</th>
              <th className="py-3 px-6 border-b border-gray-600">Membresía</th>
              <th className="py-3 px-6 border-b border-gray-600">Inicio</th>
              <th className="py-3 px-6 border-b border-gray-600">Vencimiento</th>
              <th className="py-3 px-6 text-center border-b border-gray-600">Estado</th>
            </tr>
          </thead>
          <tbody className="text-gray-200 text-sm font-light">
            {filteredAssignments.map((item) => (
              <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                <td className="py-3 px-6 text-left">
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm">{item.user_name}</span>
                    {item.user_full_name && (
                      <span className="text-xs text-gray-400 uppercase tracking-wide">
                        {item.user_full_name}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-6">
                  {item.membership_name}
                </td>
                <td className="py-3 px-6">
                  {item.start_date}
                </td>
                <td className="py-3 px-6 font-mono text-slate-300">
                  {item.end_date}
                </td>
                <td className="py-3 px-6 text-center">
                  <span
                    className={`py-1 px-3 rounded-full text-xs font-bold ${
                      item.is_active
                        ? 'bg-green-700 text-green-100 border border-green-500'
                        : 'bg-red-700 text-red-100 border border-red-500'
                    }`}
                  >
                    {item.is_active ? 'ACTIVO' : 'VENCIDO'}
                  </span>
                </td>
              </tr>
            ))}
            
            {filteredAssignments.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500 italic">
                  {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay membresías asignadas aún.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserMembershipList;