// src/app/(dashboard)/dashboard/reservas/_components/reservaWizard/StepResumen.tsx
"use client";

import { StepProps } from "./types";
import { differenceInDays } from "date-fns";
import { CheckCircle2, FileText } from "lucide-react";

// Importamos nuestros nuevos átomos
import { CardEstadia } from "./resumenStep/CardEstadia";
import { CardHuesped } from "./resumenStep/CardHuesped";
import { CardFinanzas } from "./resumenStep/CardFinanzas";

export function StepResumen({ data }: StepProps) {
  // 1. Forzamos que las fechas sean tratadas como objetos Date (por si vienen como strings)
  const fEntrada = data.fechaEntrada ? new Date(data.fechaEntrada) : null;
  const fSalida = data.fechaSalida ? new Date(data.fechaSalida) : null;

  // 2. Calculamos las noches asegurando un mínimo de 1 si las fechas son válidas
  const noches = (fEntrada && fSalida) 
    ? Math.max(1, differenceInDays(fSalida, fEntrada)) 
    : 0;

  // 3. Verificamos el precio. Si llega a ser 0, es que el Step 1 no lo pasó bien.
  const totalEstancia = noches * (data.precioPactado || 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ENCABEZADO DE VALIDACIÓN */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800">
            Confirmar Reserva
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Verifique la información antes de finalizar el alta
          </p>
        </div>
      </div>

      {/* GRID PRINCIPAL DE INFORMACIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ÁTOMO 1: CRONOGRAMA Y UNIDAD */}
        <CardEstadia
          fechaEntrada={data.fechaEntrada}
          fechaSalida={data.fechaSalida}
          habitacionNumero={data.habitacionNumero}
          tipoConfiguracion={data.tipoConfiguracionNombre} // Pasamos el nombre del tipo
        />

        {/* ÁTOMO 2: TITULAR (Datos recuperados del Step 2) */}
        <CardHuesped
          nombre={data.huespedNombre || "Nombre"}
          apellido={data.huespedApellido || "Apellido"}
          documento={data.huespedDni || "---"}
          telefono={data.huespedTelefono}
        />

        {/* ÁTOMO 3: ESTADO FINANCIERO (Ocupa 2 columnas) */}
        <CardFinanzas
          totalEstancia={totalEstancia}
          montoAdelanto={data.montoAdelanto}
          precioPorNoche={data.precioPactado}
          noches={noches}
        />

        {/* ÁTOMO 4: OBSERVACIONES (Ancho completo) */}
        <div className="md:col-span-2 relative group">
          <div className="absolute left-6 -top-2 z-20 bg-white px-2">
            <div className="flex items-center gap-1.5 text-slate-400">
              <FileText className="h-3 w-3" />
              <span className="text-[9px] font-black uppercase tracking-widest">
                Observaciones Especiales
              </span>
            </div>
          </div>
          <div className="p-6 rounded-[2rem] border border-slate-200 bg-slate-50/50 min-h-25">
            <p className="text-sm font-medium text-slate-600 italic leading-relaxed">
              {data.notas ||
                "No se han ingresado notas adicionales para esta reserva."}
            </p>
          </div>
        </div>
      </div>

      {/* ADVERTENCIA FINAL SUTIL */}
      <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50">
        <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        <p className="text-[10px] font-black uppercase text-amber-600 tracking-tighter">
          Al confirmar, la habitación quedará bloqueada y se emitirá el
          comprobante de seña.
        </p>
      </div>
    </div>
  );
}
