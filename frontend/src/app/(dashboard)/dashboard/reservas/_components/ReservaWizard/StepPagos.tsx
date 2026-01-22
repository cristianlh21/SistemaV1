// src/app/(dashboard)/dashboard/reservas/_components/reservaWizard/StepPagos.tsx
"use client";

import { Info, Wallet, CalendarDays } from "lucide-react";
import { StepProps } from "./types";
import { MovimientoForm, MovimientoFormValues } from "@/components/forms/MovimientoForm";
import { differenceInDays } from "date-fns";

export function StepPagos({ data, setData }: StepProps) {
  
  const fEntrada = data.fechaEntrada ? new Date(data.fechaEntrada) : null;
  const fSalida = data.fechaSalida ? new Date(data.fechaSalida) : null;

  const noches = (fEntrada && fSalida) 
    ? Math.max(1, differenceInDays(fSalida, fEntrada)) 
    : 0;

  const totalEstancia = noches * (data.precioPactado || 0);
  const saldoRestante = totalEstancia - data.montoAdelanto;

  const handleMovimientoSuccess = (values: MovimientoFormValues) => {
    // Al recibir los valores, actualizamos el estado global del Wizard
    setData(prev => ({
      ...prev,
      montoAdelanto: values.monto,
      notas: values.descripcion
    }));
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Estancia</p>
          <h3 className="text-3xl font-black text-slate-900">${totalEstancia.toLocaleString()}</h3>
          
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-white px-2 py-1 rounded-md border text-[10px] font-bold text-slate-500 uppercase">
            <CalendarDays className="w-3 h-3" />
            {noches} {noches === 1 ? 'noche' : 'noches'}
          </div>
        </div>
        
        <div className={`p-6 rounded-2xl border transition-colors ${saldoRestante <= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${saldoRestante <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
            Saldo Pendiente
          </p>
          <h3 className={`text-3xl font-black ${saldoRestante <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
            ${saldoRestante.toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-3xl border p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Registro de Entrega / Seña</h3>
            <p className="text-xs text-slate-500 font-medium">
              Precio pactado por noche: <span className="font-bold text-slate-700">${data.precioPactado.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Aquí pasamos el componente corregido */}
        <MovimientoForm 
          defaultMonto={data.montoAdelanto}
          submitLabel="Vincular Pago a Reserva"
          onSuccess={handleMovimientoSuccess} 
          // reservaId no se pasa aquí porque la reserva aún no existe
        />
      </div>

      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">
          <b>Nota:</b> El total se calcula multiplicando las <b>{noches} noches</b> por el valor de la tarifa seleccionada. Al registrar un monto, se generará un movimiento de <b>INGRESO</b>.
        </p>
      </div>
    </div>
  );
}