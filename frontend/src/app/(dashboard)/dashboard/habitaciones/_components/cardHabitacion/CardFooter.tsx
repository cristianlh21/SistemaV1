// src/app/(dashboard)/dashboard/habitaciones/_components/cardHabitacion/CardFooter.tsx
import { Settings } from "lucide-react";
import Link from "next/link";
import { EstadoLimpiezaToggle } from "../EstadoLimpiezaToggle";
import { EstadoMantenimientoToggle } from "../EstadoMantenimientoToggle";
import { HabitacionDashboard } from "../../types";

export function CardFooter({ habitacion }: { habitacion: HabitacionDashboard }) {
  return (
    <div className="w-full grid grid-cols-3 border-t border-slate-100 bg-slate-50/50 mt-auto">
      <div className="flex justify-center items-center py-4 border-r border-slate-100 hover:bg-white transition-colors cursor-pointer group">
        <EstadoLimpiezaToggle 
          habitacionId={habitacion.id} 
          estadoActual={habitacion.estadoLimpieza} 
          variant="icon" 
        />
      </div>
      <div className="flex justify-center items-center py-4 border-r border-slate-100 hover:bg-white transition-colors cursor-pointer group">
        <EstadoMantenimientoToggle 
          habitacionId={habitacion.id} 
          enMantenimiento={habitacion.mantenimiento} 
          variant="icon" 
        />
      </div>
      <div className="flex justify-center items-center py-4 hover:bg-white transition-colors cursor-pointer group text-slate-300 hover:text-slate-600">
        <Link href={`/dashboard/habitaciones/${habitacion.id}/settings`} className="flex items-center justify-center w-full h-full">
          <Settings className="w-4 h-4 transition-transform group-hover:rotate-45" />
        </Link>
      </div>
    </div>
  );
}