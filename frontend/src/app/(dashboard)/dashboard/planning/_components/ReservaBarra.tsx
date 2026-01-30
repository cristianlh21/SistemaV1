/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/dashboard/planning/_components/ReservaBarra.tsx
"use client";

import { differenceInDays, isBefore, isAfter, startOfDay } from "date-fns";

interface Props {
  reserva: any;
  dias: Date[];
  inicioMes: Date;
  finMes: Date;
}

export function ReservaBarra({ reserva, inicioMes, finMes }: Props) {
  const ANCHO_CELDA = 45;

  // 1. Ajustar fechas al rango visible (Recorte o Clipping)
  // Si la reserva empezó antes del mes, empezamos en el día 1.
  const fechaInicioReal = isBefore(reserva.fechaEntrada, inicioMes) 
    ? inicioMes 
    : startOfDay(reserva.fechaEntrada);

  // Si la reserva termina después del mes, terminamos en el último día.
  const fechaFinReal = isAfter(reserva.fechaSalida, finMes) 
    ? finMes 
    : startOfDay(reserva.fechaSalida);

  // 2. Calcular posición (Left)
  // ¿Cuántos días hay desde el inicio del mes hasta que empieza esta reserva?
  const offsetDias = differenceInDays(fechaInicioReal, inicioMes);
  const left = offsetDias * ANCHO_CELDA;

  // 3. Calcular ancho (Width)
  // ¿Cuántos días dura la reserva dentro de este mes? 
  // Sumamos 1 para que ocupe el bloque completo del día de salida si es necesario.
  const duracionDias = differenceInDays(fechaFinReal, fechaInicioReal) + 1;
  const width = duracionDias * ANCHO_CELDA;

  // 4. Colores según estado (Usando tu paleta)
  const ESTILOS = {
    OCUPADA: "bg-blue-600 border-blue-700 text-white",
    RESERVADA: "bg-emerald-500 border-emerald-600 text-white",
    CHECKOUT: "bg-slate-400 border-slate-500 text-white",
    DEFAULT: "bg-indigo-500 border-indigo-600 text-white"
  };

  const colorClase = ESTILOS[reserva.estado as keyof typeof ESTILOS] || ESTILOS.DEFAULT;

  return (
    <div
      className={`absolute h-8 top-1/2 -translate-y-1/2 rounded-lg border shadow-sm flex items-center px-3 z-10 cursor-pointer hover:brightness-110 transition-all select-none overflow-hidden whitespace-nowrap ${colorClase}`}
      style={{ 
        left: `${left}px`, 
        width: `${width - 4}px`, // Dejamos 4px de "aire" entre reservas pegadas
        marginLeft: '2px' 
      }}
      title={`${reserva.titular.nombre} ${reserva.titular.apellido}`}
    >
      <span className="text-[9px] font-black uppercase tracking-tighter truncate">
        {reserva.titular.apellido}
      </span>
    </div>
  );
}