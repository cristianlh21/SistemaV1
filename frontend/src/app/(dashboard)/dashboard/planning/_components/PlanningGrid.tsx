/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/dashboard/planning/_components/PlanningGrid.tsx
"use client";

import { eachDayOfInterval, format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { HabitacionRow } from "./HabitacionRow";

export function PlanningGrid({ habitaciones, inicio, fin }: any) {
  const dias = eachDayOfInterval({ start: inicio, end: fin });

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      {/* IMPORTANTE: Agregamos max-h para que el scroll vertical ocurra AQUÍ 
         y no en toda la página. 
      */}
      <div className="overflow-auto no-scrollbar max-h-[calc(100vh-250px)]">
        <div 
          className="grid" 
          style={{ 
            gridTemplateColumns: `160px repeat(${dias.length}, 45px)`,
            minWidth: `${160 + (dias.length * 45)}px` 
          }}
        >
          
          {/* ESQUINA SUPERIOR IZQUIERDA ("Habitación")
             z-40: El más alto para que nada pase por encima.
             sticky top-0 left-0: Fijo en ambos ejes.
          */}
          <div className="h-20 bg-slate-50 border-b border-slate-100 sticky top-0 left-0 z-40 flex items-center px-6 font-black text-[10px] uppercase text-slate-400 tracking-widest">
            Habitación
          </div>

          {/* CABECERA DE DÍAS
             sticky top-0: Fijo al bajar.
             z-30: Por encima de las habitaciones pero por debajo de la esquina.
          */}
          {dias.map((dia) => (
            <div 
              key={dia.toISOString()}
              className={`h-20 border-b border-l border-slate-100 sticky top-0 z-30 flex flex-col items-center justify-center
                ${isToday(dia) ? "bg-blue-100/80" : "bg-slate-50"}
              `}
            >
              <span className="text-[10px] font-black uppercase text-slate-400">
                {format(dia, "EEE", { locale: es })}
              </span>
              <span className={`text-sm font-black ${isToday(dia) ? "text-blue-600" : "text-slate-800"}`}>
                {format(dia, "dd")}
              </span>
            </div>
          ))}

          {/* FILAS DE HABITACIONES */}
          {habitaciones.map((hab: any) => (
            <HabitacionRow 
              key={hab.id} 
              habitacion={hab} 
              dias={dias} 
              inicioMes={inicio} 
              finMes={fin} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}