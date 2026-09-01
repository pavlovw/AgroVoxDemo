"use client";

import { Inter } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Leaf, LineChart, Users, Cpu, Bell, Settings, Menu, Search } from "lucide-react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Función para inyectar las clases CSS correctas dependiendo de la URL activa
  const getNavItemClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors ${
      isActive 
        ? 'bg-agrogreen-600 text-white' 
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;
  };

  return (
    <html lang="es">
      <body className={`${inter.className} flex h-screen overflow-hidden`}>
          {/* Sidebar */}
          <aside className={`${sidebarOpen ? 'absolute z-50 h-full shadow-2xl' : 'hidden'} md:flex bg-agrodark text-gray-300 w-64 flex-shrink-0 flex-col transition-all duration-300`}>
            <div className="h-16 flex items-center px-6 border-b border-gray-800">
              <div className="flex items-center gap-3 text-white font-bold text-xl tracking-wide">
                <div className="w-8 h-8 rounded-lg bg-agrogreen-500 flex items-center justify-center text-white">
                  <Leaf className="w-5 h-5" />
                </div>
                AgroVox<span className="text-gray-400 font-light text-sm">Admin</span>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1 px-3">
                <li>
                  <Link href="/" className={getNavItemClass("/")}>
                    <LineChart className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link href="/clientes" className={getNavItemClass("/clientes")}>
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Clientes</span>
                  </Link>
                </li>
                <li>
                  <Link href="/red" className={getNavItemClass("/red")}>
                    <Cpu className="w-5 h-5" />
                    <span className="font-medium">Nodos IoT</span>
                  </Link>
                </li>
                <li>
                  <Link href="/alertas" className={getNavItemClass("/alertas")}>
                    <Bell className="w-5 h-5" />
                    <span className="font-medium">Alertas del Sistema</span>
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">3</span>
                  </Link>
                </li>
                <li>
                  <Link href="/configuracion" className={getNavItemClass("/configuracion")}>
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Configuración</span>
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-agrogreen-600 flex items-center justify-center font-bold text-white text-sm">
                  PV
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Pablo Vargas</p>
                  <p className="text-xs text-gray-400">Administrador</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8 z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-gray-500 hover:text-gray-700">
                  <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">Monitoreo de Red IoT</h1>
              </div>
              <div className="flex items-center gap-5">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" placeholder="Buscar nodo, cliente..." className="pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-agrogreen-500 focus:ring-2 focus:ring-agrogreen-200 outline-none w-64 transition-all" />
                </div>

                <button className="text-gray-400 hover:text-gray-600 relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </header>

            {/* Page Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-8">
              {children}
            </div>
          </main>
      </body>
    </html>
  );
}
