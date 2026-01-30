// src/app/(dashboard)/dashboard/habitaciones/_components/cardHabitacion/CardBody.tsx
"use client";

import { HabitacionDashboard, ReservaDashboard } from "../../types";
import { Users, DoorOpen, LogOut, Banknote, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { isToday } from "date-fns";

interface CardBodyProps {
  habitacion: HabitacionDashboard;
  reserva?: ReservaDashboard;
}

export function CardBody({ habitacion, reserva }: CardBodyProps) {
  // 1. Identificación de Escenarios Operativos
  const esSalidaHoy = !!reserva && isToday(new Date(reserva.fechaSalida)) && reserva.estado === "CHECKIN";
  const esEntradaHoy = !!reserva && isToday(new Date(reserva.fechaEntrada)) && reserva.estado !== "CHECKIN";
  const estaOcupada = habitacion.estadoOcupacion === "OCUPADA" && !esSalidaHoy;

  const otrosHuespedes = reserva?.huespedes || [];

  // 2. Destino de navegación si hay reserva
  const hrefReserva = esEntradaHoy 
    ? `/dashboard/reservas/${reserva?.id}/checkin` 
    : esSalidaHoy 
    ? `/dashboard/reservas/${reserva?.id}/checkout` 
    : `/dashboard/reservas/${reserva?.id}`;

  // ESCENARIO A: HABITACIÓN CON RESERVA (Ocupada, Entrada o Salida)
  if (reserva) {
    return (
      <Link href={hrefReserva} className="block transition-all active:scale-95 group/body">
        <div className={`
          flex flex-col gap-3 min-h-26.25 p-4 rounded-[1.5rem] border transition-all
          ${esEntradaHoy ? "bg-[#7c7c7c]/5 border-[#7c7c7c]/20" : 
            esSalidaHoy ? "bg-[#a6527c]/5 border-[#a6527c]/20" : 
            "bg-[#527ca6]/5 border-[#527ca6]/20"}
        `}>
          <div className="space-y-2">
            {/* Etiqueta dinámica según el momento de la reserva */}
            <p className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
              esEntradaHoy ? "text-[#7c7c7c]" : esSalidaHoy ? "text-[#a6527c]" : "text-[#527ca6]"
            }`}>
              {esEntradaHoy ? <DoorOpen className="w-3.5 h-3.5" /> : esSalidaHoy ? <LogOut className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
              {esEntradaHoy ? "Titular Reserva" : esSalidaHoy ? "Salida Hoy" : "Huésped Actual"}
            </p>
            
            <ul className="space-y-1.5">
              {/* Titular Principal */}
              <li className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${esEntradaHoy ? 'bg-[#7c7c7c]' : esSalidaHoy ? 'bg-[#a6527c]' : 'bg-[#527ca6]'}`} />
                <span className="truncate">{reserva.titular.apellido}, {reserva.titular.nombre}</span>
              </li>
              
              {/* Primer acompañante si existe */}
              {otrosHuespedes.length > 0 && (
                <li className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-slate-300 ml-0.5" />
                  <span className="truncate">{otrosHuespedes[0].apellido}, {otrosHuespedes[0].nombre}</span>
                </li>
              )}

              {/* Contador de más personas */}
              {reserva._count.huespedes > 1 && (
                <li className="text-[9px] font-black text-slate-400 pl-4 uppercase tracking-tighter">
                  + {reserva._count.huespedes - 1} acompañantes adicionales
                </li>
              )}
            </ul>
          </div>
        </div>
      </Link>
    );
  }

  // ESCENARIO B: HABITACIÓN LIBRE (Opciones de Venta)
  return (
    <div className="flex flex-col gap-2 min-h-26.25">
      {/* Botón de Venta Directa / Walk-in */}
      <Link 
        href={`/dashboard/reservas/nueva?habitacionId=${habitacion.id}&type=walkin`}
        className="flex-1 flex items-center justify-between px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 hover:text-blue-700 transition-all group"
      >
        <div className="flex items-center gap-3">
          <DoorOpen className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
          <span className="text-[10px] font-black uppercase tracking-tight">Check-in Directo</span>
        </div>
        <span className="text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
          ${habitacion.tipoActual.precio.toLocaleString('es-AR')}
        </span>
      </Link>

      {/* Botón de Reserva Futura */}
      <Link 
        href={`/dashboard/reservas/nueva?habitacionId=${habitacion.id}&type=reserva`}
        className="flex-1 flex items-center gap-3 px-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all group"
      >
        <CalendarPlus className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
        <span className="text-[10px] font-black uppercase tracking-tight text-slate-500 group-hover:text-slate-700">Reservar a Futuro</span>
      </Link>
    </div>
  );
}