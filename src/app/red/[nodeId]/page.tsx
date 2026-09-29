"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { io } from "socket.io-client";
import { ArrowLeft, Battery, BatteryWarning, Signal, Wifi, WifiOff, MapPin, Wrench, Calendar } from "lucide-react";
import BatteryChart from "@/components/nodos/BatteryChart";
import NodeEventsLog from "@/components/nodos/NodeEventsLog";

const URL_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const socket = io(URL_BACKEND);

interface NodePageProps { params: Promise<{ nodeId: string }> }

export default function NodeDetailPage({ params }: NodePageProps) {
  const { nodeId } = use(params);
  const [nodo, setNodo] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  const formatearFecha = (fecha: string) => {
    if (!fecha) return 'No registrada';
    return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(fecha));
  };

  useEffect(() => {
    const cargarNodo = async () => {
      try {
        const res = await fetch(`${URL_BACKEND}/api/nodos/${nodeId}`);
        if (res.ok) {
          const data = await res.json();
          setNodo(data);
        }
        setCargando(false);
      } catch (error) {
        console.error("Error al cargar nodo:", error);
        setCargando(false);
      }
    };

    cargarNodo();

    // Actualización en tiempo real
    socket.on('nodo-ping', (data) => {
      if (data.id === nodeId) {
        setNodo((prev: any) => {
          if (!prev) return prev;
          
          const nuevaLectura = {
            id: Date.now(),
            bateria: data.bateria,
            rssi: data.senalDbm || -65,
            cavitacion: data.cavitacion,
            whatsappEnviado: data.whatsappEnviado,
            riegoConfirmado: data.riegoConfirmado || false, // <-- CAPTURA EL RIEGO
            createdAt: data.createdAt || new Date().toISOString()
          };
          
          return {
            ...prev,
            estado: data.estado,
            bateria: data.bateria,
            lecturas: [nuevaLectura, ...prev.lecturas].slice(0, 30)
          };
        });
      }
    });

    socket.on('alerta_nodo', (data) => {
      if (data.nodoId === nodeId) {
        setNodo((prev: any) => ({ ...prev, estado: 'ALERTA' }));
      }
    });

    return () => {
      socket.off('nodo-ping');
      socket.off('alerta_nodo');
    };
  }, [nodeId]);

  if (cargando) return <div className="p-8 text-gray-500 font-medium animate-pulse">Cargando telemetría del equipo...</div>;
  if (!nodo) return <div className="p-8 text-red-500 font-bold">El nodo {nodeId} no se encontró en la base de datos.</div>;

  const voltajeEstimado = (3.2 + (nodo.bateria * 0.005)).toFixed(1);
  const ultimaSenal = nodo.lecturas?.[0]?.rssi || -65;

  return (
    <div className="max-w-7xl mx-auto">
      <Link href="/red" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-agrogreen-600 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a Inventario
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 font-mono">{nodo.id}</h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${nodo.estado === "ALERTA" ? "bg-red-100 text-red-700" : nodo.estado === "INACTIVO" ? "bg-gray-100 text-gray-700" : "bg-green-100 text-green-700"}`}>
              {nodo.estado === "INACTIVO" ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              {nodo.estado}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-sm text-gray-600 font-medium">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {nodo.sector ? `${nodo.sector.cliente.nombre} — ${nodo.sector.nombre}` : 'Equipo Huérfano'}</span>
            <span className="flex items-center gap-1.5"><Signal className={`w-4 h-4 ${ultimaSenal > -90 ? "text-blue-500" : "text-amber-500"}`} /> {ultimaSenal} dBm</span>
            <span className={`flex items-center gap-1.5 ${nodo.bateria <= 15 ? 'text-red-600' : ''}`}>
              {nodo.bateria > 15 ? <Battery className="w-4 h-4 text-agrogreen-500" /> : <BatteryWarning className="w-4 h-4 text-red-500" />}
              {nodo.bateria}% ({voltajeEstimado}V)
            </span>
          </div>
        </div>

        {/* Información de Hardware Logística */}
        <div className="flex gap-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Alta en Red</p>
            <p className="text-sm font-semibold text-gray-800">{formatearFecha(nodo.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Wrench className="w-3 h-3"/> Últ. Mantención</p>
            <p className="text-sm font-semibold text-gray-800">{formatearFecha(nodo.ultimaMantencion)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Al gráfico le extraemos SOLO el número de batería */}
          <BatteryChart data={
            nodo.lecturas?.length === 1 
              ? [nodo.lecturas[0].bateria, nodo.lecturas[0].bateria] 
              : [...(nodo.lecturas || [])].reverse().map((l: any) => l.bateria)
          } />
        </div>
        <div className="lg:col-span-1">
          {/* A la bitácora le pasamos el objeto lectura COMPLETO */}
          <NodeEventsLog lecturas={nodo.lecturas || []} />
        </div>
      </div>
    </div>
  );
}