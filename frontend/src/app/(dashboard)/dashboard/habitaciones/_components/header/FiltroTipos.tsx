// src/app/(dashboard)/dashboard/habitaciones/_components/header/FiltroTipos.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const tipoActual = searchParams.get("tipo") || "todos";

  const handleTipoChange = (id: string) => {
    const params = new URLSearchParams(searchParams);
    if (id === "todos") params.delete("tipo");
    else params.set("tipo", id);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full md:w-60">
      <Select value={tipoActual} onValueChange={handleTipoChange}>
        <SelectTrigger className="h-10 rounded-2xl bg-slate-50 border-none font-bold text-[10px] uppercase tracking-[0.15em] text-slate-500 focus:ring-2 focus:ring-primary/10">
          <SelectValue placeholder="FILTRAR POR TIPO" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
          <SelectItem value="todos" className="text-[10px] font-bold uppercase tracking-widest">
            Todos los tipos
          </SelectItem>
          {tipos.map((tipo) => (
            <SelectItem 
              key={tipo.id} 
              value={tipo.id} 
              className="text-[10px] font-bold uppercase tracking-widest"
            >
              {tipo.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}