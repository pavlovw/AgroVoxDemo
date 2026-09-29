"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { io } from "socket.io-client";
import { 
  Activity, Battery, Signal, AlertTriangle, 
  WifiOff, Search, Filter, ChevronRight, Link as LinkIcon, Cpu, CheckCircle2
} from "lucide-react";

const URL_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const socket = io(URL_BACKEND);

type FiltroNodos = 'TODOS' | 'ALERTA' | 'BATERIA_BAJA' | 'INACTIVOS' | 'HUERFANOS';

export default function RedIoT() {
  const [nodos, setNodos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState<FiltroNodos>('TODOS');
  const [busqueda, setBusqueda] = useState("");
  const [nodoSeleccionado, setNodoSeleccionado] = useState<string | null>(null);

  const cargarTelemetria = async () => {
    try {
      // 1. Obtenemos los nodos asignados a través de los clientes
      const resClientes = await fetch(`${URL_BACKEND}/api/clientes`);
      const clientes = await resClientes.json();
      
      const nodosAsignados: any[] = [];
      clientes.forEach((cliente: any) => {
        cliente.sectores?.forEach((sector: any) => {
          sector.nodos?.forEach((nodo: any) => {
            nodosAsignados.push({
              ...nodo,
              clienteNombre: cliente.nombre,
              sectorNombre: sector.nombre,
              cultivo: sector.cultivo
            });
          });
        });
      });

      // 2. Obtenemos los nodos huérfanos desde el resumen del dashboard
      const resResumen = await fetch(`${URL_BACKEND}/api/dashboard/resumen`);
      const resumen = await resResumen.json();
      
      const nodosHuerfanos = (resumen.hardwareHuerfano || [])
        .filter((h: any) => h.id.includes('AGV') || h.bateria !== undefined)
        .map((nodo: any) => ({
          ...nodo,
          clienteNombre: 'Sin Asignar',
          sectorNombre: 'Hardware Huérfano',
          cultivo: 'N/A'
        }));

      // 3. Consolidamos el inventario total
      setNodos([...nodosAsignados, ...nodosHuerfanos]);
      setCargando(false);
    } catch (error) {
      console.error('Error cargando inventario de red:', error);
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTelemetria();

    socket.on('alerta_nodo', () => cargarTelemetria());
    socket.on('nuevo-nodo-huerfano', () => cargarTelemetria());
    socket.on('nodo-ping', (nodoActualizado) => {
      setNodos(prev => prev.map(n => 
        n.id === nodoActualizado.id 
          ? { ...n, bateria: nodoActualizado.bateria, estado: nodoActualizado.estado } 
          : n
      ));
    });

    return () => {
      socket.off('alerta_nodo');
      socket.off('nuevo-nodo-huerfano');
      socket.off('nodo-ping');
    };
  }, []);

  const nodosFiltrados = nodos.filter(nodo => {
    const coincideBusqueda = nodo.id.toLowerCase().includes(busqueda.toLowerCase()) || 
                             (nodo.clienteNombre || '').toLowerCase().includes(busqueda.toLowerCase());
    
    if (!coincideBusqueda) return false;

    switch (filtroActivo) {
      case 'ALERTA': return nodo.estado === 'ALERTA';
      case 'BATERIA_BAJA': return nodo.bateria > 0 && nodo.bateria <= 15;
      case 'INACTIVOS': return nodo.estado === 'INACTIVO' || nodo.bateria === 0;
      case 'HUERFANOS': return !nodo.sectorId;
      default: return true;
    }
  });

  // Renderizadores visuales para los iconos de estado
  const getIconoEstado = (nodo: any) => {
    if (nodo.estado === 'ALERTA') return <AlertTriangle className="w-5 h-5" />;
    if (nodo.estado === 'INACTIVO' || nodo.bateria === 0) return <WifiOff className="w-5 h-5" />;
    if (!nodo.sectorId) return <LinkIcon className="w-5 h-5" />;
    return <CheckCircle2 className="w-5 h-5" />;
  };

  const getColorFondoIcono = (nodo: any) => {
    if (nodo.estado === 'ALERTA') return 'bg-red-100 text-red-600';
    if (nodo.estado === 'INACTIVO' || nodo.bateria === 0) return 'bg-gray-200 text-gray-600';
    if (!nodo.sectorId) return 'bg-indigo-100 text-indigo-600';
    return 'bg-green-100 text-green-600';
  };

  const getEtiquetaEstado = (nodo: any) => {
    if (nodo.estado === 'ALERTA') return <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">CAVITACIÓN</span>;
    if (nodo.estado === 'INACTIVO' || nodo.bateria === 0) return <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">OFFLINE</span>;
    if (!nodo.sectorId) return <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">HUÉRFANO</span>;
    return <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">ONLINE</span>;
  };

  return (
    <main className="h-full flex flex-col max-w-6xl mx-auto">
      {/* Cabecera y Controles */}
      <header className="mb-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario de Nodos IoT</h1>
          <p className="text-sm text-gray-500 mt-1">Monitoreo en tiempo real de la capa física de hardware en terreno.</p>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          {/* Botones de Filtro (Pills) */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 mr-1" />
            <button onClick={() => {setFiltroActivo('TODOS'); setNodoSeleccionado(null);}} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filtroActivo === 'TODOS' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Todos ({nodos.length})
            </button>
            <button onClick={() => {setFiltroActivo('ALERTA'); setNodoSeleccionado(null);}} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filtroActivo === 'ALERTA' ? 'bg-red-500 text-white shadow-sm shadow-red-200' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
              Estrés Hídrico ({nodos.filter(n => n.estado === 'ALERTA').length})
            </button>
            <button onClick={() => {setFiltroActivo('BATERIA_BAJA'); setNodoSeleccionado(null);}} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filtroActivo === 'BATERIA_BAJA' ? 'bg-amber-500 text-white shadow-sm shadow-amber-200' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
              Batería Crítica ({nodos.filter(n => n.bateria > 0 && n.bateria <= 15).length})
            </button>
            <button onClick={() => {setFiltroActivo('INACTIVOS'); setNodoSeleccionado(null);}} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filtroActivo === 'INACTIVOS' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              Apagados ({nodos.filter(n => n.estado === 'INACTIVO' || n.bateria === 0).length})
            </button>
            <button onClick={() => {setFiltroActivo('HUERFANOS'); setNodoSeleccionado(null);}} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filtroActivo === 'HUERFANOS' ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
              Sin Asignar ({nodos.filter(n => !n.sectorId).length})
            </button>
          </div>

          {/* Buscador */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar AGV-001 o Cliente..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-agrogreen-500 focus:ring-2 focus:ring-agrogreen-200 outline-none transition-all" 
            />
          </div>
        </div>
      </header>

      {/* Lista de Nodos (Una sola columna) */}
      <div className="flex-1 overflow-y-auto pb-8 space-y-3 pr-2">
        {cargando ? (
          <div className="w-full h-40 flex items-center justify-center text-gray-400 font-medium animate-pulse">Cargando inventario físico...</div>
        ) : nodosFiltrados.length === 0 ? (
          // Rectángulo de Estado Vacío
          <div className="w-full h-48 bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-500 shadow-sm">
            <Cpu className="w-8 h-8 mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700">No hay nodos en este filtro</p>
            <p className="text-xs mt-1">Los dispositivos aparecerán aquí cuando coincidan con tu búsqueda.</p>
          </div>
        ) : (
          nodosFiltrados.map((nodo) => (
            <div 
              key={nodo.id} 
              onClick={() => setNodoSeleccionado(nodoSeleccionado === nodo.id ? null : nodo.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between group
                ${nodoSeleccionado === nodo.id 
                  ? 'border-agrogreen-500 bg-agrogreen-50/50 shadow-md' 
                  : 'border-transparent bg-white shadow-sm hover:shadow-md hover:border-gray-200'
                }`}
            >
              
              {/* Información Principal */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getColorFondoIcono(nodo)}`}>
                  {getIconoEstado(nodo)}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base">{nodo.id}</h3>
                    {getEtiquetaEstado(nodo)}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {nodo.sectorId ? `${nodo.clienteNombre} • ${nodo.sectorNombre}` : 'Esperando asignación desde el mapa'}
                  </p>
                </div>
              </div>

              {/* Métricas y Botón de Acción */}
              <div className="flex items-center justify-between sm:justify-end gap-6 mt-4 sm:mt-0 pl-16 sm:pl-0">
                
                {/* Telemetría Rápida */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Battery className={`w-4 h-4 ${nodo.bateria <= 15 ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className={`font-semibold ${nodo.bateria <= 15 ? 'text-red-600' : 'text-gray-700'}`}>{nodo.bateria}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Signal className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-700">-65 dBm</span>
                  </div>
                </div>

                {/* Botón de Navegación (Solo visible si está seleccionado) */}
                <div className="w-10 flex justify-end">
                  {nodoSeleccionado === nodo.id && (
                    <Link 
                      href={`/red/${nodo.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 bg-agrogreen-600 text-white shadow-md hover:bg-agrogreen-700 animate-in zoom-in-95"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  )}
                </div>
                
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}