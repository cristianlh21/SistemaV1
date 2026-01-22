// src/app/(dashboard)/dashboard/reservas/_components/reservaWizard/resumenStep/CardFinanzas.tsx
"use client";

import { Banknote, Receipt, Calculator, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardFinanzasProps {
  totalEstancia: number;
  montoAdelanto: number;
  precioPorNoche: number;
  noches: number;
}

export function CardFinanzas({ totalEstancia, montoAdelanto, precioPorNoche, noches }: CardFinanzasProps) {
  const saldoPendiente = totalEstancia - montoAdelanto;
  const estaSaldado = saldoPendiente <= 0;

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all md:col-span-2">
      {/* Icono de fondo */}
      <Banknote className="absolute -right-6 -bottom-6 h-32 w-32 text-slate-50 opacity-60" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Receipt className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Estado de Cuenta de la Reserva
            </span>
          </div>
          {estaSaldado ? (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-tight">Totalmente Pagado</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-500">
              <AlertCircle className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-tight">Saldo Pendiente</span>
            </div>
          )}
        </div>

        {/* Grid de Valores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* TOTAL ESTANCIA */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calculator className="h-3.5 w-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">Total Estadía</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-3xl font-black text-slate-800 tracking-tighter">
                ${totalEstancia.toLocaleString()}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                {noches} noches x ${precioPorNoche.toLocaleString()}
              </p>
            </div>
          </div>

          {/* SEÑA / ADELANTO */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-500">
              <Banknote className="h-3.5 w-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">Seña Percibida</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-3xl font-black text-emerald-600 tracking-tighter">
                ${montoAdelanto.toLocaleString()}
              </p>
              <p className="text-[10px] font-bold text-emerald-400 uppercase italic">
                Ingreso a Caja
              </p>
            </div>
          </div>

          {/* SALDO PENDIENTE */}
          <div className={cn(
            "p-4 rounded-2xl border-2 transition-all",
            estaSaldado 
              ? "bg-emerald-50/30 border-emerald-100" 
              : "bg-amber-50/50 border-amber-100"
          )}>
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <span className="text-[9px] font-black uppercase tracking-widest">Saldo a Cobrar</span>
            </div>
            <p className={cn(
              "text-3xl font-black tracking-tighter",
              estaSaldado ? "text-emerald-700" : "text-amber-600"
            )}>
              ${saldoPendiente.toLocaleString()}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase italic mt-1">
              Check-in / Check-out
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}