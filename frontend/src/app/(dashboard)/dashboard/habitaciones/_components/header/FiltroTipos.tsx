// src/app/(dashboard)/dashboard/habitaciones/_components/header/FiltroTipos.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  tipos: { id: string; nombre: string }[];
}

export function FiltroTipos({ tipos }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const tipoActual = searchParams.get("tipo") || "todos";

  const handleTipoChange = (id: string) => {
    // Si el valor no cambió, no hacemos nada
    if (tipoActual === id) return;

    const params = new URLSearchParams(searchParams.toString());
    if (id === "todos") {
      params.delete("tipo");
    } else {
      params.set("tipo", id);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Función para poner bonita la letra (Doble Superior en vez de DOBLE_SUPERIOR)
  const formatText = (text: string) => 
    text.toLowerCase().split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className={`w-full md:w-64 transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
      <Select value={tipoActual} onValueChange={handleTipoChange} disabled={isPending}>
        <SelectTrigger className="h-11 rounded-2xl bg-slate-50 border-none font-bold text-[10px] uppercase tracking-[0.15em] text-slate-500 focus:ring-2 focus:ring-slate-900/10 transition-all">
          <SelectValue placeholder="FILTRAR POR TIPO" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl border-slate-100 shadow-xl overflow-hidden">
          <SelectItem value="todos" className="text-[10px] font-black uppercase tracking-widest focus:bg-slate-900 focus:text-white transition-colors">
            🏨 Todos los tipos
          </SelectItem>
          {tipos.map((tipo) => (
            <SelectItem 
              key={tipo.id} 
              value={tipo.id} 
              className="text-[10px] font-black uppercase tracking-widest focus:bg-slate-900 focus:text-white transition-colors"
            >
              {formatText(tipo.nombre)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}