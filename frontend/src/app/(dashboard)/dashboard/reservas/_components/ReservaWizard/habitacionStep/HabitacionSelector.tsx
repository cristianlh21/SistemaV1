// src/app/(dashboard)/dashboard/reservas/_components/reservaWizard/HabitacionSelector.tsx
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle } from "lucide-react";
import { HabitacionDisponible } from "../../../_actions";

interface HabitacionSelectorProps {
  habitaciones: HabitacionDisponible[];
  selectedId: string;
  tipoVendidoId?: string; // El ID del tipo que el cliente contrató
  onSelect: (hab: HabitacionDisponible) => void;
}

export function HabitacionSelector({ habitaciones, selectedId, tipoVendidoId, onSelect }: HabitacionSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {habitaciones.map((hab) => {
        const isSelected = selectedId === hab.id;
        // Lógica de Alerta: Si la habitación física tiene más capacidad que lo vendido
        const isUpgrade = tipoVendidoId && hab.tipoBaseId !== tipoVendidoId;

        return (
          <button
            key={hab.id}
            type="button"
            onClick={() => onSelect(hab)}
            className={cn(
              "relative p-4 rounded-xl border-2 text-left transition-all duration-200 group flex flex-col justify-between min-h-27.5",
              isSelected 
                ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
                : isUpgrade 
                  ? "border-amber-200 bg-amber-50/30 hover:border-amber-400" 
                  : "border-slate-100 hover:border-slate-200 bg-white"
            )}
          >
            <div className="flex justify-between items-start">
              <span className={cn(
                "text-2xl font-black tracking-tighter",
                isSelected ? "text-primary" : "text-slate-800"
              )}>
                {hab.numero}
              </span>
              {isUpgrade && (
                <ArrowUpCircle className="w-4 h-4 text-amber-500 animate-bounce" />
              )}
            </div>
            
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase truncate">
                {hab.tipoBase.nombre}
              </p>
              <Badge 
                variant={isSelected ? "default" : "secondary"} 
                className="mt-1 text-[8px] font-black uppercase tracking-tighter"
              >
                Cap. {hab.tipoBase.capacidad}
              </Badge>
            </div>
          </button>
        );
      })}
    </div>
  );
}