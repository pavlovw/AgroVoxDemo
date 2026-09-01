"use client";

import { useRouter } from "next/navigation";
import { Battery, BatteryWarning, Signal, Wifi, WifiOff } from "lucide-react";
import { Nodo } from "@/types";

const mockNodos: Nodo[] = [
  { id: "AGV-001", fundo: "Parcela Experimental U. de Chile", sector: "Sector 1 - Paltos", estado: "online", voltajeBateria: 3.2, nivelBateria: 95, rssi: -65, ultimaConexion: new Date().toISOString() },
  { id: "AGV-002", fundo: "Parcela Experimental U. de Chile", sector: "Sector 2 - Cerezos", estado: "offline", voltajeBateria: 2.8, nivelBateria: 15, rssi: -120, ultimaConexion: new Date(Date.now() - 3600000 * 4).toISOString() },
];

export default function DiagnosticoRed() {
  const router = useRouter();

  return (
    <>
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Diagnóstico de Red LoRa</h2>
          <p className="text-xs text-gray-500 mt-1">Monitoreo del estado físico y telemetría de los nodos en terreno.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-3">ID Nodo</th>
                <th className="px-6 py-3">Ubicación</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Batería (LiFePO4)</th>
                <th className="px-6 py-3">Señal (RSSI)</th>
                <th className="px-6 py-3">Última Conexión</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 divide-y divide-gray-100">
              {mockNodos.map((nodo) => (
                <tr key={nodo.id} onClick={() => router.push(`/red/${nodo.id}`)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 font-mono font-medium text-gray-900">{nodo.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">{nodo.sector}</span>
                      <span className="text-xs text-gray-400">{nodo.fundo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${nodo.estado === "online" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {nodo.estado === "online" ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                      {nodo.estado.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {nodo.nivelBateria > 20 ? <Battery className="w-4 h-4 text-agrogreen-500" /> : <BatteryWarning className="w-4 h-4 text-red-500" />}
                      <span>{nodo.nivelBateria}%</span>
                      <span className="text-xs text-gray-400">({nodo.voltajeBateria}V)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Signal className={`w-4 h-4 ${nodo.rssi > -90 ? "text-agrogreen-500" : "text-amber-500"}`} />
                      <span>{nodo.rssi} dBm</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(nodo.ultimaConexion).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}