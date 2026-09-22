(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/clientes/MapaTopografico.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MapaTopografico
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/MapContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/TileLayer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Marker.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Popup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Popup.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polygon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Polygon.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/socket.io-client/build/esm/index.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const socket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["io"])('http://localhost:3001');
const crearIconoNodo = (estado)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].divIcon({
        className: 'custom-leaflet-icon',
        html: `<div class="relative flex h-5 w-5 items-center justify-center">
           ${estado?.toLowerCase() === 'alerta' ? '<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>' : ''}
           <span class="relative inline-flex h-3 w-3 rounded-full ${estado?.toLowerCase() === 'alerta' ? 'bg-red-500' : 'bg-agrogreen-500'} shadow-lg border border-white z-10"></span>
         </div>`,
        iconSize: [
            20,
            20
        ],
        iconAnchor: [
            10,
            10
        ]
    });
const iconoGateway = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].divIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="relative flex h-8 w-8 items-center justify-center">
           <span class="relative inline-flex h-4 w-4 rounded-full bg-blue-500 shadow-lg border-2 border-white z-10"></span>
         </div>`,
    iconSize: [
        32,
        32
    ],
    iconAnchor: [
        16,
        16
    ]
});
function MapaTopografico({ clienteId = 1 }) {
    _s();
    const centro = [
        -33.7347105121274,
        -70.76633205905223
    ];
    const [datosMapa, setDatosMapa] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [cargando, setCargando] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [errorApi, setErrorApi] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null); // Nuevo estado para manejar errores
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapaTopografico.useEffect": ()=>{
            // Usamos el clienteId dinámico
            fetch(`http://localhost:3001/api/mapa/cliente/${clienteId}`).then({
                "MapaTopografico.useEffect": (res)=>res.json()
            }["MapaTopografico.useEffect"]).then({
                "MapaTopografico.useEffect": (data)=>{
                    if (data.error) {
                        setErrorApi(data.error);
                    } else {
                        setDatosMapa(data);
                    }
                    setCargando(false);
                }
            }["MapaTopografico.useEffect"]).catch({
                "MapaTopografico.useEffect": (err)=>{
                    console.error('Error cargando el mapa:', err);
                    setErrorApi('Error de conexión con el servidor');
                    setCargando(false);
                }
            }["MapaTopografico.useEffect"]);
            socket.on('alerta_nodo', {
                "MapaTopografico.useEffect": (alerta)=>{
                    setDatosMapa({
                        "MapaTopografico.useEffect": (prevDatos)=>{
                            if (!prevDatos || !prevDatos.sectores) return prevDatos;
                            const nuevosSectores = prevDatos.sectores.map({
                                "MapaTopografico.useEffect.nuevosSectores": (sector)=>({
                                        ...sector,
                                        nodos: sector.nodos.map({
                                            "MapaTopografico.useEffect.nuevosSectores": (nodo)=>nodo.id === alerta.nodoId ? {
                                                    ...nodo,
                                                    estado: 'ALERTA'
                                                } : nodo
                                        }["MapaTopografico.useEffect.nuevosSectores"])
                                    })
                            }["MapaTopografico.useEffect.nuevosSectores"]);
                            return {
                                ...prevDatos,
                                sectores: nuevosSectores
                            };
                        }
                    }["MapaTopografico.useEffect"]);
                }
            }["MapaTopografico.useEffect"]);
            return ({
                "MapaTopografico.useEffect": ()=>{
                    socket.off('alerta_nodo');
                }
            })["MapaTopografico.useEffect"];
        }
    }["MapaTopografico.useEffect"], [
        clienteId
    ]);
    if (cargando) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex h-full w-full items-center justify-center bg-gray-50 text-gray-500",
            children: "Cargando infraestructura agrícola..."
        }, void 0, false, {
            fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
            lineNumber: 77,
            columnNumber: 12
        }, this);
    }
    if (errorApi || !datosMapa) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex h-full w-full flex-col items-center justify-center bg-red-50 text-red-500 p-4 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "font-bold text-lg",
                    children: "No se pudo cargar el mapa"
                }, void 0, false, {
                    fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
                    lineNumber: 83,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: errorApi
                }, void 0, false, {
                    fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm mt-2 text-gray-500",
                    children: "Asegúrate de que el ID del cliente sea el correcto en la URL."
                }, void 0, false, {
                    fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
                    lineNumber: 85,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
            lineNumber: 82,
            columnNumber: 7
        }, this);
    }
    // Agregamos el operador "?." (Optional Chaining) para que nunca más explote si falta un dato
    const todosLosNodos = datosMapa.sectores?.flatMap((sector)=>sector.nodos) || [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MapContainer"], {
        center: centro,
        zoom: 15,
        className: "w-full h-full z-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TileLayer"], {
                url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                attribution: "© Esri"
            }, void 0, false, {
                fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this),
            datosMapa.infraestructuras?.map((infra)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polygon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polygon"], {
                    positions: infra.coordenadas,
                    pathOptions: {
                        color: infra.color,
                        fillColor: infra.color,
                        fillOpacity: 0.4,
                        weight: 2
                    }
                }, `infra-${infra.id}`, false, {
                    fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
                    lineNumber: 101,
                    columnNumber: 9
                }, this)),
            datosMapa.sectores?.map((sector)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polygon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polygon"], {
                    positions: sector.coordenadas,
                    pathOptions: {
                        color: sector.color,
                        fillColor: sector.color,
                        fillOpacity: 0.2,
                        weight: 2
                    }
                }, `sector-${sector.id}`, false, {
                    fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
                    lineNumber: 105,
                    columnNumber: 9
                }, this)),
            datosMapa.gateways?.map((gw)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                    position: [
                        gw.latitud,
                        gw.longitud
                    ],
                    icon: iconoGateway,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Popup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Popup"], {
                        className: "rounded-lg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-bold text-blue-600",
                                children: gw.nombre
                            }, void 0, false, {
                                fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
                                lineNumber: 111,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
                                lineNumber: 111,
                                columnNumber: 73
                            }, this),
                            "Estado: ",
                            gw.estado
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
                        lineNumber: 110,
                        columnNumber: 11
                    }, this)
                }, gw.id, false, {
                    fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
                    lineNumber: 109,
                    columnNumber: 9
                }, this)),
            todosLosNodos.map((nodo)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                    position: [
                        nodo.latitud,
                        nodo.longitud
                    ],
                    icon: crearIconoNodo(nodo.estado),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Popup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Popup"], {
                        className: "rounded-lg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `font-bold ${nodo.estado === 'ALERTA' ? 'text-red-600' : 'text-gray-900'}`,
                                children: [
                                    nodo.id,
                                    " ",
                                    nodo.estado === 'ALERTA' && '(Alerta)'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
                                lineNumber: 120,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
                                lineNumber: 122,
                                columnNumber: 20
                            }, this),
                            "Gateway Enlace: ",
                            nodo.gatewayId,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
                                lineNumber: 123,
                                columnNumber: 45
                            }, this),
                            nodo.estado === 'ALERTA' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-red-500",
                                children: "Cavitación Detectada"
                            }, void 0, false, {
                                fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
                                lineNumber: 124,
                                columnNumber: 42
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
                        lineNumber: 119,
                        columnNumber: 11
                    }, this)
                }, nodo.id, false, {
                    fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
                    lineNumber: 118,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/clientes/MapaTopografico.tsx",
        lineNumber: 94,
        columnNumber: 5
    }, this);
}
_s(MapaTopografico, "UZAJi+xJszkOPqJLLfnMYsffn2g=");
_c = MapaTopografico;
var _c;
__turbopack_context__.k.register(_c, "MapaTopografico");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/clientes/MapaTopografico.tsx [app-client] (ecmascript, next/dynamic entry)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/clientes/MapaTopografico.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_components_clientes_MapaTopografico_tsx_1ad7s-2._.js.map