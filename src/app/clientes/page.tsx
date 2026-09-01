"use client";

import Link from 'next/link';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, AlertTriangle, Sprout, ChevronRight } from 'lucide-react';

// Importación dinámica fundamental para Leaflet en Next.js
const MapaDinamico = dynamic(() => import('@/components/clientes/Mapa'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400 font-medium border border-gray-200">
      Cargando topografía de red...
    </div>
  )
});

// Base de datos de prueba
const mockClientes = [
  {
    id: 'CLI-001',
    nombre: 'Agrícola San Pedro',
    ubicacion: 'Buin, Región Metropolitana',
    cultivo: 'Palto',
    nodos: 45,
    estado: 'ok',
    coords: [-33.732, -70.742] as [number, number],
  },
  {
    id: 'CLI-002',
    nombre: 'Viña Los Tilos',
    ubicacion: 'Curicó, Región del Maule',
    cultivo: 'Cerezo',
    nodos: 12,
    estado: 'alerta',
    coords: [-34.985, -71.239] as [number, number],
  },
  {
    id: 'CLI-003',
    nombre: 'Fundo El Encanto',
    ubicacion: 'Rancagua, Región de O\'Higgins',
    cultivo: 'Cerezo',
    nodos: 85,
    estado: 'ok',
    coords: [-34.170, -70.740] as [number, number],
  }
];

export default function Clientes() {
  const [clienteActivo, setClienteActivo] = useState<any>(null);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      
      {/* Panel Izquierdo: Mapa de Chile (50% en escritorio, altura fija en móvil) */}
      <div className="w-full lg:w-1/2 h-64 lg:h-full bg-white rounded-xl shadow-sm border border-gray-100 p-2">
        <MapaDinamico clientes={mockClientes} clienteActivo={clienteActivo} />
      </div>

      {/* Panel Derecho: Lista de Clientes */}
      <div className="w-full lg:w-1/2 h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Directorio de Clientes</h2>
          <p className="text-sm text-gray-500 mt-1">Selecciona un fundo para localizarlo en el mapa.</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {mockClientes.map((cliente) => (
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
                    <span className="text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {cliente.ubicacion}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 flex items-center gap-1"><Sprout className="w-3 h-3" /> {cliente.cultivo} ({cliente.nodos} nodos)</span>
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
          ))}
        </div>
      </div>

    </div>
  );
}