"use client";

import ThresholdsForm from "@/components/configuracion/ThresholdsForm";
import NotificationDirectory from "@/components/configuracion/NotificationDirectory";

export default function ConfiguracionPage() {
  return (
    <>
      <ThresholdsForm />
      <NotificationDirectory />
    </>
  );
}