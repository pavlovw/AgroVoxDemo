"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, AlertTriangle, Sprout, ChevronRight, Plus, X, Trash2 } from 'lucide-react';

const URL_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const MapaDinamico = dynamic(() => import('@/components/clientes/Mapa'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400 font-medium border border-gray-200">
      Cargando topografía de red...
    </div>
  )
});

export default function Clientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [clienteActivo, setClienteActivo] = useState<any>(null);

  // Estados Modal Nuevo Cliente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  // Estados Modal Eliminar Cliente
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [eliminando, setEliminando] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    email: '',
    telefono: '',
    latitud: '',
    longitud: ''
  });

  const cargarClientes = () => {
    setCargando(true);
    fetch(`${URL_BACKEND}/api/clientes`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const clientesProcesados = data.map((cli: any) => {
            const cultivos = Array.from(new Set(cli.sectores?.map((s: any) => s.cultivo).filter(Boolean)));
            const cultivoPrincipal = cultivos.length > 0 ? cultivos.join(', ') : 'Sin cultivo';
            const totalNodos = cli.sectores?.reduce((acc: number, sector: any) => acc + (sector.nodos?.length || 0), 0) || 0;
            const enAlerta = cli.sectores?.some((sector: any) => sector.nodos?.some((nodo: any) => nodo.estado === 'ALERTA'));
            
            return {
              ...cli,
              cultivoPrincipal,
              totalNodos,
              estado: enAlerta ? 'alerta' : 'ok'
            };
          });
          setClientes(clientesProcesados);
        }
        setCargando(false);
      })
      .catch(err => {
        console.error('Error cargando clientes:', err);
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const response = await fetch(`${URL_BACKEND}/api/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ nombre: '', rut: '', email: '', telefono: '', latitud: '', longitud: '' });
        cargarClientes();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'No se pudo guardar'}`);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      alert("Error de conexión con el servidor backend");
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (!clienteActivo) return;
    setEliminando(true);

    try {
      const response = await fetch(`${URL_BACKEND}/api/clientes/${clienteActivo.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setClienteActivo(null);
        setIsDeleteModalOpen(false);
        setDeleteConfirmationText("");
        cargarClientes();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'No se pudo eliminar el cliente'}`);
      }
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("Error de conexión con el servidor");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 relative">
      
      {/* Panel Izquierdo: Mapa de Chile */}
      <div className="w-full lg:w-1/2 h-64 lg:h-full bg-white rounded-xl shadow-sm border border-gray-100 p-2">
        {!cargando && <MapaDinamico clientes={clientes} clienteActivo={clienteActivo} />}
      </div>

      {/* Panel Derecho: Lista de Clientes */}
      <div className="w-full lg:w-1/2 h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Directorio de Clientes</h2>
            <p className="text-sm text-gray-500 mt-1">Selecciona un fundo para gestionar.</p>
          </div>
          
          <div className="flex gap-2 items-center">
            {/* Botón de Eliminar en la cabecera (Solo visible si hay un cliente seleccionado) */}
            {clienteActivo && (
              <button 
                onClick={() => {
                  setDeleteConfirmationText("");
                  setIsDeleteModalOpen(true);
                }}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-red-100"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            )}
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-agrogreen-600 hover:bg-agrogreen-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Nuevo Cliente
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cargando ? (
            <div className="text-center text-gray-500 mt-10 animate-pulse">Cargando base de datos...</div>
          ) : clientes.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">No hay clientes registrados en el sistema.</div>
          ) : (
            clientes.map((cliente) => (
              <div 
                key={cliente.id}
                onClick={() => setClienteActivo(cliente)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md flex items-center justify-between group
                  ${clienteActivo?.id === cliente.id 
                    ? 'border-agrogreen-500 bg-agrogreen-50' 
                    : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
              >
                <div className="flex gap-4 items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                    ${cliente.estado === 'alerta' ? 'bg-red-100 text-red-500' : 'bg-agrogreen-100 text-agrogreen-600'}`}>
                    {cliente.estado === 'alerta' ? <AlertTriangle className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{cliente.nombre}</h3>
                    <div className="flex items-center gap-3 text-xs font-medium mt-1">
                      <span className="text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {cliente.email || 'Sin correo'}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500 flex items-center gap-1">
                        <Sprout className="w-3 h-3" /> {cliente.cultivoPrincipal} ({cliente.totalNodos} nodos)
                      </span>
                    </div>
                  </div>
                </div>

                <Link 
                  href={`/clientes/${cliente.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0
                      ${clienteActivo?.id === cliente.id ? 'bg-agrogreen-500 text-white' : 'bg-white text-gray-400 group-hover:text-agrogreen-500'}`}
                  >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL DE NUEVO CLIENTE */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Agregar Nuevo Cliente</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Agrícola / Fundo *</label>
                <input 
                  type="text" 
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agrogreen-500 focus:border-transparent"
                  placeholder="Ej: Viña del Mar SpA"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RUT (Opcional)</label>
                  <input 
                    type="text" 
                    name="rut"
                    value={formData.rut}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agrogreen-500 focus:border-transparent"
                    placeholder="Ej: 76.123.456-7"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input 
                    type="text" 
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agrogreen-500 focus:border-transparent"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo de Contacto</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agrogreen-500 focus:border-transparent"
                  placeholder="contacto@agricola.cl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitud (Ej: -34.2)</label>
                  <input 
                    type="number"
                    step="any"
                    name="latitud"
                    value={formData.latitud}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agrogreen-500"
                    placeholder="-34.2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitud (Ej: -70.9)</label>
                  <input 
                    type="number"
                    step="any"
                    name="longitud"
                    value={formData.longitud}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agrogreen-500"
                    placeholder="-70.9"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 text-sm font-medium text-white bg-agrogreen-600 hover:bg-agrogreen-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {isDeleteModalOpen && clienteActivo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex items-center gap-3">
              <div className="bg-red-100 text-red-600 p-2 rounded-full">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-red-900">Eliminación Crítica</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Estás a punto de eliminar permanentemente a <span className="font-bold text-gray-900">{clienteActivo.nombre}</span>. Esta acción purgará de la base de datos todos sus sectores, gateways, nodos y el historial completo de lecturas. 
                <br /><br />
                Esta acción <span className="font-bold text-red-600">no se puede deshacer</span>.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escribe <span className="font-bold text-black select-none">BORRAR</span> para confirmar:
                </label>
                <input 
                  type="text" 
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-center tracking-widest"
                  placeholder="BORRAR"
                  autoComplete="off"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteConfirmationText("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmarEliminacion}
                  disabled={deleteConfirmationText !== 'BORRAR' || eliminando}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {eliminando ? 'Purgando datos...' : <><Trash2 className="w-4 h-4" /> Eliminar Definitivamente</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
