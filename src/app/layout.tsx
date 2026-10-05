"use client";

import { Inter } from "next/font/google";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  Leaf,
  LineChart,
  Users,
  Cpu,
  Bell,
  Settings,
  Menu,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Radio,
  X
} from "lucide-react";
import "./globals.css";
import { Sparkles } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });
const URL_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const socket = io(URL_BACKEND);

interface SystemAlertPreview {
  id: number;
  titulo: string;
  severidad: "high" | "medium" | "info";
  estado: "pending" | "resolved";
  dispositivo: string;
  ubicacion: string;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingAlerts, setPendingAlerts] = useState<SystemAlertPreview[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const pathname = usePathname();
  const router = useRouter();
  const bellRef = useRef<HTMLDivElement>(null);

  // Función para obtener las alertas pendientes reales desde el Backend
  const fetchPendingAlerts = async () => {
    try {
      const res = await fetch(`${URL_BACKEND}/api/alertas`);
      if (res.ok) {
        const data: SystemAlertPreview[] = await res.json();
        const activas = data.filter((a) => a.estado === "pending");
        setPendingAlerts(activas);
      }
    } catch (error) {
      console.error("Error sincronizando contador de alertas:", error);
    }
  };

  useEffect(() => {
    fetchPendingAlerts();

    if (socket.connected) setSocketConnected(true);

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));

    // Escuchar todos los eventos que pueden alterar el número de alertas pendientes
    socket.on("nueva-alerta-sistema", () => fetchPendingAlerts());
    socket.on("alerta-sistema-actualizada", () => fetchPendingAlerts());
    socket.on("alertas-actualizadas", () => fetchPendingAlerts());
    socket.on("nodo-ping", () => fetchPendingAlerts());
    socket.on("nuevo-nodo-huerfano", () => fetchPendingAlerts());
    socket.on("nuevo-gateway-huerfano", () => fetchPendingAlerts());

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("nueva-alerta-sistema");
      socket.off("alerta-sistema-actualizada");
      socket.off("alertas-actualizadas");
      socket.off("nodo-ping");
      socket.off("nuevo-nodo-huerfano");
      socket.off("nuevo-gateway-huerfano");
    };
  }, [pathname]);

  // Cerrar el dropdown de la campana al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Destacar ruta activa (incluyendo sub-rutas como /clientes/1 o /red/AGV-011)
  const getNavItemClass = (path: string) => {
    const isActive = path === "/" ? pathname === "/" : pathname?.startsWith(path);
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors ${
      isActive
        ? "bg-agrogreen-600 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;
  };

  // Título dinámico según la sección actual
  const getHeaderTitle = () => {
    if (pathname === "/") return "Monitoreo Global de Red IoT";
    if (pathname?.startsWith("/clientes")) return "Gestión de Clientes y Predios";
    if (pathname?.startsWith("/red")) return "Diagnóstico de Nodos IoT";
    if (pathname?.startsWith("/alertas")) return "Alertas Operativas del Sistema";
    if (pathname?.startsWith("/configuracion")) return "Configuración de Plataforma";
    return "Monitoreo de Red IoT";
  };

  // Buscador rápido superior (Enter redirige a nodo o cliente)
  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = globalSearch.trim();
    if (!q) return;

    if (q.toUpperCase().startsWith("AGV-")) {
      router.push(`/red/${q.toUpperCase()}`);
    } else {
      router.push(`/red`);
    }
    setGlobalSearch("");
  };

  const pendingCount = pendingAlerts.length;
  const hasHighSeverity = pendingAlerts.some((a) => a.severidad === "high");

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} flex h-screen overflow-hidden`} suppressHydrationWarning>
        {/* Overlay para cerrar sidebar en móvil */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "fixed z-50 h-full shadow-2xl flex" : "hidden"
          } md:flex bg-agrodark text-gray-300 w-64 flex-shrink-0 flex-col transition-all duration-300`}
        >
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
            <div className="flex items-center gap-3 text-white font-bold text-xl tracking-wide">
              <div className="w-8 h-8 rounded-lg bg-agrogreen-500 flex items-center justify-center text-white">
                <Leaf className="w-5 h-5" />
              </div>
              AgroVox<span className="text-gray-400 font-light text-sm">Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              <li>
                <Link
                  href="/"
                  onClick={() => setSidebarOpen(false)}
                  className={getNavItemClass("/")}
                >
                  <LineChart className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/clientes"
                  onClick={() => setSidebarOpen(false)}
                  className={getNavItemClass("/clientes")}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Clientes</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/red"
                  onClick={() => setSidebarOpen(false)}
                  className={getNavItemClass("/red")}
                >
                  <Cpu className="w-5 h-5" />
                  <span className="font-medium">Nodos IoT</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/alertas"
                  onClick={() => setSidebarOpen(false)}
                  className={getNavItemClass("/alertas")}
                >
                  <Bell className="w-5 h-5" />
                  <span className="font-medium">Alertas del Sistema</span>

                  {/* Contador Dinámico conectado al Backend */}
                  {pendingCount > 0 ? (
                    <span
                      className={`ml-auto text-white text-xs font-bold px-2 py-0.5 rounded-full transition-all ${
                        hasHighSeverity
                          ? "bg-red-500 animate-pulse"
                          : "bg-amber-500"
                      }`}
                    >
                      {pendingCount}
                    </span>
                  ) : (
                    <span className="ml-auto bg-gray-800 text-gray-400 text-[11px] font-medium px-2 py-0.5 rounded-full">
                      0
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  href="/configuracion"
                  onClick={() => setSidebarOpen(false)}
                  className={getNavItemClass("/configuracion")}
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Configuración</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Perfil de Usuario + Estado del Servidor */}
          <div className="p-4 border-t border-gray-800 space-y-3">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-agrogreen-400" />
                Enlace Telemetría
              </span>
              <span
                className={`inline-flex items-center gap-1 font-medium ${
                  socketConnected ? "text-emerald-400" : "text-red-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    socketConnected ? "bg-emerald-400 animate-ping" : "bg-red-400"
                  }`}
                />
                {socketConnected ? "Online" : "Offline"}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-9 h-9 rounded-full bg-agrogreen-600 flex items-center justify-center font-bold text-white text-sm">
                PV
              </div>
              <div>
                <p className="text-sm font-medium text-white">Pablo Vargas</p>
                <p className="text-xs text-gray-400">Administrador</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50/50">
          {/* Header */}
          <header className="h-16 bg-white shadow-xs border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 z-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
                {getHeaderTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-5">
              {/* Buscador Rápido */}
              <form onSubmit={handleGlobalSearch} className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Ir a nodo (ej. AGV-011)..."
                  className="pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-agrogreen-500 focus:ring-2 focus:ring-agrogreen-200 outline-none w-64 transition-all"
                />
              </form>

              {/* Campanita Interactiva con Vista Rápida */}
              <div className="relative" ref={bellRef}>
                <button
                  onClick={() => setBellOpen((prev) => !prev)}
                  className="text-gray-500 hover:text-gray-800 relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Ver alertas operativas pendientes"
                >
                  <Bell className="w-5 h-5" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                </button>

                {/* Dropdown de la Campana */}
                {bellOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Alertas del Sistema
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                      {pendingAlerts.length === 0 ? (
                        <div className="p-6 text-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                          <p className="text-xs font-medium text-gray-700">
                            Todo en orden
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            No hay alertas operativas pendientes.
                          </p>
                        </div>
                      ) : (
                        pendingAlerts.slice(0, 5).map((alerta) => (
                          <Link
                            key={alerta.id}
                            href="/alertas"
                            onClick={() => setBellOpen(false)}
                            className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start gap-2.5">
                              <AlertTriangle
                                className={`w-4 h-4 mt-0.5 shrink-0 ${
                                  alerta.severidad === "high"
                                    ? "text-red-500"
                                    : "text-amber-500"
                                }`}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-gray-800 truncate">
                                  {alerta.titulo}
                                </p>
                                <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                  <span className="font-mono font-semibold text-gray-700">
                                    {alerta.dispositivo}
                                  </span>{" "}
                                  • {alerta.ubicacion}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>

                    <Link
                      href="/alertas"
                      onClick={() => setBellOpen(false)}
                      className="block px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-center text-xs font-semibold text-agrogreen-600 border-t border-gray-100 flex items-center justify-center gap-1"
                    >
                      Ir al Centro de Alertas
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</div>
        </main>
      </body>
    </html>
  );
}