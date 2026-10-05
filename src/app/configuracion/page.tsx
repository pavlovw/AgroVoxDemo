"use client";

import { useState, useEffect, useCallback } from "react";
import ThresholdsForm, { type Thresholds } from "@/components/configuracion/ThresholdsForm";
import NotificationDirectory, {
  type ContactItem,
  type ClienteOption,
} from "@/components/configuracion/NotificationDirectory";

const URL_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function ConfiguracionPage() {
  const [umbrales, setUmbrales] = useState<Thresholds | null>(null);
  const [contactos, setContactos] = useState<ContactItem[]>([]);
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarConfiguracion = useCallback(async () => {
    try {
      const res = await fetch(`${URL_BACKEND}/api/configuracion`);
      if (res.ok) {
        const data = await res.json();
        setUmbrales(data.umbrales);
        setContactos(data.contactos || []);
        setClientes(data.clientes || []);
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarConfiguracion();
  }, [cargarConfiguracion]);

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-gray-400 animate-pulse">
        Cargando parámetros operativos y directorio desde PostgreSQL...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <ThresholdsForm
        initialData={umbrales}
        onSaved={(nuevos) => setUmbrales(nuevos)}
      />

      <NotificationDirectory
        contacts={contactos}
        clientes={clientes}
        onRefresh={cargarConfiguracion}
      />
    </div>
  );
}