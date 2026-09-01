// src/types/index.ts

// Representa el estado físico y de red de un equipo en terreno
export interface Nodo {
  id: string;             // ej. "AGV-001"
  fundo: string;          // ej. "Parcela Experimental"
  sector: string;         // ej. "Sector 3 - Cerezos"
  estado: "online" | "offline" | "mantenimiento";
  voltajeBateria: number; // Voltaje de la LiFePO4 (ej. 3.2V)
  nivelBateria: number;   // Porcentaje 0-100%
  rssi: number;           // Calidad de señal LoRa en dBm (ej. -85)
  ultimaConexion: string; // Timestamp ISO (ej. "2026-08-29T16:00:00Z")
}

// Representa el paquete de datos ligero que envía el modelo TinyML
export interface Telemetria {
  nodoId: string;
  timestamp: string;
  asfixiaDetectada: boolean; // El output booleano del modelo Edge AI
}

// Representa los eventos críticos que se mostrarán en el dashboard y WhatsApp
export interface Alerta {
  id: string;
  nodoId: string;
  tipo: "asfixia" | "bateria_baja" | "desconexion_lora";
  mensaje: string;
  fecha: string;
  notificadoWhatsApp: boolean; // Para auditar si el agricultor recibió el mensaje
  resuelta: boolean;
}