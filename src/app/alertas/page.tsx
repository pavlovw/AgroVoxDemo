"use client";

import { useState, useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import Link from "next/link";
import {
  Filter,
  Check,
  Search,
  AlertTriangle,
  BatteryWarning,
  WifiOff,
  Radio,
  Cpu,
  CheckCircle2,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  Trash2,
  CheckCheck,
  ShieldAlert,
  Clock,
  MapPin
} from "lucide-react";

const URL_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const socket = io(URL_BACKEND);

export type AlertSeverity = "high" | "medium" | "info";
export type AlertStatus = "pending" | "resolved";
export type AlertCategory = "CONECTIVIDAD" | "ENERGIA" | "RED_LORA" | "SISTEMA";

export interface SystemAlert {
  id: number;
  titulo: string;
  descripcion?: string;
  severidad: AlertSeverity;
  estado: AlertStatus;
  categoria: AlertCategory;
  dispositivo: string;
  ubicacion: string;
  createdAt: string;
  resolvedAt?: string | null;
}

const statusOptions: { value: AlertStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "resolved", label: "Resuelta" },
];

const severityOptions: { value: AlertSeverity; label: string }[] = [
  { value: "high", label: "Alta (Crítica)" },
  { value: "medium", label: "Media (Advertencia)" },
  { value: "info", label: "Info (Operativa)" },
];

