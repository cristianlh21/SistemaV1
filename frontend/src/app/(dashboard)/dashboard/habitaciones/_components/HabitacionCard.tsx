// src/app/(dashboard)/dashboard/habitaciones/_components/HabitacionCard.tsx
"use client";

import { HabitacionDashboard } from "../types";
import { CardHeader } from "./cardHabitacion/CardHeader";
import { CardBody } from "./cardHabitacion/CardBody";
import { CardFooter } from "./cardHabitacion/CardFooter";
import { isToday } from "date-fns";

// src/app/(dashboard)/dashboard/habitaciones/_components/HabitacionCard.tsx

export function HabitacionCard({ habitacion }: { habitacion: HabitacionDashboard }) {
  const reservaActiva = habitacion.reservas?.[0];
  const hoy = new Date();

  // DEFINICIÓN DE ESTADOS CON PRIORIDAD
  const esSalidaHoy = !!reservaActiva && 
                      isToday(new Date(reservaActiva.fechaSalida)) && 
                      reservaActiva.estado === "CHECKIN";

  const esEntradaHoy = !!reservaActiva && 
                       isToday(new Date(reservaActiva.fechaEntrada)) && 
                       reservaActiva.estado !== "CHECKIN";

  const estaOcupada = habitacion.estadoOcupacion === "OCUPADA" && !esSalidaHoy;

  // ASIGNACIÓN DE COLOR DE BORDE (Hexadecimales solicitados)
  let borderColor = "border-slate-100"; // Libre

  if (habitacion.mantenimiento) borderColor = "border-rose-500";
  else if (habitacion.estadoLimpieza === "SUCIA") borderColor = "border-pink-300";
  else if (esSalidaHoy) borderColor = "border-[#a6527c]"; // Check-out hoy
  else if (esEntradaHoy) borderColor = "border-[#7c7c7c]"; // Reserva hoy
  else if (estaOcupada) borderColor = "border-[#527ca6]"; // Ocupada estable

  return (
    <div className={`relative flex flex-col h-full rounded-[2.5rem] border-2 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md ${borderColor}`}>
      <CardHeader habitacion={habitacion} reserva={reservaActiva} />
      <div className="flex-1 px-5 py-2">
        <CardBody habitacion={habitacion} reserva={reservaActiva} />
      </div>
      <CardFooter habitacion={habitacion} />
    </div>
  );
}