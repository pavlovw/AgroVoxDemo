# AgroVox Dashboard - Fase 1 (Front-End)

Interfaz de monitoreo para la red de nodos IoT del proyecto AgroVox. Desarrollado con Next.js, Tailwind CSS y Lucide Icons.

---

## Guía rápida para el equipo (Cómo levantar el proyecto en tu PC)

Sigue estos pasos exactamente en este orden para evitar errores de dependencias o rutas.

### Paso 1: Descargar los últimos cambios
Abre una terminal en tu computador, ve a la carpeta donde sueles guardar tus proyectos y clona el repositorio (si ya lo tienes, solo haz `git pull origin main`):
\`\`\`bash
git clone https://github.com/Marraquetaxd/AgroVox.git
\`\`\`

### Paso 2: Abrir la carpeta correcta en VS Code (IMPORTANTE)
No abras la carpeta raíz del repositorio completo. Debes abrir específicamente la carpeta del proyecto Next.js para que la terminal y las extensiones funcionen bien.
1. Abre **Visual Studio Code**.
2. Ve a **Archivo > Abrir Carpeta...** (File > Open Folder...).
3. Navega hasta: `AgroVox / Fase 1 / Front-End / agrovox-dashboard` y selecciona esa última carpeta (`agrovox-dashboard`).

### Paso 3: Instalar las dependencias
1. En VS Code, abre la terminal integrada (puedes presionar `` Ctrl + ` `` o ir arriba a **Ver > Terminal**).
2. Asegúrate de que la ruta en la terminal termine en `.../agrovox-dashboard`.
3. Ejecuta el siguiente comando para instalar todas las librerías exactas (React, Leaflet, Tailwind, etc.):
\`\`\`bash
npm install
\`\`\`
*(Esto puede tardar un par de minutos dependiendo de tu internet).*

### Paso 4: Levantar el servidor local
Una vez que termine la instalación, arranca el entorno de desarrollo con:
\`\`\`bash
npm run dev
\`\`\`

### Paso 5: Ver el Dashboard
Abre tu navegador web favorito (Chrome, Edge, Brave) y entra a:
*[http://localhost:3000](http://localhost:3000)**

---

## Estructura principal para guiarse
- `src/app/page.tsx`: Es el Dashboard principal (la vista macro).
- `src/app/clientes/[id]/page.tsx`: Es la vista de detalle por cliente/fundo.
- `src/components/`: Aquí están los mapas y componentes reutilizables