const categoryTabs: { value: "ALL" | AlertCategory; label: string; icon: any }[] = [
  { value: "ALL", label: "Todas", icon: ShieldAlert },
  { value: "CONECTIVIDAD", label: "Conectividad", icon: WifiOff },
  { value: "ENERGIA", label: "Energía Solar", icon: BatteryWarning },
  { value: "RED_LORA", label: "Señal LoRaWAN", icon: Radio },
  { value: "SISTEMA", label: "Provisión / Sistema", icon: Cpu },
];

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);

  // Filtros
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Set<AlertStatus>>(new Set());
  const [severityFilter, setSeverityFilter] = useState<Set<AlertSeverity>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | AlertCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAlertas = async () => {
    try {
      const res = await fetch(`${URL_BACKEND}/api/alertas`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error("Error cargando alertas del sistema:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertas();

    // Escuchar eventos en tiempo real desde el backend
    socket.on("nueva-alerta-sistema", () => fetchAlertas());
    socket.on("alerta-sistema-actualizada", (alertaActualizada: SystemAlert) => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertaActualizada.id ? alertaActualizada : a))
      );
    });
    socket.on("alertas-actualizadas", () => fetchAlertas());
    socket.on("nodo-ping", () => fetchAlertas());
    socket.on("nuevo-nodo-huerfano", () => fetchAlertas());

    return () => {
      socket.off("nueva-alerta-sistema");
      socket.off("alerta-sistema-actualizada");
      socket.off("alertas-actualizadas");
      socket.off("nodo-ping");
      socket.off("nuevo-nodo-huerfano");
    };
  }, []);

  const toggle = <T,>(set: Set<T>, value: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  };

  // Acciones conectadas al Backend
  const handleToggleStatus = async (alert: SystemAlert) => {
    const nuevoEstado: AlertStatus = alert.estado === "pending" ? "resolved" : "pending";
    try {
      const res = await fetch(`${URL_BACKEND}/api/alertas/${alert.id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) {
        const actualizada = await res.json();
        setAlerts((prev) => prev.map((a) => (a.id === alert.id ? actualizada : a)));
      }
    } catch (error) {
      console.error("Error cambiando estado de alerta:", error);
    }
  };

  const handleAuditarRed = async () => {
    setAuditing(true);
    try {
      await fetch(`${URL_BACKEND}/api/alertas/auditar`, { method: "POST" });
      await fetchAlertas();
    } finally {
      setTimeout(() => setAuditing(false), 500);
    }
  };

  const handleResolverTodas = async () => {
    try {
      await fetch(`${URL_BACKEND}/api/alertas/resolver-todas`, { method: "PUT" });
      await fetchAlertas();
    } catch (error) {
      console.error("Error resolviendo todas:", error);
    }
  };

  const handleLimpiarResueltas = async () => {
    try {
      await fetch(`${URL_BACKEND}/api/alertas/limpiar-resueltas`, { method: "DELETE" });
      await fetchAlertas();
    } catch (error) {
      console.error("Error limpiando resueltas:", error);
    }
  };

  // Filtrado combinado
  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      const statusOk = statusFilter.size === 0 || statusFilter.has(a.estado);
      const severityOk = severityFilter.size === 0 || severityFilter.has(a.severidad);
      const categoryOk = categoryFilter === "ALL" || a.categoria === categoryFilter;
      const query = searchQuery.toLowerCase().trim();
      const searchOk =
        !query ||
        a.titulo.toLowerCase().includes(query) ||
        a.dispositivo.toLowerCase().includes(query) ||
        a.ubicacion.toLowerCase().includes(query) ||
        (a.descripcion && a.descripcion.toLowerCase().includes(query));

      return statusOk && severityOk && categoryOk && searchOk;
    });
  }, [alerts, statusFilter, severityFilter, categoryFilter, searchQuery]);

  // Métricas de Resumen (KPIs)
  const activeCount = statusFilter.size + severityFilter.size;
  const pendingCount = alerts.filter((a) => a.estado === "pending").length;
  const highPendingCount = alerts.filter((a) => a.severidad === "high" && a.estado === "pending").length;
  const energyIssuesCount = alerts.filter((a) => a.categoria === "ENERGIA" && a.estado === "pending").length;
  const resolvedCount = alerts.filter((a) => a.estado === "resolved").length;

  // Formateador de fecha amigable
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hoy = new Date();
    const esHoy =
      date.getDate() === hoy.getDate() &&
      date.getMonth() === hoy.getMonth() &&
      date.getFullYear() === hoy.getFullYear();

    const hora = new Intl.DateTimeFormat("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

    if (esHoy) return `Hoy, ${hora}`;
    const fechaCorta = new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
    }).format(date);
    return `${fechaCorta}, ${hora}`;
  };

  const getCategoryBadge = (cat: AlertCategory) => {
    switch (cat) {
      case "CONECTIVIDAD":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-red-50 text-red-700 border border-red-100">
            <WifiOff className="w-3 h-3" /> Conectividad
          </span>
        );
      case "ENERGIA":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
            <BatteryWarning className="w-3 h-3" /> Energía Solar
          </span>
        );
      case "RED_LORA":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
            <Radio className="w-3 h-3" /> Red LoRaWAN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
            <Cpu className="w-3 h-3" /> Sistema / Zero-Touch
          </span>
        );
    }
  };

  const getSeverityStyles = (sev: AlertSeverity, estado: AlertStatus) => {
    if (estado === "resolved") {
      return {
        dot: "bg-gray-300",
        badge: "bg-gray-100 text-gray-500",
        label: "Resuelta",
      };
    }
    switch (sev) {
      case "high":
        return {
          dot: "bg-red-500 animate-pulse",
          badge: "bg-red-100 text-red-700 border border-red-200",
          label: "Severidad Alta",
        };
      case "medium":
        return {
          dot: "bg-amber-500",
          badge: "bg-amber-100 text-amber-800 border border-amber-200",
          label: "Severidad Media",
        };
      default:
        return {
          dot: "bg-blue-500",
          badge: "bg-blue-50 text-blue-700 border border-blue-200",
          label: "Informativa",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs de Resumen Operativo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Tickets Pendientes
            </p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{pendingCount}</p>
            <p className="text-xs text-gray-500 mt-1">Requieren atención técnica</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Severidad Alta (Críticas)
            </p>
            <p className="text-3xl font-bold text-red-600 mt-1">{highPendingCount}</p>
            <p className="text-xs text-gray-500 mt-1">Equipos caídos o sin red</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            <WifiOff className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Alertas de Energía
            </p>
            <p className="text-3xl font-bold text-amber-500 mt-1">{energyIssuesCount}</p>
            <p className="text-xs text-gray-500 mt-1">Batería solar {"<="} 20%</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
            <BatteryWarning className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Incidencias Resueltas
            </p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{resolvedCount}</p>
            <p className="text-xs text-gray-500 mt-1">Historial de mantenimiento</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Contenedor Principal de Alertas */}
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cabecera y Acciones Globales */}
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-semibold text-gray-800">
                Alertas activas y recientes de infraestructura
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                En vivo
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Notificaciones operativas del equipo de soporte (hardware, energía solar y enlaces LoRaWAN) — no incluye alertas de estrés hídrico al agricultor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAuditarRed}
              disabled={auditing}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${auditing ? "animate-spin" : ""}`} />
              {auditing ? "Escaneando red..." : "Auditar Red Ahora"}
            </button>

            {pendingCount > 0 && (
              <button
                onClick={handleResolverTodas}
                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Resolver todas ({pendingCount})
              </button>
            )}

            {resolvedCount > 0 && (
              <button
                onClick={handleLimpiarResueltas}
                className="text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-2 rounded-lg flex items-center gap-1 transition-colors"
                title="Borrar el historial de alertas resueltas"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpiar resueltas
              </button>
            )}
          </div>
        </div>

        {/* Barra de Herramientas: Pestañas de Categoría + Buscador + Dropdown de Filtros */}
        <div className="px-6 py-3 bg-gray-50/60 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 relative">
          {/* Pestañas por Categoría */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {categoryTabs.map((tab) => {
              const Icon = tab.icon;
              const active = categoryFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setCategoryFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    active
                      ? "bg-gray-900 text-white shadow-xs"
                      : "text-gray-600 hover:bg-gray-200/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Buscador y Botón de Filtro */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ID (ej. AGV-011), fundo..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <button
              onClick={() => setFilterOpen((v) => !v)}
              className="text-xs bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              Filtrar
              {activeCount > 0 && (
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-1.5 rounded-full">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* Menú Desplegable de Filtros (Estado y Severidad) */}
          {filterOpen && (
            <div className="absolute right-6 top-14 z-20 w-60 bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Estado</p>
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggle(statusFilter, opt.value, setStatusFilter)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                >
                  {opt.label}
                  {statusFilter.has(opt.value) && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
              ))}

              <p className="text-xs font-semibold text-gray-400 uppercase mt-3 mb-2">
                Severidad
              </p>
              {severityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggle(severityFilter, opt.value, setSeverityFilter)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                >
                  {opt.label}
                  {severityFilter.has(opt.value) && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
              ))}

              {activeCount > 0 && (
                <button
                  onClick={() => {
                    setStatusFilter(new Set());
                    setSeverityFilter(new Set());
                  }}
                  className="w-full text-center text-xs text-red-500 hover:text-red-700 font-medium mt-3 pt-3 border-t border-gray-100"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Lista de Alertas */}
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400 animate-pulse">
              Sincronizando telemetría y auditando estado de los dispositivos...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center px-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium text-gray-700">
                No se encontraron alertas operativas con estos criterios
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Todos los nodos y concentradores LoRaWAN auditados operan dentro de sus parámetros.
              </p>
            </div>
          ) : (
            filtered.map((alert) => {
              const sevStyle = getSeverityStyles(alert.severidad, alert.estado);
              const isResolved = alert.estado === "resolved";
              const isGateway = alert.dispositivo.startsWith("GW");

              return (
                <div
                  key={alert.id}
                  className={`p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isResolved
                      ? "bg-gray-50/50 opacity-75"
                      : alert.severidad === "high"
                      ? "bg-red-50/20 hover:bg-red-50/40"
                      : "hover:bg-gray-50/80"
                  }`}
                >
                  {/* Izquierda: Indicador, Título, Descripción y Metadatos */}
                  <div className="flex items-start gap-3.5">
                    <div className="mt-1.5">
                      <span className={`block w-3 h-3 rounded-full ${sevStyle.dot}`} />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            isResolved ? "line-through text-gray-500" : "text-gray-900"
                          }`}
                        >
                          {alert.titulo}
                        </span>

                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${sevStyle.badge}`}
                        >
                          {sevStyle.label}
                        </span>

                        {getCategoryBadge(alert.categoria)}
                      </div>

                      {alert.descripcion && (
                        <p className="text-xs text-gray-600 max-w-3xl leading-relaxed">
                          {alert.descripcion}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                        <span className="font-mono font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                          {alert.dispositivo}
                        </span>

                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {alert.ubicacion}
                        </span>

                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          Detectada: {formatTime(alert.createdAt)}
                        </span>

                        {isResolved && alert.resolvedAt && (
                          <span className="text-emerald-600 font-medium">
                            • Resuelta ({formatTime(alert.resolvedAt)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Derecha: Botones de Acción para el equipo de Soporte */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {!isGateway && (
                      <Link
                        href={`/red/${alert.dispositivo}`}
                        className="text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        Diagnosticar
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </Link>
                    )}

                    <button
                      onClick={() => handleToggleStatus(alert)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                        isResolved
                          ? "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                      }`}
                    >
                      {isResolved ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reabrir
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Marcar Resuelta
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}