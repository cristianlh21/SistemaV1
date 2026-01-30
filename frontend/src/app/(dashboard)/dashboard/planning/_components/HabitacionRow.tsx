/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/dashboard/planning/_components/HabitacionRow.tsx
"use client";

import { ReservaBarra } from "./ReservaBarra";

export function HabitacionRow({ habitacion, dias, inicioMes, finMes }: any) {
  return (
    <>
      {/* 1. Celda de la Habitación (Ocupa 1 columna) */}
      <div className="h-20 border-b border-slate-100 bg-white flex items-center px-6 shadow-[10px_0_15px_-10px_rgba(0,0,0,0.1)] sticky left-0 z-20">
        <div className="flex flex-col">
          <span className="text-sm font-black text-slate-900 leading-none">
            {habitacion.numero}
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-1 truncate max-w-30">
            {habitacion.tipoActual.nombre.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* 2. Contenedor de la Línea de Tiempo (DEBE OCUPAR TODAS LAS COLUMNAS RESTANTES) */}
      <div 
        className="relative h-20 border-b border-slate-100 flex items-center"
        style={{ gridColumn: `span ${dias.length}` }} // <--- ESTO ARREGLA TODO
      >
        {/* Fondo: Dibujamos las divisiones de los días */}
        {dias.map((dia: Date) => (
          <div 
            key={dia.toISOString()} 
            className="min-w-11.25 h-full border-l border-slate-50/50 pointer-events-none" 
          />
        ))}

        {/* Las barras de reserva ahora flotan sobre el ancho total correcto */}
        {habitacion.reservas.map((reserva: any) => (
          <ReservaBarra 
            key={reserva.id} 
            reserva={reserva} 
            dias={dias} 
            inicioMes={inicioMes}
            finMes={finMes}
          />
        ))}
      </div>
    </>
  );
}