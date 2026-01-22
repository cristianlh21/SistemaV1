// src/app/(dashboard)/dashboard/reservas/_components/reservaWizard/atoms/TarifarioLateral.tsx
"use client";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils"; // Para manejar clases condicionales

interface TarifarioProps {
  tipos: any[];
  filtroActual: string; // Nueva prop para saber qué resaltar
}

export function TarifarioLateral({ tipos, filtroActual }: TarifarioProps) {
  return (
    <div className="w-full lg:w-64 flex flex-col shrink-0">
      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">
        Tarifas Vigentes
      </Label>
      <div className="space-y-3">
        {tipos.length > 0 ? (
          tipos.map((tipo) => {
            const estaResaltado = filtroActual === tipo.id;
            
            return (
              <div 
                key={tipo.id} 
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-300 shadow-sm flex flex-col group",
                  estaResaltado 
                    ? "bg-primary border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                    : "bg-slate-50/50 border-slate-100 hover:border-primary/30 hover:bg-white"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-tighter transition-colors",
                    estaResaltado ? "text-white/80" : "text-slate-400 group-hover:text-primary"
                  )}>
                    {tipo.nombre}
                  </span>
                  {estaResaltado && (
                    <Badge className="text-[8px] h-4 bg-white/20 text-white border-none hover:bg-white/30 uppercase font-black">
                      Seleccionado
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-xs font-bold", estaResaltado ? "text-white/60" : "text-slate-400")}>$</span>
                  <span className={cn(
                    "font-black text-2xl tracking-tighter transition-colors",
                    estaResaltado ? "text-white" : "text-slate-700"
                  )}>
                    {tipo.precio.toLocaleString()}
                  </span>
                  <span className={cn("text-[10px] font-bold italic", estaResaltado ? "text-white/60" : "text-slate-400")}>
                    /noche
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] p-6 text-center text-slate-400">
            <p className="text-[9px] italic uppercase font-black">Seleccione fechas</p>
          </div>
        )}
      </div>
    </div>
  );
}