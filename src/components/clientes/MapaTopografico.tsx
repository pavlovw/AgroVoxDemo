"use client";

import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icono para Nodos
const crearIconoNodo = (estado: string) => L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div class="relative flex h-5 w-5 items-center justify-center">
           ${estado === 'alerta' ? '<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>' : ''}
           <span class="relative inline-flex h-3 w-3 rounded-full ${estado === 'alerta' ? 'bg-red-500' : 'bg-agrogreen-500'} shadow-lg border border-white z-10"></span>
         </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Icono para el Gateway (Antena Central)
const iconoGateway = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div class="relative flex h-8 w-8 items-center justify-center">
           <span class="relative inline-flex h-4 w-4 rounded-full bg-blue-500 shadow-lg border-2 border-white z-10"></span>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Coordenadas simuladas del polígono de riego (Sector 1)
const coordenadasSector: [number, number][] = [
  [-33.734715, -70.767818],
  [-33.735538, -70.765005],
  [-33.734799, -70.764691],
  [-33.734096729045724, -70.76718793525508],
];

export default function MapaTopografico() {
  const centro: [number, number] = [-33.7347105121274, -70.76633205905223];

  return (
    <MapContainer center={centro} zoom={16} className="w-full h-full z-0">
      {/* Capa Satelital de Esri */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      />
      
      {/* Polígono del Sector de Riego */}
      <Polygon 
        positions={coordenadasSector} 
        pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.2, weight: 2 }} 
      />

      {/* Gateway Principal */}
      <Marker position={[-33.73510941037542, -70.76456741699839]} icon={iconoGateway}>
        <Popup className="rounded-lg"><span className="font-bold text-blue-600">Gateway LoRa Central</span><br/>Caseta de Riego</Popup>
      </Marker>

      {/* Nodos IoT */}
      <Marker position={[-33.73449823408805, -70.76705114261524]} icon={crearIconoNodo('ok')}>
        <Popup className="rounded-lg"><span className="font-bold">AGV-010</span><br/>Batería: 98%</Popup>
      </Marker>
      <Marker position={[-33.734944348595555, -70.76552764785242]} icon={crearIconoNodo('alerta')}>
        <Popup className="rounded-lg"><span className="font-bold text-red-600">AGV-011 (Alerta)</span><br/>Cavitación Detectada</Popup>
      </Marker>
    </MapContainer>
  );
}
