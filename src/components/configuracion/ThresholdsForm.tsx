"use client";

import { useState, useEffect } from "react";
import {
  Save,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  BatteryWarning,
  Activity,
  Clock,
  Radio,
  MessageSquare,
  Sparkles
} from "lucide-react";

const URL_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export interface Thresholds {
  bateriaMinima: number;
  voltajeReferenciaMv: number;
  heartbeatTimeoutMin: number;
  rssiMinimoDbm: number;
  whatsappHabilitado: boolean;
  autoResolverAlertas: boolean;
}

const defaultValues: Thresholds = {
  bateriaMinima: 20,
  voltajeReferenciaMv: 24,
  heartbeatTimeoutMin: 60,
  rssiMinimoDbm: -110,
  whatsappHabilitado: true,
  autoResolverAlertas: true,
};

export default function ThresholdsForm({
  initialData,
  onSaved,
}: {
  initialData?: Thresholds | null;
  onSaved?: (newValues: Thresholds) => void;
}) {
  const [values, setValues] = useState<Thresholds>(initialData || defaultValues);
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setValues(initialData);
      setSaved(true);
    }
  }, [initialData]);

  const update = <K extends keyof Thresholds>(field: K, value: Thresholds[K]) => {
    setValues((v) => ({ ...v, [field]: value }));
    setSaved(false);
    setSuccessMsg(null);
  };

  const handleResetDefaults = () => {
    setValues(defaultValues);
    setSaved(false);
    setError(null);
  };

  const handleSave = async () => {
    if (values.bateriaMinima < 5 || values.bateriaMinima > 90) {
      setError("La batería mínima debe estar entre 5% y 90%.");
      return;
    }
    if (values.voltajeReferenciaMv <= 0) {
      setError("El voltaje de referencia acústico debe ser mayor a 0 mV.");
      return;
    }
    if (values.heartbeatTimeoutMin < 1) {
      setError("El tiempo sin heartbeat debe ser de al menos 1 minuto.");
      return;
    }
    if (values.rssiMinimoDbm > -40 || values.rssiMinimoDbm < -140) {
      setError("El umbral RSSI LoRaWAN debe estar entre -140 dBm y -40 dBm.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const res = await fetch(`${URL_BACKEND}/api/configuracion/umbrales`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Error guardando en el servidor");

      const updated = await res.json();
      setValues(updated);
      setSaved(true);
      setSuccessMsg("Umbrales guardados y red re-auditada correctamente.");
      onSaved?.(updated);

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError("No se pudo conectar con el backend para guardar los umbrales.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Umbrales operativos y parámetros del sistema
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Define las reglas globales para generar tickets de mantenimiento y alertas acústicas TinyML.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!saved && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Cambios sin guardar
            </span>
          )}
          {saved && successMsg && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {successMsg}
            </span>
          )}
        </div>
      </div>

      {/* Parámetros Numéricos */}
      <div className="divide-y divide-gray-100">
        <FieldRow
          icon={<BatteryWarning className="w-4 h-4 text-amber-500" />}
          label="Batería solar mínima antes de alerta"
          desc="Genera un ticket de mantenimiento en Alertas del Sistema cuando un nodo cae bajo este porcentaje."
          value={values.bateriaMinima}
          suffix="%"
          onChange={(v) => update("bateriaMinima", v)}
        />
        <FieldRow
          icon={<Activity className="w-4 h-4 text-emerald-600" />}
          label="Voltaje de referencia (umbral acústico TinyML)"
          desc="Umbral ultrasónico por defecto para detectar cavitación en el xilema en nodos nuevos."
          value={values.voltajeReferenciaMv}
          suffix="mV"
          onChange={(v) => update("voltajeReferenciaMv", v)}
        />
        <FieldRow
          icon={<Radio className="w-4 h-4 text-purple-600" />}
          label="Potencia mínima de señal LoRaWAN (RSSI)"
          desc="Dispara una advertencia de degradación de enlace cuando la señal cae por debajo de este valor."
          value={values.rssiMinimoDbm}
          suffix="dBm"
          onChange={(v) => update("rssiMinimoDbm", v)}
        />
        <FieldRow
          icon={<Clock className="w-4 h-4 text-blue-500" />}
          label="Tiempo máximo sin heartbeat (Keep-Alive)"
          desc="Minutos sin recibir paquetes de telemetría antes de declarar un nodo o gateway como Offline."
          value={values.heartbeatTimeoutMin}
          suffix="min"
          onChange={(v) => update("heartbeatTimeoutMin", v)}
        />

        {/* Interruptores de Automatización */}
        <div className="px-6 py-4 flex justify-between items-center gap-6 bg-gray-50/40">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-white border border-gray-200 shadow-2xs">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                Despacho automático por WhatsApp Business API
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Envía alertas interactivas al agricultor inmediatamente cuando un nodo entra en estado de cavitación.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => update("whatsappHabilitado", !values.whatsappHabilitado)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              values.whatsappHabilitado ? "bg-agrogreen-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                values.whatsappHabilitado ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="px-6 py-4 flex justify-between items-center gap-6 bg-gray-50/40">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-white border border-gray-200 shadow-2xs">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                Auto-resolver alertas técnicas al recuperar parámetros
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Marca automáticamente como resueltas las alertas de energía o conectividad cuando el nodo vuelve a reportar valores normales.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => update("autoResolverAlertas", !values.autoResolverAlertas)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              values.autoResolverAlertas ? "bg-agrogreen-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                values.autoResolverAlertas ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {error && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-100 text-xs font-medium text-red-600">
          {error}
        </div>
      )}

      {/* Footer con botones */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="text-xs text-gray-500 hover:text-gray-800 font-medium flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restaurar valores de fábrica
        </button>

        <button
          onClick={handleSave}
          disabled={saved || saving}
          className="flex items-center gap-2 bg-agrogreen-600 hover:bg-agrogreen-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-2xs"
        >
          <Save className="w-4 h-4" />
          {saving ? "Guardando y auditando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

function FieldRow({
  icon,
  label,
  desc,
  value,
  suffix,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  value: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="px-6 py-4 flex justify-between items-center gap-6 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-2 rounded-lg bg-gray-50 border border-gray-100">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 text-right px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 focus:border-agrogreen-500 focus:ring-2 focus:ring-agrogreen-200 outline-none"
        />
        <span className="text-xs font-medium text-gray-400 w-9">{suffix}</span>
      </div>
    </div>
  );
}