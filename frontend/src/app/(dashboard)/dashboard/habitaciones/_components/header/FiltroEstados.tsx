// src/app/(dashboard)/dashboard/habitaciones/_components/header/FiltroEstados.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { FiltroEstado } from "../../types";

interface Props {
  stats: {
    TOTAL: number;
    LIBRE: number;
    OCUPADA: number;
    SUCIA: number;
    MANTENIMIENTO: number;
  };
}

export function FiltroEstados({ stats }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Obtenemos el estado actual directamente de la URL
  const estadoActual = (searchParams.get("estado") as FiltroEstado) || "TODAS";

  const ESTADOS = [
    { id: "TODAS", label: "Todas", count: stats.TOTAL, colorActivo: "bg-slate-900 text-white", colorBadge: "bg-white/20" },
    { id: "LIBRE", label: "Libres", count: stats.LIBRE, colorActivo: "bg-emerald-600 text-white", colorBadge: "bg-emerald-100 text-emerald-700" },
    { id: "OCUPADA", label: "Ocupadas", count: stats.OCUPADA, colorActivo: "bg-blue-600 text-white", colorBadge: "bg-blue-100 text-blue-700" },
    { id: "SUCIA", label: "Sucias", count: stats.SUCIA, colorActivo: "bg-pink-500 text-white", colorBadge: "bg-pink-100 text-pink-700" },
    { id: "MANTENIMIENTO", label: "Mant.", count: stats.MANTENIMIENTO, colorActivo: "bg-rose-600 text-white", colorBadge: "bg-rose-100 text-rose-700" },
  ];

  const handleFiltro = (id: string) => {
    // Si ya estamos en ese estado, no hacemos nada (esto corta el bucle)
    if (estadoActual === id) return;

    const params = new URLSearchParams(searchParams.toString());
    
    if (id === "TODAS") {
      params.delete("estado");
    } else {
      params.set("estado", id);
    }

    // startTransition le dice a React que no bloquee la UI mientras Next.js navega
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className={`flex items-center gap-3 transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      {ESTADOS.map((e) => {
        const esActivo = estadoActual === e.id;
        return (
          <button
            key={e.id}
            onClick={() => handleFiltro(e.id)}
            disabled={isPending}
            className={`
              group flex items-center gap-3 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all
              ${esActivo 
                ? `${e.colorActivo} ring-2 ring-offset-1 shadow-lg scale-105` 
                : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"}
            `}
          >
            {e.label}
            <span className={`flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[9px] font-black ${esActivo ? e.colorBadge : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"}`}>
              {e.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}