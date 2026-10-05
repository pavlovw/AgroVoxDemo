"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Send,
  Phone,
  UserCheck,
  Building2,
  CheckCircle2,
  X
} from "lucide-react";

const URL_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export interface ContactItem {
  id: number;
  clienteId?: number | null;
  sectorId?: number | null;
  ubicacionLabel: string;
  nombre?: string | null;
  rol: string;
  telefono: string;
  activo: boolean;
}

export interface ClienteOption {
  id: number;
  nombre: string;
  sectores: { id: number; nombre: string; cultivo?: string }[];
}

export default function NotificationDirectory({
  contacts,
  clientes,
  onRefresh,
}: {
  contacts: ContactItem[];
  clientes: ClienteOption[];
  onRefresh: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Estado del formulario de nuevo contacto
  const [selectedClienteId, setSelectedClienteId] = useState<string>("");
  const [selectedSectorId, setSelectedSectorId] = useState<string>("ALL");
  const [customUbicacion, setCustomUbicacion] = useState("");
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("Capataz de Riego");
  const [telefono, setTelefono] = useState("+56 9 ");

  const clienteSeleccionado = clientes.find(
    (c) => String(c.id) === selectedClienteId
  );

  const handleAdd = async () => {
    let ubicacionFinal = customUbicacion.trim();

    if (clienteSeleccionado) {
      if (selectedSectorId === "ALL") {
        ubicacionFinal = `${clienteSeleccionado.nombre} — General (Todos los sectores)`;
      } else {
        const sec = clienteSeleccionado.sectores.find(
          (s) => String(s.id) === selectedSectorId
        );
        ubicacionFinal = `${clienteSeleccionado.nombre} — ${sec?.nombre || "Sector"}`;
      }
    }

    if (!ubicacionFinal || !telefono.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`${URL_BACKEND}/api/configuracion/contactos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: selectedClienteId ? Number(selectedClienteId) : null,
          sectorId:
            selectedSectorId !== "ALL" && selectedSectorId
              ? Number(selectedSectorId)
              : null,
          ubicacionLabel: ubicacionFinal,
          nombre: nombre.trim() || null,
          rol: rol.trim() || "Encargado de Riego",
          telefono: telefono.trim(),
        }),
      });

      if (res.ok) {
        setAdding(false);
        setSelectedClienteId("");
        setSelectedSectorId("ALL");
        setCustomUbicacion("");
        setNombre("");
        setRol("Capataz de Riego");
        setTelefono("+56 9 ");
        onRefresh();
      }
    } catch (error) {
      console.error("Error guardando contacto:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActivo = async (contact: ContactItem) => {
    try {
      await fetch(`${URL_BACKEND}/api/configuracion/contactos/${contact.id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !contact.activo }),
      });
      onRefresh();
    } catch (error) {
      console.error("Error cambiando estado del contacto:", error);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await fetch(`${URL_BACKEND}/api/configuracion/contactos/${id}`, {
        method: "DELETE",
      });
      onRefresh();
    } catch (error) {
      console.error("Error eliminando contacto:", error);
    }
  };

  const handleTestWhatsApp = async (contact: ContactItem) => {
    setTestingId(contact.id);
    try {
      const res = await fetch(
        `${URL_BACKEND}/api/configuracion/contactos/${contact.id}/probar`,
        { method: "POST" }
      );
      if (res.ok) {
        const data = await res.json();
        setToast(data.mensaje);
        setTimeout(() => setToast(null), 4000);
      }
    } finally {
      setTimeout(() => setTestingId(null), 600);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Cabecera */}
      <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Directorio de notificación WhatsApp
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Define qué números de WhatsApp reciben las alertas de estrés hídrico (cavitación) en cada fundo o sector.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {toast && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {toast}
            </span>
          )}

          <button
            onClick={() => setAdding((v) => !v)}
            className="text-xs bg-agrogreen-600 hover:bg-agrogreen-700 text-white font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            {adding ? (
              <>
                <X className="w-4 h-4" /> Cancelar
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Agregar destinatario
              </>
            )}
          </button>
        </div>
      </div>

      {/* Formulario Desplegable Conectado a Clientes/Sectores Reales */}
      {adding && (
        <div className="p-6 bg-gray-50/80 border-b border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Selector de Cliente Real */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">
                Predio / Cliente
              </label>
              <select
                value={selectedClienteId}
                onChange={(e) => {
                  setSelectedClienteId(e.target.value);
                  setSelectedSectorId("ALL");
                }}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-agrogreen-500"
              >
                <option value="">-- Seleccionar fundo registrado --</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Sector Real (o entrada manual si no eligió cliente) */}
            {selectedClienteId ? (
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">
                  Sector de Riego
                </label>
                <select
                  value={selectedSectorId}
                  onChange={(e) => setSelectedSectorId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-agrogreen-500"
                >
                  <option value="ALL">General (Todos los sectores)</option>
                  {clienteSeleccionado?.sectores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} {s.cultivo ? `(${s.cultivo})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">
                  O escribir Sector / Fundo manualmente
                </label>
                <input
                  placeholder="Ej. Fundo El Encanto — Sector 3"
                  value={customUbicacion}
                  onChange={(e) => setCustomUbicacion(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-agrogreen-500"
                />
              </div>
            )}

            {/* Nombre del Responsable */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">
                Nombre del Contacto
              </label>
              <input
                placeholder="Ej. Roberto Soto"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-agrogreen-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">
                Rol en el Predio
              </label>
              <input
                placeholder="Ej. Capataz / Agrónomo"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-agrogreen-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">
                Número WhatsApp
              </label>
              <input
                placeholder="+56 9 8765 4321"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono outline-none focus:border-agrogreen-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAdd}
                disabled={saving}
                className="w-full md:w-auto bg-agrogreen-600 hover:bg-agrogreen-700 disabled:bg-gray-300 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                {saving ? "Guardando..." : "Guardar en Directorio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Contactos */}
      <div className="divide-y divide-gray-100">
        {contacts.length === 0 ? (
          <div className="py-12 text-center px-4">
            <Phone className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">
              No hay números configurados en el directorio
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Haz clic en "Agregar destinatario" para vincular un número de WhatsApp a un sector de riego.
            </p>
          </div>
        ) : (
          contacts.map((c) => (
            <div
              key={c.id}
              className={`px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 group transition-colors ${
                c.activo ? "hover:bg-gray-50/70" : "bg-gray-50/60 opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {c.ubicacionLabel}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.activo
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {c.activo ? "ACTIVO" : "PAUSADO"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                    {c.nombre && (
                      <span className="flex items-center gap-1 font-medium text-gray-700">
                        <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                        {c.nombre}
                      </span>
                    )}
                    <span className="text-gray-400">Rol: {c.rol}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className="text-xs font-mono font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                  {c.telefono}
                </span>

                {/* Botón de Prueba de WhatsApp */}
                <button
                  onClick={() => handleTestWhatsApp(c)}
                  disabled={testingId === c.id || !c.activo}
                  className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 border border-emerald-200 font-medium px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                  title="Enviar WhatsApp de prueba"
                >
                  <Send className="w-3 h-3" />
                  {testingId === c.id ? "Enviando..." : "Probar"}
                </button>

                {/* Activar / Pausar */}
                <button
                  onClick={() => handleToggleActivo(c)}
                  className="text-xs text-gray-500 hover:text-gray-800 underline"
                >
                  {c.activo ? "Pausar" : "Activar"}
                </button>

                {/* Eliminar */}
                <button
                  onClick={() => handleRemove(c.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  title="Eliminar contacto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}