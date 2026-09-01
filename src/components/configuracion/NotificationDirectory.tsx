"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface Contact {
  id: string;
  sector: string;
  role: string;
  phone: string;
}

const initialContacts: Contact[] = [
  { id: "1", sector: "Fundo El Encanto — Sector 3", role: "", phone: "+56 9 xxxx xxxx" },
  { id: "2", sector: "Agrícola San Pedro — General", role: "", phone: "+56 9 xxxx xxxx" },
];

export default function NotificationDirectory() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ sector: "", role: "", phone: "" });

  const handleAdd = () => {
    if (!draft.sector || !draft.phone) return;
    setContacts((c) => [...c, { id: crypto.randomUUID(), ...draft }]);
    setDraft({ sector: "", role: "", phone: "" });
    setAdding(false);
  };

  const handleRemove = (id: string) => {
    setContacts((c) => c.filter((contact) => contact.id !== id));
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Directorio de notificación</h2>
          <p className="text-xs text-gray-500 mt-1">Qué número de WhatsApp recibe las alertas de cada sector.</p>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="text-sm text-agrogreen-600 hover:text-agrogreen-700 font-medium flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      {adding && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-2 items-center">
          <input
            placeholder="Sector / fundo"
            value={draft.sector}
            onChange={(e) => setDraft((d) => ({ ...d, sector: e.target.value }))}
            className="flex-1 min-w-[160px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-agrogreen-500"
          />
          <input
            placeholder="Rol (ej. Capataz)"
            value={draft.role}
            onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
            className="w-36 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-agrogreen-500"
          />
          <input
            placeholder="+56 9 xxxx xxxx"
            value={draft.phone}
            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
            className="w-40 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-agrogreen-500"
          />
          <button
            onClick={handleAdd}
            className="bg-agrogreen-600 hover:bg-agrogreen-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg"
          >
            Guardar
          </button>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {contacts.map((c) => (
          <div key={c.id} className="px-6 py-3.5 flex justify-between items-center group">
            <span className="text-sm text-gray-700">{c.sector}</span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {c.phone} <span className="text-gray-400">({c.role})</span>
              </span>
              <button
                onClick={() => handleRemove(c.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}