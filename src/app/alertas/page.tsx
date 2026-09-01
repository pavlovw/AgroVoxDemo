"use client";

import { useState } from "react";
import { Filter, Check } from "lucide-react";
import AlertsSummary from "@/components/alerts/AlertsSummary";
import AlertRow, { type AlertItem, type AlertSeverity, type AlertStatus } from "@/components/alerts/AlertRow";

const alerts: AlertItem[] = [
  { id: "1", title: "Nodo sin comunicación > 4 horas", severity: "high", status: "pending", nodeId: "AGV-042", location: "Viña Los Tilos", time: "Hoy, 14:30" },
  { id: "2", title: "Batería solar bajo 20%", severity: "medium", status: "pending", nodeId: "AGV-002", location: "Parcela Experimental U. de Chile", time: "Hoy, 16:10" },
  { id: "3", title: "Gateway reiniciado automáticamente", severity: "info", status: "resolved", nodeId: "Gateway Sector 3", location: "Fundo El Encanto", time: "Ayer, 03:12" },
];

const statusOptions: { value: AlertStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "resolved", label: "Resuelta" },
];

const severityOptions: { value: AlertSeverity; label: string }[] = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Media" },
  { value: "info", label: "Info" },
];

export default function AlertasPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Set<AlertStatus>>(new Set());
  const [severityFilter, setSeverityFilter] = useState<Set<AlertSeverity>>(new Set());

  const toggle = <T,>(set: Set<T>, value: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  };

  const filtered = alerts.filter((a) => {
    const statusOk = statusFilter.size === 0 || statusFilter.has(a.status);
    const severityOk = severityFilter.size === 0 || severityFilter.has(a.severity);
    return statusOk && severityOk;
  });

  const activeCount = statusFilter.size + severityFilter.size;
  const pending = alerts.filter((a) => a.status === "pending").length;
  const high = alerts.filter((a) => a.severity === "high").length;
  const resolvedToday = alerts.filter((a) => a.status === "resolved").length;

  return (
    <>
      <AlertsSummary pending={pending} high={high} resolvedToday={resolvedToday} />

      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center relative">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Alertas activas y recientes</h2>
            <p className="text-xs text-gray-500 mt-1">
              Notificaciones operativas del equipo — no incluye alertas de estrés hídrico al agricultor.
            </p>
          </div>

          <button
            onClick={() => setFilterOpen((v) => !v)}
            className="text-sm text-agrogreen-600 hover:text-agrogreen-700 font-medium flex items-center gap-1"
          >
            <Filter className="w-4 h-4" />
            Filtrar
            {activeCount > 0 && (
              <span className="bg-agrogreen-100 text-agrogreen-700 text-xs font-bold px-1.5 rounded-full">
                {activeCount}
              </span>
            )}
          </button>

          {filterOpen && (
            <div className="absolute right-6 top-14 z-20 w-56 bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Estado</p>
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggle(statusFilter, opt.value, setStatusFilter)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                >
                  {opt.label}
                  {statusFilter.has(opt.value) && <Check className="w-4 h-4 text-agrogreen-600" />}
                </button>
              ))}

              <p className="text-xs font-semibold text-gray-400 uppercase mt-3 mb-2">Severidad</p>
              {severityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggle(severityFilter, opt.value, setSeverityFilter)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                >
                  {opt.label}
                  {severityFilter.has(opt.value) && <Check className="w-4 h-4 text-agrogreen-600" />}
                </button>
              ))}

              {activeCount > 0 && (
                <button
                  onClick={() => {
                    setStatusFilter(new Set());
                    setSeverityFilter(new Set());
                  }}
                  className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-3 pt-3 border-t border-gray-100"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No hay alertas con estos filtros.</p>
          ) : (
            filtered.map((alert) => <AlertRow key={alert.id} alert={alert} />)
          )}
        </div>
      </div>
    </>
  );
}