// components/nodos/NodeEventsLog.tsx
import { CheckCheck, Zap } from "lucide-react";

const eventsMock = [
  { time: "Hoy, 13:15", type: "Cavitación detectada", alertSent: true },
  { time: "Ayer, 09:40", type: "Cavitación detectada", alertSent: false },
  { time: "Hace 3 días, 22:05", type: "Cavitación detectada", alertSent: true },
];

export default function NodeEventsLog({ nodeId }: { nodeId: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-800">Registro de eventos</h2>
      <p className="text-xs text-gray-500 mt-1 mb-4">Eventos acústicos generados por {nodeId}.</p>
      <div className="relative border-l border-gray-200 ml-3 space-y-5">
        {eventsMock.map((ev, i) => (
          <div key={i} className="relative pl-6">
            <span className="absolute -left-2 top-1 w-4 h-4 rounded-full border-2 border-white bg-agrogreen-500 flex items-center justify-center">
              <Zap className="w-2 h-2 text-white" />
            </span>
            <div className="text-xs text-gray-400 mb-0.5">{ev.time}</div>
            <div className="text-sm text-gray-700 font-medium">{ev.type}</div>
            {ev.alertSent
              ? <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded mt-1 text-gray-600"><CheckCheck className="w-3 h-3 text-blue-400" /> WhatsApp enviado</span>
              : <span className="text-xs text-gray-400 mt-1 inline-block">Sin alerta (bajo umbral)</span>}
          </div>
        ))}
      </div>
    </div>
  );
}