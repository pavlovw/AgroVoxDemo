"use client";

import { Network, AlertTriangle, BatteryWarning, MessageCircle, Filter, Sprout, Signal, SignalZero, CheckCheck } from "lucide-react";

export default function Dashboard() {
  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Nodos Totales Activos</p>
            <p className="text-3xl font-bold text-gray-800">142</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-agrogreen-50 flex items-center justify-center text-agrogreen-600">
            <Network className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Fuera de Línea / Fallando</p>
            <p className="text-3xl font-bold text-red-600">3</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Batería Solar Crítica</p>
            <p className="text-3xl font-bold text-amber-500">1</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
            <BatteryWarning className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Alertas Enviadas Hoy</p>
            <p className="text-3xl font-bold text-gray-800">12</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <MessageCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Contenedor Principal (Apilado Verticalmente) */}
      <div className="flex flex-col gap-8">
        
        {/* Tabla Central - 100% ancho */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Estado de Nodos en Terreno</h2>
            <button className="text-sm text-agrogreen-600 hover:text-agrogreen-700 font-medium flex items-center gap-1">
              <Filter className="w-4 h-4" /> Filtrar
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-3">ID del Nodo</th>
                  <th className="px-6 py-3">Cliente / Fundo</th>
                  <th className="px-6 py-3">Cultivo</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Señal LoRa</th>
                  <th className="px-6 py-3">Batería Solar</th>
                  <th className="px-6 py-3">Último Heartbeat</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600 divide-y divide-gray-100">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">AGV-001</td>
                  <td className="px-6 py-4">Agrícola San Pedro</td>
                  <td className="px-6 py-4 flex items-center gap-2"><Sprout className="w-4 h-4 text-agrogreen-500" /> Palto</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-max">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> En línea
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-1"><Signal className="w-4 h-4 text-gray-400" /> -65 dBm</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 font-medium">98%</span>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: '98%' }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">Hace 2 min</td>
                </tr>
                <tr className="hover:bg-red-50 transition-colors bg-red-50/30">
                  <td className="px-6 py-4 font-medium text-gray-900">AGV-042</td>
                  <td className="px-6 py-4 font-medium">Viña Los Tilos</td>
                  <td className="px-6 py-4 flex items-center gap-2"><Sprout className="w-4 h-4 text-red-400" /> Cerezo</td>
                  <td className="px-6 py-4">
                    <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-max">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Offline
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-1 text-gray-400"><SignalZero className="w-4 h-4" /> --</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 font-medium text-red-600">12%</span>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: '12%' }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-red-600">Hace 5 horas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Logs - 100% ancho */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Logs del Sistema</h2>
            <p className="text-xs text-gray-500 mt-1">Últimas actividades de red y notificaciones.</p>
          </div>
          <div className="p-6 overflow-y-auto max-h-96">
            <div className="relative border-l border-gray-200 ml-3 space-y-6">
              
              <div className="relative pl-6">
                <span className="absolute -left-2 top-1 w-4 h-4 rounded-full border-2 border-white bg-red-500"></span>
                <div className="text-xs text-gray-400 mb-1">Hoy, 14:30</div>
                <div className="text-sm text-gray-700 font-medium">Nodo Offline</div>
                <div className="text-sm text-gray-500 mt-1">
                  <span className="font-semibold text-gray-700">AGV-042 (Cerezo)</span> desconectado inesperadamente de la red LoRa.
                </div>
              </div>

              <div className="relative pl-6">
                <span className="absolute -left-2 top-1 w-4 h-4 rounded-full border-2 border-white bg-agrogreen-500 flex items-center justify-center">
                  <MessageCircle className="w-2 h-2 text-white" />
                </span>
                <div className="text-xs text-gray-400 mb-1">Hoy, 13:15</div>
                <div className="text-sm text-gray-700 font-medium text-agrogreen-700">Asfixia Detectada</div>
                <div className="text-sm text-gray-500 mt-1">
                  Cavitación acústica en Fundo El Encanto (Sector 3). <br/>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded inline-flex items-center gap-1 mt-2 text-gray-600">
                    <CheckCheck className="w-3 h-3 text-blue-400" /> WhatsApp enviado exitosamente.
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </>
  );
}