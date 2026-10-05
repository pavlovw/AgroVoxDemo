"use client";

import React, { useState, useEffect, use } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  ArrowLeft, Activity, List, Settings, AlertTriangle, CheckCircle2, Upload, 
  Map as MapIcon, Router as RouterIcon, Cpu, ChevronDown, ChevronUp, Trash2, X,
  Sprout, FileText, Phone, Mail, User, MapPin, Plus, Edit3, Check
} from "lucide-react";

const URL_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const MapaTopografico = dynamic(() => import("@/components/clientes/MapaTopografico"), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-gray-50 flex items-center justify-center">Cargando...</div> 
});

interface ClientePageProps { params: Promise<{ id: string }>; }

export default function ClienteDetalle({ params }: ClientePageProps) {
  const { id: clienteIdStr } = use(params);
  const clienteId = parseInt(clienteIdStr);
  
  const [activeTab, setActiveTab] = useState<'resumen' | 'inventario' | 'administrativo'>('inventario');
  const [cliente, setCliente] = useState<any>(null);

  // Estados Acordeones
  const [isGatewaysOpen, setIsGatewaysOpen] = useState(true);
  const [isSectoresOpen, setIsSectoresOpen] = useState(true);
  const [isNodosOpen, setIsNodosOpen] = useState(true);

  // Estados Herramientas
  const [sectoresSeleccionados, setSectoresSeleccionados] = useState<number[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [eliminandoSectores, setEliminandoSectores] = useState(false);
  const [importandoMapa, setImportandoMapa] = useState(false);
  
  const [nodoEnAsignacion, setNodoEnAsignacion] = useState<any>(null);

  // Estados para Dibujar Polígonos y Sigla Automática
  const [modoDibujo, setModoDibujo] = useState(false);
  const [puntosDibujo, setPuntosDibujo] = useState<[number, number][]>([]);
  const [modalGuardarPoligono, setModalGuardarPoligono] = useState(false);
  
  // Sigla del cliente (ej: PCBUIN)
  const [siglaCliente, setSiglaCliente] = useState("");
  const [editandoSiglaEnModal, setEditandoSiglaEnModal] = useState(false);
  const [modalCambiarSiglaGlobal, setModalCambiarSiglaGlobal] = useState(false);
  const [nuevaSiglaGlobal, setNuevaSiglaGlobal] = useState("");

  const [nuevoPoligonoData, setNuevoPoligonoData] = useState({
    esInfraestructura: false,
    nombreInfra: '',
    cultivo: 'Cerezos' as 'Cerezos' | 'Paltos',
    tipoInfra: 'CASETA',
    color: '#22c55e'
  });

  useEffect(() => { cargarDatos(); }, [clienteId]);

  const cargarDatos = () => {
    fetch(`${URL_BACKEND}/api/mapa/cliente/${clienteId}`)
      .then(res => res.json())
      .then(data => { 
        if (!data.error) { 
          setCliente(data); 
          setSectoresSeleccionados([]); 
          
          // Extraemos la sigla existente si ya hay algún sector con formato SIGLA_SECTOR_001
          if (data.sectores && data.sectores.length > 0) {
            const sectorConFormato = data.sectores.find((s: any) => s.nombre.includes('_SECTOR_'));
            if (sectorConFormato) {
              const siglaDetectada = sectorConFormato.nombre.split('_SECTOR_')[0];
              setSiglaCliente(siglaDetectada);
            }
          } else {
            setSiglaCliente("");
          }
        }
      })
      .catch(err => console.error("Error obteniendo cliente:", err));
  };

  // Calcula el próximo número correlativo (ej: "001", "002") basándose en los sectores actuales
  const obtenerSiguienteNumeroSector = () => {
    const listaSectores = cliente?.sectores || [];
    if (listaSectores.length === 0) return "001";

    let maxNum = 0;
    listaSectores.forEach((s: any) => {
      const match = s.nombre.match(/_SECTOR_(\d+)$/i) || s.nombre.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });

    const siguiente = maxNum > 0 ? maxNum + 1 : listaSectores.length + 1;
    return String(siguiente).padStart(3, '0');
  };

  // Detector de teclas Enter y Escape para el Modo Dibujo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!modoDibujo || modalGuardarPoligono) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        if (puntosDibujo.length >= 3) {
          setEditandoSiglaEnModal(false);
          setModalGuardarPoligono(true);
        } else {
          alert("Debes marcar al menos 3 puntos en el mapa para formar un polígono.");
        }
      } else if (e.key === 'Escape') {
        setModoDibujo(false);
        setPuntosDibujo([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modoDibujo, puntosDibujo, modalGuardarPoligono]);

  const handleImportarMapa = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportandoMapa(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const response = await fetch(`${URL_BACKEND}/api/mapa/cliente/${clienteId}/importar`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(JSON.parse(e.target?.result as string))
        });
        if (response.ok) { alert("¡Polígonos importados con éxito!"); cargarDatos(); } 
      } catch (error) { alert("El archivo no es un JSON válido."); } 
      finally { setImportandoMapa(false); event.target.value = ''; }
    };
    reader.readAsText(file);
  };

  const toggleSectorSelection = (id: number) => {
    setSectoresSeleccionados(prev => prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]);
  };

  const confirmarEliminacionSectores = async () => {
    setEliminandoSectores(true);
    try {
      const response = await fetch(`${URL_BACKEND}/api/mapa/sectores`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sectorIds: sectoresSeleccionados })
      });
      if (response.ok) {
        setIsDeleteModalOpen(false); setDeleteConfirmationText(""); cargarDatos();
      }
    } catch (error) { alert("Error de conexión con el servidor"); } 
    finally { setEliminandoSectores(false); }
  };

  const vincularNodoASector = async (sectorId: number) => {
    if (!nodoEnAsignacion) return;
    try {
      const response = await fetch(`${URL_BACKEND}/api/mapa/nodos/${nodoEnAsignacion.id}/asignar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectorId })
      });
      if (response.ok) {
        setNodoEnAsignacion(null);
        cargarDatos();
      }
    } catch (error) {
      console.error("Error al asignar:", error);
    }
  };

  const vincularGateway = async (gatewayId: string) => {
    try {
      const response = await fetch(`${URL_BACKEND}/api/mapa/gateways/${gatewayId}/asignar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId })
      });
      if (response.ok) {
        cargarDatos();
      }
    } catch (error) {
      console.error("Error al asignar gateway:", error);
    }
  };

  // Guarda el polígono recién dibujado (y si cambiaste la sigla, actualiza todos los anteriores)
  const guardarPoligonoDibujado = async (e: React.FormEvent) => {
    e.preventDefault();
    const siglaLimpia = siglaCliente.trim().toUpperCase();

    if (!nuevoPoligonoData.esInfraestructura && !siglaLimpia) {
      alert("Por favor ingresa las siglas del cliente (Ej: PCBUIN)");
      return;
    }

    try {
      const numCorrelativo = obtenerSiguienteNumeroSector();
      const nombreFinalSector = `${siglaLimpia}_SECTOR_${numCorrelativo}`;

      // Cerramos el polígono repitiendo el primer punto al final para mantener estándar limpio
      const coordenadasCerradas = [...puntosDibujo, puntosDibujo[0]];

      const payload = nuevoPoligonoData.esInfraestructura
        ? {
            infraestructuras: [{
              nombre: nuevoPoligonoData.nombreInfra,
              tipo: nuevoPoligonoData.tipoInfra,
              coordenadas: coordenadasCerradas,
              color: nuevoPoligonoData.color
            }]
          }
        : {
            sectores: [{
              nombre: nombreFinalSector,
              cultivo: nuevoPoligonoData.cultivo,
              coordenadas: coordenadasCerradas,
              color: nuevoPoligonoData.color
            }]
          };

      // Si el usuario editó la sigla en el modal y ya habían sectores antes, actualizamos todos
      if (!nuevoPoligonoData.esInfraestructura && editandoSiglaEnModal && (cliente?.sectores?.length || 0) > 0) {
        await fetch(`${URL_BACKEND}/api/mapa/cliente/${clienteId}/sigla`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nuevaSigla: siglaLimpia })
        });
      }

      const response = await fetch(`${URL_BACKEND}/api/mapa/cliente/${clienteId}/importar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setModalGuardarPoligono(false);
        setModoDibujo(false);
        setPuntosDibujo([]);
        setEditandoSiglaEnModal(false);
        setNuevoPoligonoData({ esInfraestructura: false, nombreInfra: '', cultivo: 'Cerezos', tipoInfra: 'CASETA', color: '#22c55e' });
        cargarDatos();
      } else {
        alert("Error al guardar el polígono");
      }
    } catch (error) {
      console.error("Error guardando polígono:", error);
    }
  };

  // Actualiza la sigla de TODOS los sectores ya creados cuando el usuario la edita
  const actualizarSiglaEnTodosLosSectores = async (e: React.FormEvent) => {
    e.preventDefault();
    const siglaLimpia = nuevaSiglaGlobal.trim().toUpperCase();
    if (!siglaLimpia) return;

    try {
      const response = await fetch(`${URL_BACKEND}/api/mapa/cliente/${clienteId}/sigla`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevaSigla: siglaLimpia })
      });

      if (response.ok) {
        setSiglaCliente(siglaLimpia);
        setModalCambiarSiglaGlobal(false);
        cargarDatos();
      } else {
        alert("No se pudo actualizar la sigla en el servidor.");
      }
    } catch (error) {
      console.error("Error actualizando siglas:", error);
    }
  };

  const sectores = cliente?.sectores || [];
  const gateways = cliente?.gateways || [];
  const nodosAsignados = sectores.flatMap((s: any) => s.nodos.map((n: any) => ({ ...n, sectorNombre: s.nombre })));
  const nodosAlerta = nodosAsignados.filter((n: any) => n.estado === 'ALERTA');
  const gatewaysActivos = gateways.filter((gw: any) => gw.estado === 'ACTIVO').length;
  const esPrimerSector = sectores.length === 0;
  const proximoNumeroStr = obtenerSiguienteNumeroSector();

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-2rem)] relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clientes" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold text-gray-900">{cliente?.nombre || 'Cargando...'}</h1><p className="text-sm text-gray-500">ID Cliente: CLI-{clienteId}</p></div>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${gatewaysActivos > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <span className={`w-2 h-2 rounded-full ${gatewaysActivos > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>{gatewaysActivos} Gateway(s) Online
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[600px]">
        
        {/* MAPA CON ALERTAS FLOTANTES */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">

          {/* Cartel flotante cuando estás dibujando */}
          {modoDibujo && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900 text-white px-5 py-3 rounded-full shadow-2xl border border-yellow-500/50 flex items-center gap-4">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
              <p className="text-xs sm:text-sm font-medium">
                Haz clic en el mapa ({puntosDibujo.length} pts). Presiona <kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-yellow-400 font-bold">Enter</kbd> para terminar.
              </p>
              {puntosDibujo.length > 0 && (
                <button 
                  onClick={() => setPuntosDibujo(prev => prev.slice(0, -1))}
                  className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-gray-300"
                >
                  Deshacer pto
                </button>
              )}
              <button 
                onClick={() => { setModoDibujo(false); setPuntosDibujo([]); }} 
                className="bg-slate-800 p-1 rounded-full hover:bg-slate-700"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>
          )}

          {/* Cartel flotante cuando estás asignando un nodo */}
          {nodoEnAsignacion && !modoDibujo && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900 text-white px-5 py-3 rounded-full shadow-2xl border border-slate-700 flex items-center gap-4 animate-in slide-in-from-top-4">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agrogreen-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-agrogreen-500"></span>
              </span>
              <p className="text-sm font-medium">Asignando nodo <span className="font-bold text-agrogreen-400">{nodoEnAsignacion.id}</span>. Haz clic en un polígono.</p>
              <button onClick={() => setNodoEnAsignacion(null)} className="ml-2 bg-slate-800 p-1 rounded-full hover:bg-slate-700 transition-colors">
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>
          )}

          <MapaTopografico 
            datosMapa={cliente} 
            sectoresSeleccionados={sectoresSeleccionados}
            nodoEnAsignacion={nodoEnAsignacion}
            onIniciarAsignacion={(nodo) => { setModoDibujo(false); setNodoEnAsignacion(nodo); }}
            onSectorClick={vincularNodoASector}
            onAsignarGateway={vincularGateway}
            modoDibujo={modoDibujo}
            puntosDibujo={puntosDibujo}
            onAgregarPunto={(coords) => setPuntosDibujo(prev => [...prev, coords])}
          />
        </div>

        {/* Panel Lateral */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="flex border-b border-gray-100 shrink-0">
            {['resumen', 'inventario', 'administrativo'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-4 text-sm font-medium border-b-2 flex justify-center items-center gap-2 transition-colors capitalize ${activeTab === tab ? 'border-agrogreen-500 text-agrogreen-700 bg-agrogreen-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                {tab === 'resumen' && <Activity className="w-4 h-4" />}
                {tab === 'inventario' && <List className="w-4 h-4" />}
                {tab === 'administrativo' && <Settings className="w-4 h-4" />}
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
            
            {/* TAB: RESUMEN */}
            {activeTab === 'resumen' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Sprout className="w-4 h-4" /> 
                      <span className="text-xs font-bold uppercase tracking-wider">Sectores</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{sectores.length}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Cpu className="w-4 h-4" /> 
                      <span className="text-xs font-bold uppercase tracking-wider">Nodos Activos</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{nodosAsignados.length}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Estado Operativo</p>
                  <div className={`p-4 rounded-lg flex items-center gap-4 ${nodosAlerta.length > 0 ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'}`}>
                    <div className={`p-3 rounded-full shrink-0 ${nodosAlerta.length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {nodosAlerta.length > 0 ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${nodosAlerta.length > 0 ? 'text-red-700' : 'text-green-700'}`}>
                        {nodosAlerta.length > 0 ? `${nodosAlerta.length} Alerta(s) Detectada(s)` : 'Funcionamiento Óptimo'}
                      </p>
                      <p className={`text-xs mt-1 ${nodosAlerta.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {nodosAlerta.length > 0 ? 'Se requiere atención en los sectores marcados en el mapa.' : 'Todos los parámetros dentro del rango normal. Red estable.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INVENTARIO */}
            {activeTab === 'inventario' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <button onClick={() => setIsGatewaysOpen(!isGatewaysOpen)} className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2"><RouterIcon className="w-4 h-4 text-blue-500" /> Gateways ({gateways.length})</h3>
                    {isGatewaysOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {isGatewaysOpen && (
                    <div className="p-4 space-y-3">
                      {gateways.map((gw: any) => (
                        <div key={gw.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 flex justify-between items-center">
                          <div><p className="font-bold text-gray-800 text-sm">{gw.nombre || gw.id}</p><p className="text-xs text-gray-500">Antena Principal</p></div>
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">ACTIVO</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <button onClick={() => setIsSectoresOpen(!isSectoresOpen)} className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2"><MapIcon className="w-4 h-4 text-agrogreen-500" /> Sectores ({sectores.length})</h3>
                    {isSectoresOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {isSectoresOpen && (
                    <div className="p-4">
                      {/* BARRA DE HERRAMIENTAS DE SECTORES */}
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                        <div className="flex items-center gap-1.5">
                          {sectoresSeleccionados.length > 0 && (
                            <button onClick={() => { setDeleteConfirmationText(""); setIsDeleteModalOpen(true); }} className="text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1 border border-red-100">
                              <Trash2 className="w-3.5 h-3.5" /> Eliminar ({sectoresSeleccionados.length})
                            </button>
                          )}
                          {sectores.length > 0 && (
                            <button
                              type="button"
                              onClick={() => { setNuevaSiglaGlobal(siglaCliente); setModalCambiarSiglaGlobal(true); }}
                              className="text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1 border border-gray-200"
                              title="Cambiar la sigla de todos los sectores"
                            >
                              <Edit3 className="w-3 h-3" /> Sigla: <span className="font-mono font-bold">{siglaCliente || '---'}</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => { setNodoEnAsignacion(null); setModoDibujo(true); setPuntosDibujo([]); }}
                            className="text-xs font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> Dibujar
                          </button>
                          <label className={`text-xs font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer border ${importandoMapa ? 'bg-gray-100 text-gray-400' : 'bg-agrogreen-50 text-agrogreen-600 hover:bg-agrogreen-100 border-agrogreen-200'}`}>
                            <Upload className="w-3.5 h-3.5" /> {importandoMapa ? 'Subiendo...' : 'Importar JSON'}
                            <input type="file" accept=".json" className="hidden" onChange={handleImportarMapa} disabled={importandoMapa} />
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {sectores.map((sec: any) => {
                          const isSelected = sectoresSeleccionados.includes(sec.id);
                          return (
                            <div key={sec.id} onClick={() => toggleSectorSelection(sec.id)} className={`p-3 border rounded-lg text-center cursor-pointer transition-all ${isSelected ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                              <p className="font-bold text-xs font-mono text-gray-800 truncate" title={sec.nombre}>{sec.nombre}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{sec.cultivo}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <button onClick={() => setIsNodosOpen(!isNodosOpen)} className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2"><Cpu className="w-4 h-4 text-purple-500" /> Nodos ({nodosAsignados.length})</h3>
                    {isNodosOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  {isNodosOpen && (
                    <div className="p-4 space-y-2">
                      {nodosAsignados.length === 0 && <p className="text-sm text-gray-400 italic text-center py-2">No hay nodos operando. Selecciona un nodo huérfano en el mapa para vincularlo.</p>}
                      {nodosAsignados.map((nodo: any) => (
                        <div key={nodo.id} className={`p-3 rounded-lg border ${nodo.estado === 'ALERTA' ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'} flex justify-between items-center`}>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{nodo.id}</p>
                            <p className="text-xs text-gray-500">{nodo.sectorNombre}</p>
                          </div>
                          <span className={`p-1.5 rounded-full ${nodo.estado === 'ALERTA' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-green-100 text-green-700'}`}>
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB: ADMINISTRATIVO */}
            {activeTab === 'administrativo' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" /> Facturación y Contacto
                    </h3>
                    <button onClick={() => alert("Módulo de edición en desarrollo")} className="text-xs font-medium text-agrogreen-600 hover:text-agrogreen-700 hover:underline">
                      Editar
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FileText className="w-3 h-3"/> RUT</p>
                        <p className="text-sm font-medium text-gray-900">{cliente?.rut || 'No registrado'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Phone className="w-3 h-3"/> Teléfono</p>
                        <p className="text-sm font-medium text-gray-900">{cliente?.telefono || 'No registrado'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Mail className="w-3 h-3"/> Correo Electrónico</p>
                      <p className="text-sm font-medium text-gray-900">{cliente?.email || 'No registrado'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" /> Centro Geográfico
                    </h3>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Latitud</p>
                      <p className="text-sm font-mono text-gray-900 bg-gray-50 py-1 px-2 rounded-md border border-gray-100 inline-block">
                        {cliente?.latitud || 'Sin dato'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Longitud</p>
                      <p className="text-sm font-mono text-gray-900 bg-gray-50 py-1 px-2 rounded-md border border-gray-100 inline-block">
                        {cliente?.longitud || 'Sin dato'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL PARA ELIMINAR SECTORES */}
      {isDeleteModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <h3 className="text-lg font-bold text-red-900">Eliminar Sectores</h3>
            <p className="text-sm text-gray-600">Escribe BORRAR para confirmar:</p>
            <input type="text" value={deleteConfirmationText} onChange={(e) => setDeleteConfirmationText(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="BORRAR" />
            <div className="pt-4 flex justify-end gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={confirmarEliminacionSectores} disabled={deleteConfirmationText !== 'BORRAR' || eliminandoSectores} className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50">
                {eliminandoSectores ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA CAMBIAR LA SIGLA DE TODOS LOS SECTORES EXISTENTES */}
      {modalCambiarSiglaGlobal && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={actualizarSiglaEnTodosLosSectores} className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900">Cambiar Sigla del Cliente</h3>
            <p className="text-xs text-gray-500">
              Al cambiar esta sigla, se actualizarán automáticamente todos los <b>{sectores.length} sectores</b> de este cliente manteniendo su numeración.
            </p>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Nueva Sigla</label>
              <div className="flex items-center mt-1">
                <input
                  type="text"
                  required
                  placeholder="Ej: PCBUIN"
                  value={nuevaSiglaGlobal}
                  onChange={(e) => setNuevaSiglaGlobal(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  className="w-full px-3 py-2 border rounded-l-lg text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-agrogreen-500"
                />
                <span className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 rounded-r-lg text-sm font-mono text-gray-600 shrink-0">
                  _SECTOR_00X
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setModalCambiarSiglaGlobal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 text-sm font-bold bg-agrogreen-600 hover:bg-agrogreen-700 text-white rounded-lg">
                Actualizar Todos
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL PARA GUARDAR EL POLÍGONO RECIÉN DIBUJADO (Se abre al presionar Enter) */}
      {modalGuardarPoligono && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={guardarPoligonoDibujado} className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900">Definir Polígono ({puntosDibujo.length} vértices)</h3>
            
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setNuevoPoligonoData({ ...nuevoPoligonoData, esInfraestructura: false, color: '#22c55e' })}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${!nuevoPoligonoData.esInfraestructura ? 'bg-white shadow text-agrogreen-600' : 'text-gray-500'}`}
              >
                Sector de Cultivo
              </button>
              <button
                type="button"
                onClick={() => setNuevoPoligonoData({ ...nuevoPoligonoData, esInfraestructura: true, color: '#0284c7' })}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${nuevoPoligonoData.esInfraestructura ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
              >
                Infraestructura
              </button>
            </div>

            {!nuevoPoligonoData.esInfraestructura ? (
              <>
                {/* ID AUTOMÁTICO DEL SECTOR: SIGLA_SECTOR_00X */}
                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-600 uppercase">ID del Sector (Automático)</label>
                    {!esPrimerSector && !editandoSiglaEnModal && (
                      <button
                        type="button"
                        onClick={() => setEditandoSiglaEnModal(true)}
                        className="text-xs text-agrogreen-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Edit3 className="w-3 h-3" /> Cambiar sigla en todos
                      </button>
                    )}
                  </div>

                  {esPrimerSector || editandoSiglaEnModal ? (
                    <div className="mt-1">
                      <div className="flex items-center">
                        <input
                          type="text"
                          required
                          placeholder="SIGLA (Ej: PCBUIN)"
                          value={siglaCliente}
                          onChange={(e) => setSiglaCliente(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-l-lg text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-agrogreen-500"
                        />
                        <span className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 rounded-r-lg text-sm font-mono font-bold text-gray-700 shrink-0">
                          _SECTOR_{proximoNumeroStr}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {esPrimerSector 
                          ? "Define las siglas para este primer sector. Los siguientes se numerarán solos." 
                          : "Al guardar, esta nueva sigla también actualizará los sectores anteriores."}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-1 px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg font-mono font-bold text-sm text-gray-800 flex justify-between items-center">
                      <span>{siglaCliente}_SECTOR_{proximoNumeroStr}</span>
                      <span className="text-[10px] bg-agrogreen-100 text-agrogreen-700 px-2 py-0.5 rounded font-sans font-semibold">
                        Autogenerado
                      </span>
                    </div>
                  )}
                </div>

                {/* CHECKBOX ÚNICO DE CULTIVO: CEREZOS O PALTOS */}
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase block mb-2">Cultivo *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['Cerezos', 'Paltos'] as const).map((opcion) => {
                      const seleccionado = nuevoPoligonoData.cultivo === opcion;
                      return (
                        <label
                          key={opcion}
                          onClick={() => setNuevoPoligonoData({ ...nuevoPoligonoData, cultivo: opcion })}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            seleccionado 
                              ? 'border-agrogreen-500 bg-agrogreen-50/60 text-agrogreen-900 font-bold' 
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                            seleccionado ? 'bg-agrogreen-600 border-agrogreen-600 text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {seleccionado && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-sm">{opcion}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Nombre de Infraestructura *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Caseta de Riego Principal"
                    value={nuevoPoligonoData.nombreInfra}
                    onChange={(e) => setNuevoPoligonoData({ ...nuevoPoligonoData, nombreInfra: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agrogreen-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Tipo de Infraestructura</label>
                  <select
                    value={nuevoPoligonoData.tipoInfra}
                    onChange={(e) => setNuevoPoligonoData({ ...nuevoPoligonoData, tipoInfra: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agrogreen-500"
                  >
                    <option value="CASETA">Caseta de Riego</option>
                    <option value="BODEGA">Bodega / Galpón</option>
                    <option value="CASA">Centro de Control / Casa</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Color en el Mapa</label>
              <input
                type="color"
                value={nuevoPoligonoData.color}
                onChange={(e) => setNuevoPoligonoData({ ...nuevoPoligonoData, color: e.target.value })}
                className="w-full mt-1 h-9 rounded cursor-pointer border border-gray-200 p-0.5"
              />
            </div>

            <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setModalGuardarPoligono(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Seguir editando
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-bold bg-agrogreen-600 hover:bg-agrogreen-700 text-white rounded-lg transition-colors shadow-sm"
              >
                Guardar en Mapa
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}