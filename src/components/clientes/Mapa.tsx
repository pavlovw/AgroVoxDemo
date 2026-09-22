"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Función para crear pines personalizados (Sin cambios, está perfecta)
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

function ControladorVuelo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function Mapa({ clientes, clienteActivo }: { clientes: any[], clienteActivo: any }) {
  const centroGeneral: [number, number] = [-34.2, -70.9];

  return (
    <MapContainer center={centroGeneral} zoom={8} className="w-full h-full rounded-xl z-0">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {clientes.map((cli) => {
        // 1. Verificamos si algún nodo de cualquier sector está en 'ALERTA'
        const enAlerta = cli.sectores?.some((sector: any) => 
          sector.nodos?.some((nodo: any) => nodo.estado === 'ALERTA')
        );
        const estado = enAlerta ? 'alerta' : 'ok';
        
        // 2. Usamos la coordenada del cliente, si no hay, la del Gateway, y si no, por defecto
        const lat = cli.latitud || cli.gateways?.[0]?.latitud || centroGeneral[0];
        const lng = cli.longitud || cli.gateways?.[0]?.longitud || centroGeneral[1];

        return (
          <Marker key={cli.id} position={[lat, lng]} icon={createIcon(estado)}>
            <Popup className="rounded-lg font-sans">
              <p className="font-bold text-gray-800 m-0">{cli.nombre}</p>
              <p className="text-sm text-gray-500 m-0">{cli.email || 'Sin correo registrado'}</p>
              <p className="text-xs text-blue-500 mt-1">{cli.gateways?.length || 0} Gateways activos</p>
            </Popup>
          </Marker>
        );
      })}

      {/* 3. Controlador de vuelo arreglado para enfocar al cliente activo tenga o no tenga antena */}
      {clienteActivo && (
        <ControladorVuelo center={[
          clienteActivo.latitud || clienteActivo.gateways?.[0]?.latitud || centroGeneral[0],
          clienteActivo.longitud || clienteActivo.gateways?.[0]?.longitud || centroGeneral[1]
        ]} />
      )}
    </MapContainer>
  );
}