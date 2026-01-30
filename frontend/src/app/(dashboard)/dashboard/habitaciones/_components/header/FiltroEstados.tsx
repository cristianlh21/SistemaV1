// src/app/(dashboard)/dashboard/habitaciones/_components/header/FiltroEstados.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiltroEstado } from "../../types";

const ESTADOS: { id: FiltroEstado; label: string; color: string }[] = [
  { id: "TODAS", label: "Todas", color: "bg-slate-100 text-slate-600 ring-slate-200" },
  { id: "LIBRE", label: "Libres", color: "bg-emerald-50 text-emerald-600 ring-emerald-200" },
  { id: "OCUPADA", label: "Ocupadas", color: "bg-blue-50 text-blue-600 ring-blue-200" },
  { id: "SUCIA", label: "Sucias", color: "bg-pink-50 text-pink-600 ring-pink-200" }, // Tu rosado suave
  { id: "MANTENIMIENTO", label: "Mantenimiento", color: "bg-rose-50 text-rose-600 ring-rose-200" }, // Tu rojo
];

export function FiltroEstados() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const estadoActual = (searchParams.get("estado") as FiltroEstado) || "TODAS";

  const handleFiltro = (id: FiltroEstado) => {
    const params = new URLSearchParams(searchParams);
    if (id === "TODAS") params.delete("estado");
    else params.set("estado", id);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    /* Añadimos p-1 para que el ring no se corte */
    <div className="flex items-center gap-3 overflow-x-auto p-1.5 no-scrollbar">
      {ESTADOS.map((e) => (
        <button
          key={e.id}
          onClick={() => handleFiltro(e.id)}
          className={`
            px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap
            ${estadoActual === e.id 
              ? `${e.color} ring-2 ring-offset-1 shadow-sm scale-105` 
              : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"}
          `}
        >
          {e.label}
        </button>
      ))}
    </div>
  );
}