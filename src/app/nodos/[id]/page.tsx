"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Activity, Battery, Signal, Zap } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Datos simulados de las últimas 24 horas (intervalos de 4 horas)
const mockHistorial = [
  { hora: "00:00", bateria: 98, rssi: -65 },
  { hora: "04:00", bateria: 96, rssi: -68 },
  { hora: "08:00", bateria: 95, rssi: -62 },
  { hora: "12:00", bateria: 100, rssi: -60 }, // Recarga solar al mediodía
  { hora: "16:00", bateria: 100, rssi: -64 },
  { hora: "20:00", bateria: 97, rssi: -66 },
];

export default function DetalleNodo() {
  const params = useParams();
  const idNodo = params.id as string;

  return (
    <main className="p-8">
      {/* Cabecera y Navegación */}
      <header className="mb-8">
        <Link 
          href="/red" 
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Diagnóstico de Red
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Nodo: {idNodo}</h1>
            <p className="text-slate-400">Sector 1 - Paltos | Fundo Experimental U. de Chile</p>
          </div>
          <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border border-green-500/20">
            <Activity className="w-4 h-4" /> En línea y transmitiendo
          </span>
        </div>
      </header>

      {/* Tarjetas de Diagnóstico Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-lg">
            <Battery className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Batería Actual</p>
            <p className="text-2xl font-bold text-white">97% <span className="text-sm font-normal text-slate-500">(3.3V)</span></p>
          </div>
        </div>
        
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-lg">
            <Signal className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Calidad LoRa (RSSI)</p>
            <p className="text-2xl font-bold text-white">-66 dBm</p>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-lg">
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Última Inferencia IA</p>
            <p className="text-2xl font-bold text-white">Hace 12 min</p>
          </div>
        </div>
      </div>

      {/* Gráfico Histórico */}
      <section className="bg-slate-900 rounded-lg border border-slate-700 p-6">
        <h2 className="text-lg font-medium text-white mb-6">Historial de Telemetría (24h)</h2>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockHistorial} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBateria" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRssi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="hora" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Area 
                type="monotone" 
                dataKey="bateria" 
                name="Batería (%)" 
                stroke="#4ade80" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorBateria)" 
              />
              <Area 
                type="monotone" 
                dataKey="rssi" 
                name="RSSI (dBm)" 
                stroke="#60a5fa" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRssi)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  );
}