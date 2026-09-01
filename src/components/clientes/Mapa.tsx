"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Función para crear pines personalizados usando clases de Tailwind (sin depender de imágenes locales)
const createIcon = (estado: string) => {
  const colorClass = estado === 'alerta' ? 'bg-red-500' : 'bg-agrogreen-500';
  const pingClass = estado === 'alerta' 
    ? '<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>' 
    : '';

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="relative flex h-6 w-6 items-center justify-center">
             ${pingClass}
             <span class="relative inline-flex h-4 w-4 rounded-full ${colorClass} shadow-lg border-2 border-white z-10"></span>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Componente invisible que escucha los cambios y hace "zoom animado" al cliente seleccionado
function ControladorVuelo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function Mapa({ clientes, clienteActivo }: { clientes: any[], clienteActivo: any }) {
  // Centro inicial del mapa para la vista general
  const centroGeneral: [number, number] = [-34.2, -70.9];

  return (
    <MapContainer center={centroGeneral} zoom={8} className="w-full h-full rounded-xl z-0">
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap'
      />
      {clientes.map((cli) => (
        <Marker key={cli.id} position={cli.coords} icon={createIcon(cli.estado)}>
          <Popup className="rounded-lg font-sans">
            <p className="font-bold text-gray-800 m-0">{cli.nombre}</p>
            <p className="text-sm text-gray-500 m-0">{cli.ubicacion}</p>
          </Popup>
        </Marker>
      ))}
      {clienteActivo && <ControladorVuelo center={clienteActivo.coords} />}
    </MapContainer>
  );
}