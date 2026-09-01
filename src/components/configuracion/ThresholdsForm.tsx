"use client";

import { useState } from "react";
import { Save, AlertCircle } from "lucide-react";

interface Thresholds {
  batteryMin: number;
  acousticRefMv: number;
  heartbeatTimeoutMin: number;
}

const initialValues: Thresholds = {
  batteryMin: 20,
  acousticRefMv: 24,
  heartbeatTimeoutMin: 60,
};

export default function ThresholdsForm() {
  const [values, setValues] = useState<Thresholds>(initialValues);
  const [saved, setSaved] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof Thresholds, value: number) => {
    setValues((v) => ({ ...v, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    if (values.batteryMin < 0 || values.batteryMin > 100) {
      setError("La batería mínima debe estar entre 0% y 100%.");
      return;
    }
    if (values.acousticRefMv <= 0) {
      setError("El voltaje de referencia debe ser mayor a 0.");
      return;
    }
    if (values.heartbeatTimeoutMin < 1) {
      setError("El tiempo sin heartbeat debe ser al menos 1 minuto.");
      return;
    }
    setError(null);
    // Acá iría la llamada real, ej: api.put("/configuracion/umbrales", values)
    setSaved(true);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Umbrales del sistema</h2>
        {!saved && (
          <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Cambios sin guardar
          </span>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        <FieldRow
          label="Batería mínima antes de alerta"
          desc="Genera una alerta de mantenimiento cuando la batería cae bajo este porcentaje."
          value={values.batteryMin}
          suffix="%"
          onChange={(v) => update("batteryMin", v)}
        />
        <FieldRow
          label="Voltaje de referencia (umbral acústico)"
          desc="Umbral por defecto para nodos nuevos, ajustable luego por nodo en terreno."
          value={values.acousticRefMv}
          suffix="mV"
          onChange={(v) => update("acousticRefMv", v)}
        />
        <FieldRow
          label="Tiempo sin heartbeat"
          desc="Minutos sin señal antes de marcar un nodo como offline."
          value={values.heartbeatTimeoutMin}
          suffix="min"
          onChange={(v) => update("heartbeatTimeoutMin", v)}
        />
      </div>

      {error && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-100 text-sm text-red-600">{error}</div>
      )}

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saved}
          className="flex items-center gap-2 bg-agrogreen-600 hover:bg-agrogreen-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" /> Guardar cambios
        </button>
      </div>
    </div>
  );
}

function FieldRow({
  label,
  desc,
  value,
  suffix,
  onChange,
}: {
  label: string;
  desc: string;
  value: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="px-6 py-4 flex justify-between items-center gap-6">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 text-right px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-agrogreen-500 focus:ring-2 focus:ring-agrogreen-200 outline-none"
        />
        <span className="text-sm text-gray-400 w-8">{suffix}</span>
      </div>
    </div>
  );
}