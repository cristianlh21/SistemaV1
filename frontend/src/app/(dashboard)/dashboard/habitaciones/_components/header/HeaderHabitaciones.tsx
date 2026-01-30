// src/app/(dashboard)/dashboard/habitaciones/_components/header/HeaderHabitaciones.tsx

import { BuscadorHuespedes } from "./BuscadorHuespedes";
import { FiltroEstados } from "./FiltroEstados";
import { FiltroTipos } from "./FiltroTipos";

interface Props {
  tipos: { id: string; nombre: string }[];
}

export function HeaderHabitaciones({ tipos }: Props) {
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
        <FiltroEstados />
        <FiltroTipos tipos={tipos} />
      </div>
    </div>
  );
}