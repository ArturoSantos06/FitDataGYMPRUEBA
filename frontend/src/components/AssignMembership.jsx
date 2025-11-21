import React, { useState, useEffect } from 'react';

function AssignMembership({ onSuccess }) {
  const [users, setUsers] = useState([]);
  const [membershipTypes, setMembershipTypes] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedMembership, setSelectedMembership] = useState(null);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchData = async (endpoint, setter) => {
      try {
        const response = await fetch(`${API_URL}/api/${endpoint}/`, {
          headers: { 'Authorization': `Token ${token}` },
        });
        if (!response.ok) throw new Error(`Error al cargar ${endpoint}`);
        const data = await response.json();
        setter(data.results || data);
      } catch (err) { console.error(err); }
    };
    fetchData('users', setUsers); 
    fetchData('memberships', setMembershipTypes);
  }, []);

  const getImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http')) return imgPath;
    return `${API_URL}${imgPath}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');

    if (!selectedUser || !selectedMembership) {
      setError('Selecciona un cliente y la membresía.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/user-memberships/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify({ user: selectedUser, membership_type: selectedMembership }),
      });

      if (!response.ok) { const errData = await response.json(); throw new Error(errData.detail || 'Error al asignar.'); }
      const result = await response.json();
      
      setMessage(result.message || "Operación exitosa");
      setSelectedUser('');
      setSelectedMembership(null);
      
      if (onSuccess) onSuccess(); 

    } catch (err) { setError(err.message); }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl mb-6 border-t-4 border-blue-500 text-gray-100">
      {/* Regresamos al color Azul/Teal */}
      <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-teal-400">
        Asignar o Renovar Membresía
      </h2>

      {error && <p className="mb-4 text-red-200 bg-red-900/50 p-3 rounded border border-red-500/50">{error}</p>}
      {message && <p className="mb-4 text-cyan-200 bg-cyan-900/50 p-3 rounded border border-cyan-500/50 font-bold">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div>
          <label htmlFor="user" className="block text-sm font-bold text-gray-300 mb-2">1. Selecciona el Cliente</label>
          <select
            id="user"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">-- Buscar Cliente --</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username} {user.first_name ? `(${user.first_name} ${user.last_name})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-300 mb-4">2. Elige la Membresía</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {membershipTypes.map(type => (
              <div 
                key={type.id}
                onClick={() => setSelectedMembership(type.id)}
                className={`
                  group w-full aspect-video relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 bg-black border-2
                  ${selectedMembership === type.id 
                    ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)] scale-[1.02]' 
                    : 'border-gray-700 hover:border-gray-500 hover:scale-[1.01]'}
                `}
              >
                {type.image ? (
                  <img 
                    src={getImageUrl(type.image)} 
                    alt={type.name} 
                    className={`w-full h-full object-contain transition-all duration-500 ${selectedMembership !== type.id && 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}
                  />
                ) : (
                   <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">Sin Imagen</div>
                )}
                
                {selectedMembership === type.id && (
                  <div className="absolute top-3 right-3 bg-cyan-500 text-black rounded-full p-1.5 shadow-lg z-10 animate-bounce-short">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-linear-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all transform active:scale-95 text-lg uppercase tracking-widest"
        >
          CONFIRMAR ASIGNACIÓN / RENOVACIÓN
        </button>
      </form>
    </div>
  );
}

export default AssignMembership;