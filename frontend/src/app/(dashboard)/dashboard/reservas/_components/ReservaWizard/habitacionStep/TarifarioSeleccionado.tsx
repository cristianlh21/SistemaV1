// src/app/(dashboard)/dashboard/reservas/_components/reservaWizard/atoms/TarifarioSeleccionado.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { TipoHabitacion } from "@prisma/client";
import { Info } from "lucide-react";

interface TarifarioSeleccionadoProps {
  // Usamos el tipo de Prisma pero lo hacemos opcional por si el filtro es nulo
  tipo: TipoHabitacion | null | undefined; 
}

export function TarifarioSeleccionado({ tipo }: TarifarioSeleccionadoProps) {
  // 1. Verificación de nulidad: Si no hay tipo, no renderizamos nada
  if (!tipo) return null;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border-2 border-primary bg-primary/5 p-6 shadow-lg shadow-primary/5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-white font-black uppercase text-[9px] px-3">Tarifa Seleccionada</Badge>
            <span className="text-xs font-black uppercase tracking-tighter text-slate-500">{tipo.nombre}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Info className="w-3 h-3" /> Precio pactado por noche para esta configuración
          </p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary">$</span>
          <span className="text-5xl font-black tracking-tighter text-primary">
            {tipo.precio.toLocaleString()}
          </span>
          <span className="text-sm font-bold text-primary/60 italic">AR$ / noche</span>
        </div>
      </div>
    </div>
  );
}