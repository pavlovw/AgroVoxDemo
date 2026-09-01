// app/red/[nodeId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Battery, BatteryWarning, Signal, Wifi, WifiOff, MapPin } from "lucide-react";
import { Nodo } from "@/types";
import BatteryChart from "@/components/nodos/BatteryChart";
import NodeEventsLog from "@/components/nodos/NodeEventsLog";

const mockNodos: Record<string, Nodo> = {
  "AGV-001": { id: "AGV-001", fundo: "Parcela Experimental U. de Chile", sector: "Sector 1 - Paltos", estado: "online", voltajeBateria: 3.2, nivelBateria: 95, rssi: -65, ultimaConexion: new Date().toISOString() },
  "AGV-002": { id: "AGV-002", fundo: "Parcela Experimental U. de Chile", sector: "Sector 2 - Cerezos", estado: "offline", voltajeBateria: 2.8, nivelBateria: 15, rssi: -120, ultimaConexion: new Date(Date.now() - 3600000 * 4).toISOString() },
};

const batteryHistoryMock: Record<string, number[]> = {
  "AGV-001": [92, 90, 88, 85, 83, 80, 95],
  "AGV-002": [78, 70, 60, 45, 30, 18, 15],
};

export default function NodeDetailPage() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const nodo = mockNodos[nodeId] ?? mockNodos["AGV-001"];
  const battery = batteryHistoryMock[nodo.id] ?? [nodo.nivelBateria];

  return (
    <>
      <Link href="/red" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-agrogreen-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a Diagnóstico de Red
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl font-bold text-gray-800 font-mono">{nodo.id}</h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${nodo.estado === "online" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {nodo.estado === "online" ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {nodo.estado.toUpperCase()}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {nodo.sector} — {nodo.fundo}</span>
            <span className="flex items-center gap-1.5"><Signal className={`w-4 h-4 ${nodo.rssi > -90 ? "text-agrogreen-500" : "text-amber-500"}`} /> {nodo.rssi} dBm</span>
            <span className="flex items-center gap-1.5">
              {nodo.nivelBateria > 20 ? <Battery className="w-4 h-4 text-agrogreen-500" /> : <BatteryWarning className="w-4 h-4 text-red-500" />}
              {nodo.nivelBateria}% ({nodo.voltajeBateria}V)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BatteryChart data={battery} />
        <NodeEventsLog nodeId={nodo.id} />
      </div>
    </>
  );
}