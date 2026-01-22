// src/app/(dashboard)/dashboard/habitaciones/_components/HabitacionCardHeader.tsx
import { Limpieza, Ocupacion } from "@prisma/client";

interface Props {
  numero: string;
  estadoOcupacion: Ocupacion;
  estadoLimpieza: Limpieza;
  mantenimiento: boolean;
}

export function HabitacionCardHeader({ numero, estadoOcupacion, estadoLimpieza, mantenimiento }: Props) {
  const isOcupada = estadoOcupacion === "OCUPADA";
  
  // Lógica de colores basada en tu propuesta
  let mainColor = "text-slate-900"; // Vacante
  let labelOcupacionColor = "text-slate-400";

  if (mantenimiento) {
    mainColor = "text-rose-600";
  } else if (isOcupada) {
    mainColor = "text-blue-600";
    labelOcupacionColor = "text-blue-600";
  }

  return (
    <div className="flex flex-col items-center justify-center pt-4 pb-2">
      {/* Etiqueta de Ocupación arriba del número */}
      <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${labelOcupacionColor}`}>
        {estadoOcupacion}
      </span>

      {/* Número de Habitación */}
      <h2 className={`text-6xl font-black tracking-tighter ${mainColor} transition-colors duration-300 leading-none`}>
        {numero}
      </h2>

      {/* Estado de Limpieza debajo */}
      <div className="flex flex-col items-center mt-2">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${
          estadoLimpieza === 'LIMPIA' ? 'text-emerald-600' : 'text-rose-500'
        }`}>
          {estadoLimpieza === 'LIMPIA' ? '● Limpia' : '● Sucia'}
        </span>

        {mantenimiento && (
          <span className="text-[9px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full mt-1 border border-rose-100">
            MANTENIMIENTO
          </span>
        )}
      </div>
    </div>
  );
}