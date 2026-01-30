// src/app/(dashboard)/dashboard/habitaciones/_components/header/HeaderHabitaciones.tsx

import { BuscadorHuespedes } from "./BuscadorHuespedes";
import { FiltroEstados } from "./FiltroEstados";
import { FiltroTipos } from "./FiltroTipos";

// 1. Definimos las interfaces aquí mismo
interface TipoHabitacionSimplificado {
  id: string;
  nombre: string;
}

interface RoomStats {
  TOTAL: number;
  LIBRE: number;
  OCUPADA: number;
  SUCIA: number;
  MANTENIMIENTO: number;
}

interface Props {
  tipos: TipoHabitacionSimplificado[]; // <-- Adiós any[]
  stats: RoomStats;                    // <-- Adiós any
}

export function HeaderHabitaciones({ tipos, stats }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* SECCIÓN SUPERIOR: Título y Buscador */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase leading-none">
            Habitaciones
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Estado actual del inventario
          </p>
        </div>

        <div className="w-full lg:max-w-md">
          <BuscadorHuespedes />
        </div>
      </div>

      {/* SECCIÓN INFERIOR: Barra de filtros inteligente */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-[2.5rem] shadow-sm border border-slate-100/50">
        <FiltroEstados stats={stats} />
        <FiltroTipos tipos={tipos} />
      </div>
    </div>
  );
}