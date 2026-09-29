"use client";

import { Activity, Power, PowerOff, ShieldCheck, Smartphone, Droplets } from "lucide-react";

interface Lectura {
  id: number;
  bateria: number;
  cavitacion: boolean;
  rssi?: number;
  whatsappEnviado: boolean;
  riegoConfirmado?: boolean;
  createdAt: string;
}

export default function NodeEventsLog({ lecturas }: { lecturas: Lectura[] }) {
  const formatearHora = (fecha: string) => {
    return new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(fecha));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-bold text-gray-800">Historial de Eventos</h3>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
          
          {lecturas.length === 0 ? (
            <p className="text-sm text-gray-500 pl-4">No hay eventos registrados.</p>
          ) : (
            lecturas.map((lectura, index) => {
              const esRiego = lectura.riegoConfirmado;
              const esCavitacion = lectura.cavitacion;
              const esApagado = lectura.bateria <= 0;
              const esPrimerEncendido = index === lecturas.length - 1;

              return (
                <div key={lectura.id} className="relative pl-6">
                  {/* Marcador del Timeline */}
                  <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                    esRiego ? 'bg-blue-500' : esCavitacion ? 'bg-red-500' : esApagado ? 'bg-gray-500' : 'bg-green-500'
                  }`}></span>
                  
                  <div className="text-[10px] font-mono text-gray-400 mb-1">{formatearHora(lectura.createdAt)}</div>
                  
                  {/* CASO: CONFIRMACIÓN DE RIEGO */}
                  {esRiego ? (
                    <>
                      <div className="text-sm font-bold text-blue-700 flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-500" /> Riego de Mitigación Activado
                      </div>
                      <p className="text-xs text-gray-600 mt-1">El agricultor confirmó la apertura de válvulas vía WhatsApp.</p>
                    </>
                  ) : esCavitacion ? (
                    <>
                      <div className="text-sm font-bold text-red-700 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Cavitación Acústica
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Se detectó patrón de estrés hídrico. Señal: {lectura.rssi} dBm.</p>
                      {lectura.whatsappEnviado && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-bold border border-green-200">
                          <Smartphone className="w-3 h-3" /> WhatsApp de alerta despachado al cliente
                        </div>
                      )}
                    </>
                  ) : esApagado ? (
                    <>
                      <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <PowerOff className="w-4 h-4" /> Equipo Desconectado
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Pérdida total de energía (Batería 0%).</p>
                    </>
                  ) : esPrimerEncendido ? (
                    <>
                      <div className="text-sm font-bold text-blue-700 flex items-center gap-2">
                        <Power className="w-4 h-4" /> Encendido / Reinicio
                      </div>
                      <p className="text-xs text-gray-500 mt-1">El dispositivo se reportó en la red exitosamente.</p>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-green-500" /> Transmisión de Rutina
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Telemetría normal. Batería: {lectura.bateria}% | Señal: {lectura.rssi} dBm</p>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}