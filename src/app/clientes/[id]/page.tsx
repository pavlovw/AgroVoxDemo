"use client";

import React, { useState, use } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  ArrowLeft, Activity, List, Settings, Droplets, 
  AlertTriangle, Signal, CheckCircle2, Phone, Calendar, Wrench, Upload
} from "lucide-react";

// Importación dinámica obligatoria para react-leaflet en Next.js (evita errores de 'window is not defined')
const MapaTopografico = dynamic(
  () => import("@/components/clientes/MapaTopografico"),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
        <span className="text-gray-400 font-medium animate-pulse">Cargando mapa satelital...</span>
      </div>
    )
  }
);

interface ClientePageProps {
  params: Promise<{ id: string }>;
}

export default function ClienteDetalle({ params }: ClientePageProps) {
  const { id: clienteId } = use(params);
  
  const [activeTab, setActiveTab] = useState<'resumen' | 'inventario' | 'administrativo'>('resumen');

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-2rem)]">
      
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Viña Los Tilos</h1>
            <p className="text-sm text-gray-500">ID Cliente: CLI-{clienteId} • Valle de Colchagua</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Gateway Online
          </span>
        </div>
      </div>

      {/* Contenedor Principal: Mapa y Panel Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[600px]">
        
        {/* Mapa Satelital (Izquierda) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
          <MapaTopografico />
        </div>

        {/* Panel de Radiografía (Derecha) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          
          {/* Navegación de Pestañas */}
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('resumen')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 flex justify-center items-center gap-2 transition-colors ${
                activeTab === 'resumen' ? 'border-agrogreen-500 text-agrogreen-700 bg-agrogreen-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Activity className="w-4 h-4" /> Resumen
            </button>
            <button 
              onClick={() => setActiveTab('inventario')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 flex justify-center items-center gap-2 transition-colors ${
                activeTab === 'inventario' ? 'border-agrogreen-500 text-agrogreen-700 bg-agrogreen-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4" /> Nodos
            </button>
            <button 
              onClick={() => setActiveTab('administrativo')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 flex justify-center items-center gap-2 transition-colors ${
                activeTab === 'administrativo' ? 'border-agrogreen-500 text-agrogreen-700 bg-agrogreen-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4 h-4" /> Admin
            </button>
          </div>

          {/* Contenido de las Pestañas */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
            
            {/* TAB: RESUMEN DE SALUD */}
            {activeTab === 'resumen' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Señal Gateway</p>
                    <div className="flex items-end gap-2">
                      <p className="text-2xl font-bold text-gray-800">-68</p>
                      <span className="text-sm text-gray-500 font-medium mb-1">dBm</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Salud Red LoRa</p>
                    <p className="text-2xl font-bold text-green-600">100%</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-800">Alerta de Cavitación Activa</h4>
                      <p className="text-xs text-amber-700 mt-1">El nodo <strong>AGV-011</strong> (Sector 1) detectó eventos de estrés acústico hace 14 minutos.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Control Integrado (Próximamente)</h3>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <p className="text-xs text-gray-500">La integración bidireccional con electroválvulas para respuesta automática está en desarrollo.</p>
                    <button disabled className="w-full py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed">
                      <Droplets className="w-4 h-4" /> Sugerir Riego en Sector 1
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INVENTARIO */}
            {activeTab === 'inventario' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-800">Equipos Instalados (2)</h3>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-agrogreen-200 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">AGV-010</h4>
                      <p className="text-xs text-gray-500">Sector 1 • Borde Norte</p>
                    </div>
                    <span className="bg-green-100 text-green-700 p-1 rounded">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1 text-gray-600"><Signal className="w-3 h-3 text-gray-400"/> -70 dBm</span>
                    <span className="text-green-600">Batería: 98%</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm relative overflow-hidden cursor-pointer">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">AGV-011</h4>
                      <p className="text-xs text-gray-500">Sector 1 • Centro Cuartel</p>
                    </div>
                    <span className="bg-red-100 text-red-700 p-1 rounded animate-pulse">
                      <Activity className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1 text-gray-600"><Signal className="w-3 h-3 text-gray-400"/> -75 dBm</span>
                    <span className="text-gray-600">Batería: 95%</span>
                  </div>
                  <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded">Cavitación detectada</div>
                </div>
              </div>
            )}

            {/* TAB: ADMINISTRATIVO */}
            {activeTab === 'administrativo' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Contacto Operativo</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex gap-3 items-start">
                      <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Bot WhatsApp (Alertas)</p>
                        <p className="text-sm text-gray-500">+56 9 8765 4321</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center mt-0.5"><span className="text-[10px] font-bold text-gray-500">A</span></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Administrador de Fundo</p>
                        <p className="text-sm text-gray-500">Carlos Martínez</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Sectores Geográficos</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-3">Actualiza los polígonos de riego cargando el archivo geoespacial proporcionado por el agrónomo.</p>
                    <button className="w-full py-2 border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                      <Upload className="w-4 h-4" /> Importar GeoJSON / KML
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Mantenimiento Físico</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex gap-3 items-start">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Fecha de Instalación</p>
                        <p className="text-sm text-gray-500">15 de Mayo, 2026</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <Wrench className="w-4 h-4 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Próxima Limpieza (Paneles)</p>
                        <p className="text-sm text-amber-600">15 de Noviembre, 2026</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
