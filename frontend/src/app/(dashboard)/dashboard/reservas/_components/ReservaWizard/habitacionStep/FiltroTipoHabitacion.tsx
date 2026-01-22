// src/app/(dashboard)/dashboard/reservas/_components/reservaWizard/atoms/FiltroTipoHabitacion.tsx
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TipoHabitacion } from "@prisma/client";
import { Loader2, Users } from "lucide-react";

interface FiltroTipoProps {
  tipos: TipoHabitacion[];
  filtroActual: string;
  onChange: (id: string) => void;
  loading: boolean;
}

export function FiltroTipoHabitacion({ tipos, filtroActual, onChange, loading }: FiltroTipoProps) {
  return (
    <div className="space-y-4 border-t border-slate-100 pt-6">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          2. Filtrar por Preferencia
        </Label>
        {loading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={filtroActual === "todos" ? "default" : "outline"} 
          onClick={() => onChange("todos")}
          className={`rounded-full uppercase text-[9px] font-black h-9 px-5 transition-all ${
            filtroActual === "todos" 
            ? "shadow-lg shadow-primary/20" 
            : "hover:bg-slate-50"
          }`}
        >
          Ver Todos
        </Button>

        {tipos.map((tipo) => (
          <Button 
            key={tipo.id}
            variant={filtroActual === tipo.id ? "default" : "outline"}
            onClick={() => onChange(tipo.id)}
            className={`rounded-full uppercase text-[9px] font-black h-9 px-4 gap-2 transition-all ${
              filtroActual === tipo.id 
              ? "shadow-lg shadow-primary/20" 
              : "hover:border-primary/40 hover:bg-primary/2"
            }`}
          >
            {tipo.nombre}
            {/* Agregamos la capacidad como ayuda visual */}
            <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
              filtroActual === tipo.id ? "bg-white/20" : "bg-slate-100 text-slate-500"
            }`}>
              <Users className="w-2.5 h-2.5" />
              <span className="text-[8px]">{tipo.capacidad}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}