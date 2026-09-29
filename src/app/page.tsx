"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { AlertTriangle, BatteryWarning, Signal, Link as LinkIcon, Sprout, Activity, WifiOff, Search } from "lucide-react";

const URL_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const socket = io(URL_BACKEND);

export default function DashboardGlobal() {
  const [metricas, setMetricas] = useState({
    alertasCavitacion: 0,
    gatewaysOffline: 0,
    nodosBateriaCritica: 0,
    huerfanosPendientes: 0
  });

  const [alertasCavitacion, setAlertasCavitacion] = useState<any[]>([]);
  const [equiposCaidos, setEquiposCaidos] = useState({ nodos: [], gateways: [] });
  const [hardwareHuerfano, setHardwareHuerfano] = useState<any[]>([]);

  const cargarResumen = async () => {
    try {
      const res = await fetch(`${URL_BACKEND}/api/dashboard/resumen`);
      if (res.ok) {
        const data = await res.json();
        setMetricas(data.metricas);
        setAlertasCavitacion(data.alertasCavitacion);
        setEquiposCaidos(data.equiposCaidos);
        setHardwareHuerfano(data.hardwareHuerfano);
        
        // AGREGA ESTA LÍNEA PARA CAPTURAR LA LISTA:
        setNodosBateriaBaja(data.nodosBateriaBaja || []);
      }
    } catch (error) {
      console.error("Error cargando el dashboard:", error);
    }
  };

  // 1. NUEVOS ESTADOS
  const [nodosBateriaBaja, setNodosBateriaBaja] = useState<any[]>([]);
  const [filtros, setFiltros] = useState({
    estresHidrico: true,
    gatewaysApagados: true,
    nodosApagados: true,
    bateriaBaja: true
  });

  // 2. ACTUALIZAR CARGA DE DATOS (Dentro de cargarResumen)
  // setNodosBateriaBaja(data.nodosBateriaBaja || []);

  const toggleFiltro = (llave: keyof typeof filtros) => {
    setFiltros(prev => ({ ...prev, [llave]: !prev[llave] }));
  };

  const formatearHora = (fecha: string | Date) => {
    if (!fecha) return 'Hora desconocida';
    return new Intl.DateTimeFormat('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    }).format(new Date(fecha));
  };

  useEffect(() => {
    cargarResumen();

    // Escuchas WebSocket para mantener la reactividad viva
    socket.on('alerta_nodo', () => cargarResumen());
    socket.on('nuevo-nodo-huerfano', () => cargarResumen());
    socket.on('nuevo-gateway-huerfano', () => cargarResumen());
    socket.on('nodo-ping', (nodo) => {
      if (nodo.bateria <= 15 || nodo.estado === 'INACTIVO') cargarResumen();
    });

  

    return () => {
      socket.off('alerta_nodo');
      socket.off('nuevo-nodo-huerfano');
      socket.off('nuevo-gateway-huerfano');
      socket.off('nodo-ping');
    };
  }, []);

  const totalAlertasInmediatas = alertasCavitacion.length + equiposCaidos.nodos.length + equiposCaidos.gateways.length + nodosBateriaBaja.length;

  return (
    <div className="space-y-6">
      {/* 1. KPIs DE MANDO (Se mantienen igual) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-red-500"></div>
          <p className="text-sm font-medium text-gray-500">Estrés Hídrico (Cavitación)</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-3xl font-bold text-red-600">{metricas.alertasCavitacion}</p>
            <Sprout className="w-6 h-6 text-red-400" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-amber-500"></div>
          <p className="text-sm font-medium text-gray-500">Mantenimiento (Batería ≤15%)</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-3xl font-bold text-amber-500">{metricas.nodosBateriaCritica}</p>
            <BatteryWarning className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-blue-500"></div>
          <p className="text-sm font-medium text-gray-500">Gateways Offline</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-3xl font-bold text-gray-800">{metricas.gatewaysOffline}</p>
            <Signal className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500"></div>
          <p className="text-sm font-medium text-gray-500">Hardware sin Asignar</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-3xl font-bold text-indigo-600">{metricas.huerfanosPendientes}</p>
            <LinkIcon className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
{/* ACCIÓN REQUERIDA INMEDIATA (Triage) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
          <div className="px-6 py-4 border-b border-gray-100 bg-red-50/30">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" /> Acción Requerida Inmediata
              </h2>
            </div>
            
            {/* CHECKBOXES DE FILTRADO */}
            <div className="flex flex-wrap gap-4 text-xs font-medium">
              <label className="flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-900">
                <input type="checkbox" checked={filtros.estresHidrico} onChange={() => toggleFiltro('estresHidrico')} className="accent-red-500 w-4 h-4 rounded border-gray-300" />
                Estrés Hídrico Nodos
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-900">
                <input type="checkbox" checked={filtros.gatewaysApagados} onChange={() => toggleFiltro('gatewaysApagados')} className="accent-gray-800 w-4 h-4 rounded border-gray-300" />
                Apagados Gateway
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-900">
                <input type="checkbox" checked={filtros.nodosApagados} onChange={() => toggleFiltro('nodosApagados')} className="accent-gray-500 w-4 h-4 rounded border-gray-300" />
                Apagados Nodos
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-gray-900">
                <input type="checkbox" checked={filtros.bateriaBaja} onChange={() => toggleFiltro('bateriaBaja')} className="accent-amber-500 w-4 h-4 rounded border-gray-300" />
                Ver Batería Baja Nodos
              </label>
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            {totalAlertasInmediatas === 0 && nodosBateriaBaja.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Red operando con normalidad. Cero eventos críticos.
              </div>
            ) : (
              <>
                {/* Fallos de Backbone (Gateways Caídos) */}
                {filtros.gatewaysApagados && equiposCaidos.gateways.map((gw: any, i) => (
                  <div key={`gw-${i}`} className="flex justify-between items-center p-4 bg-gray-900 border border-gray-800 rounded-lg shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-800 rounded-full"><WifiOff className="w-5 h-5 text-gray-400" /></div>
                      <div>
                        <h3 className="font-bold text-white text-sm">Gateway Desconectado: {gw.id}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {gw.cliente?.nombre || 'Cliente Desconocido'}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1.5 font-mono">
                          Detectado: {formatearHora(gw.updatedAt || gw.fecha)}
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 text-xs font-bold rounded-md transition-colors flex items-center gap-2">
                      <Search className="w-3 h-3"/> Ver detalle
                    </button>
                  </div>
                ))}

                {/* Estrés Hídrico (Cavitación) */}
                {filtros.estresHidrico && alertasCavitacion.map((alerta: any, i) => (
                  <div key={`cav-${i}`} className="flex justify-between items-center p-4 bg-white border border-red-100 rounded-lg shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-50 rounded-full"><Sprout className="w-5 h-5 text-red-500" /></div>
                      <div>
                        <h3 className="font-bold text-red-700 text-sm">Cavitación en {alerta.id || alerta.nodoId}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {alerta.sector?.cliente?.nombre || 'Sin Cliente'} • {alerta.sector?.nombre || 'Sector Desconocido'}
                        </p>
                        <p className="text-[10px] text-red-400 mt-1.5 font-mono">
                          Detectado: {formatearHora(alerta.updatedAt || alerta.fecha)}
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-md transition-colors flex items-center gap-2">
                      Ver en Mapa
                    </button>
                  </div>
                ))}

                {/* Nodos con Batería Baja (NUEVO) */}
                {filtros.bateriaBaja && nodosBateriaBaja.map((nodo: any, i) => (
                  <div key={`bat-${i}`} className="flex justify-between items-center p-4 bg-amber-50/30 border border-amber-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-amber-100 rounded-full"><BatteryWarning className="w-5 h-5 text-amber-600" /></div>
                      <div>
                        <h3 className="font-bold text-amber-800 text-sm">Batería Crítica ({nodo.bateria}%): {nodo.id}</h3>
                        <p className="text-xs text-amber-700/70 mt-1">
                          {nodo.sector?.cliente?.nombre || 'Sin Cliente'} • {nodo.sector?.nombre || 'Sector Desconocido'}
                        </p>
                        <p className="text-[10px] text-amber-600 mt-1.5 font-mono">
                          Actualizado: {formatearHora(nodo.updatedAt || nodo.fecha)}
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white border border-amber-300 hover:bg-amber-50 text-amber-700 text-xs font-bold rounded-md transition-colors flex items-center gap-2">
                      <Search className="w-3 h-3"/> Mantenimiento
                    </button>
                  </div>
                ))}

                {/* Nodos Caídos (Asignados pero offline) */}
                {filtros.nodosApagados && equiposCaidos.nodos.map((nodo: any, i) => (
                  <div key={`nodo-${i}`} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-200 rounded-full"><AlertTriangle className="w-5 h-5 text-gray-600" /></div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">Nodo Apagado: {nodo.id}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {nodo.sector?.cliente?.nombre || 'Sin Cliente'} • {nodo.sector?.nombre || 'Sector Desconocido'}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1.5 font-mono">
                          Última conexión: {formatearHora(nodo.updatedAt || nodo.fecha)}
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-md transition-colors flex items-center gap-2">
                      <Search className="w-3 h-3"/> Ver detalle
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* 3. BANDEJA DE HARDWARE ZERO-TOUCH */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
          <div className="px-6 py-4 border-b border-gray-100 bg-indigo-50/30">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-indigo-500" /> Instalaciones Pendientes
            </h2>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {hardwareHuerfano.map((equipo, i) => (
              <div key={i} className="p-3 border border-indigo-100 bg-indigo-50/20 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-800">{equipo.id}</p>
                  <p className="text-xs text-indigo-500 mt-0.5">
                    {equipo.latitud ? '📡 Coordenadas capturadas' : '⏳ Esperando ubicación'}
                  </p>
                </div>
                <button className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors">
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}