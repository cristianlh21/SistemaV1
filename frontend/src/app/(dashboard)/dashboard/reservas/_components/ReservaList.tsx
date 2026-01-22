// src/app/(dashboard)/dashboard/reservas/_components/ReservaList.tsx
"use client";
import { ReservaCard, ReservaCompleta } from "./ReservaCard";
import { CalendarDays } from "lucide-react";



interface ReservaListProps {
  reservasIniciales: ReservaCompleta[];
}

export function ReservaList({ reservasIniciales }: ReservaListProps) {
  // Si no hay reservas, mostramos un estado vacío estético
  if (reservasIniciales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <CalendarDays className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
          Sin reservas registradas
        </h3>
        <p className="text-slate-500 text-sm max-w-62.5 text-center">
          No hay movimientos previstos para estas fechas en el Shauard.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mapeamos las reservas para renderizar cada Card */}
      {reservasIniciales.map((reserva) => (
        <ReservaCard key={reserva.id} reserva={reserva} />
      ))}
    </div>
  );
}