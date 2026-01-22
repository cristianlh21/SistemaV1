// src/app/(dashboard)/dashboard/reservas/_components/reservaWizard/resumenStep/CardEstadia.tsx
"use client";

import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRightFromLineIcon, CalendarDays, DoorOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CardEstadiaProps {
  fechaEntrada: Date | undefined;
  fechaSalida: Date | undefined;
  habitacionNumero?: string;
  tipoConfiguracion?: string; // Ej: "Doble Matrimonial"
}

export function CardEstadia({
  fechaEntrada,
  fechaSalida,
  habitacionNumero,
  tipoConfiguracion,
}: CardEstadiaProps) {
  const noches =
    fechaEntrada && fechaSalida
      ? differenceInDays(fechaSalida, fechaEntrada)
      : 0;

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {/* Decoración sutil de fondo */}
      <CalendarDays className="absolute -right-2 -top-2 h-24 w-24 text-slate-50 opacity-50" />

      <div className="relative z-10 space-y-6">
        {/* Header de la Card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarDays className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Cronograma de Estadía
            </span>
          </div>
          <Badge className="bg-slate-900 font-black uppercase tracking-tighter text-[9px]">
            {noches} {noches === 1 ? "Noche" : "Noches"}
          </Badge>
        </div>

        {/* Bloque de Fechas Principal */}
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex-1 space-y-1">
            <p className="text-[9px] font-black uppercase text-primary tracking-widest">
              Check-In
            </p>
            <p className="text-lg font-black leading-tight text-slate-800">
              {fechaEntrada
                ? format(fechaEntrada, "dd 'de' MMM", {
                    locale: es,
                  }).toUpperCase()
                : "---"}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              {fechaEntrada
                ? format(fechaEntrada, "EEEE", { locale: es })
                : "Fecha no definida"}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-300">
            <ArrowRightFromLineIcon className="h-5 w-5" />
          </div>

          <div className="flex-1 text-right space-y-1">
            <p className="text-[9px] font-black uppercase text-primary tracking-widest">
              Check-Out
            </p>
            <p className="text-lg font-black leading-tight text-slate-800">
              {fechaSalida
                ? format(fechaSalida, "dd 'de' MMM", {
                    locale: es,
                  }).toUpperCase()
                : "---"}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              {fechaSalida
                ? format(fechaSalida, "EEEE", { locale: es })
                : "Fecha no definida"}
            </p>
          </div>
        </div>

        {/* Info de la Unidad */}
        <div className="flex items-start gap-4 border-t border-dashed border-slate-200 pt-4 mt-2">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
            <DoorOpen className="h-6 w-6" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Unidad Asignada
              </p>
              {habitacionNumero && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-black border-primary text-primary bg-primary/5"
                >
                  HABITACIÓN {habitacionNumero}
                </Badge>
              )}
            </div>

            <div className="space-y-0.5">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                {tipoConfiguracion || "Configuración no definida"}
              </h4>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Estado: Disponible para reserva
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
