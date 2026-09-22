"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

const crearIconoNodo = (estado: string) => L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div class="relative flex h-5 w-5 items-center justify-center">
           ${estado?.toLowerCase() === 'alerta' ? '<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>' : ''}
           <span class="relative inline-flex h-3 w-3 rounded-full ${estado?.toLowerCase() === 'alerta' ? 'bg-red-500' : 'bg-agrogreen-500'} shadow-lg border border-white z-10"></span>
         </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const iconoGateway = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div class="relative flex h-8 w-8 items-center justify-center">
           <span class="relative inline-flex h-4 w-4 rounded-full bg-blue-500 shadow-lg border-2 border-white z-10"></span>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const iconoHuerfano = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div class="relative flex h-5 w-5 items-center justify-center cursor-pointer">
           <span class="absolute inline-flex h-full w-full animate-pulse rounded-full bg-red-400 opacity-50"></span>
           <span class="relative inline-flex h-3 w-3 rounded-full bg-gray-400 shadow-lg border-2 border-red-500 z-10"></span>
         </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function AutoCentrar({ datos }: { datos: any }) {
  const map = useMap();
  useEffect(() => {
    if (datos?.sectores?.length > 0) {
      const coords = typeof datos.sectores[0].coordenadas === 'string' ? JSON.parse(datos.sectores[0].coordenadas) : datos.sectores[0].coordenadas;
      if (coords && coords.length > 0) map.flyTo(coords[0], 16, { duration: 1.5 });
    } else if (datos?.latitud && datos?.longitud) {
      map.flyTo([datos.latitud, datos.longitud], 15);
    }
  }, [datos, map]);
  return null;
}

export default function MapaTopografico({ 
  datosMapa, 
  sectoresSeleccionados = [],
  nodoEnAsignacion,
  onIniciarAsignacion,
  onSectorClick,
  onAsignarGateway
}: { 
  datosMapa: any, 
  sectoresSeleccionados?: number[],
  nodoEnAsignacion?: any,
  onIniciarAsignacion?: (nodo: any) => void,
  onSectorClick?: (sectorId: number) => void,
  onAsignarGateway?: (gatewayId: string) => void
}) {

  const parseCoords = (coords: any) => {
    if (!coords) return [];
    return typeof coords === 'string' ? JSON.parse(coords) : coords;
  };

  if (!datosMapa) return <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-500 animate-pulse">Cargando topografía de red...</div>;

  const todosLosNodos = datosMapa?.sectores?.flatMap((sector: any) => sector.nodos) || [];
  const centroInicial: [number, number] = [datosMapa?.latitud || -33.73, datosMapa?.longitud || -70.76];

  return (
    <MapContainer key={`mapa-${datosMapa.id}`} center={centroInicial} zoom={14} className="w-full h-full z-0">
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='&copy; Esri' />
      <AutoCentrar datos={datosMapa} />

      {datosMapa?.infraestructuras?.map((infra: any) => (
        <Polygon key={`infra-${infra.id}`} positions={parseCoords(infra.coordenadas)} pathOptions={{ color: infra.color || '#9ca3af', fillColor: infra.color || '#9ca3af', fillOpacity: 0.6, weight: 2 }} >
          <Popup className="font-sans"><span className="font-bold text-gray-800">{infra.nombre}</span><br/><span className="text-xs text-gray-500">Tipo: {infra.tipo}</span></Popup>
        </Polygon>
      ))}

      {/* LOS SECTORES AHORA ESCUCHAN CLICS PARA ASIGNAR */}
      {datosMapa?.sectores?.map((sector: any) => {
        const isSelected = sectoresSeleccionados.includes(sector.id);
        const colorPoligono = isSelected ? '#ef4444' : sector.color;

        return (
          <Polygon 
            key={`sector-${sector.id}`} 
            positions={parseCoords(sector.coordenadas)} 
            eventHandlers={{
              click: () => {
                // Si hay un nodo esperando ser asignado, el clic en el polígono dispara la función
                if (nodoEnAsignacion && onSectorClick) {
                  onSectorClick(sector.id);
                }
              }
            }}
            pathOptions={{ 
              color: colorPoligono, 
              fillColor: colorPoligono, 
              // Si estamos en modo asignación, resaltamos un poco los polígonos
              fillOpacity: isSelected ? 0.6 : (nodoEnAsignacion ? 0.4 : 0.25), 
              weight: isSelected ? 3 : 2 
            }} 
          >
            <Popup className="font-sans">
              <span className="font-bold text-gray-800">{sector.nombre}</span><br/>
              Cultivo: {sector.cultivo}
            </Popup>
          </Polygon>
        );
      })}

      {datosMapa?.gateways?.map((gw: any) => (
        <Marker key={gw.id} position={[gw.latitud, gw.longitud]} icon={iconoGateway}>
          <Popup className="rounded-lg"><span className="font-bold text-blue-600">{gw.nombre}</span><br/>Estado: {gw.estado}</Popup>
        </Marker>
      ))}

      {todosLosNodos.map((nodo: any) => (
        <Marker key={nodo.id} position={[nodo.latitud, nodo.longitud]} icon={crearIconoNodo(nodo.estado)}>
          <Popup className="rounded-lg"><span className={`font-bold ${nodo.estado === 'ALERTA' ? 'text-red-600' : 'text-gray-900'}`}>{nodo.id}</span></Popup>
        </Marker>
      ))}

      {/* NODOS HUÉRFANOS CON BOTÓN VINCULAR */}
      {datosMapa?.nodosHuerfanos?.map((nodo: any) => (
        <Marker key={`huerfano-${nodo.id}`} position={[nodo.latitud, nodo.longitud]} icon={iconoHuerfano}>
          <Popup className="rounded-lg min-w-[120px]">
            <div className="flex flex-col gap-2 pb-1">
              <span className="font-bold text-red-600">{nodo.id}</span>
              <button 
                onClick={() => onIniciarAsignacion && onIniciarAsignacion(nodo)}
                className="bg-agrogreen-600 hover:bg-agrogreen-700 text-white px-2 py-1.5 rounded-md text-xs font-bold transition-colors text-center shadow-sm"
              >
                Vincular a Sector
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* GATEWAYS HUÉRFANOS CON BOTÓN VINCULAR */}
      {datosMapa?.gatewaysHuerfanos?.map((gw: any) => (
        <Marker key={`gw-huerfano-${gw.id}`} position={[gw.latitud, gw.longitud]} icon={iconoHuerfano}>
          <Popup className="rounded-lg min-w-[120px]">
            <div className="flex flex-col gap-2 pb-1">
              <span className="font-bold text-red-600">{gw.id}</span>
              <span className="text-xs text-gray-500 text-center leading-tight">Antena Detectada</span>
              <button 
                onClick={() => onAsignarGateway && onAsignarGateway(gw.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded-md text-xs font-bold transition-colors text-center shadow-sm mt-1"
              >
                Vincular a Fundo
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}