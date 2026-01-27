"use client";

import { EstadoReserva } from "@prisma/client";
import { Check, Circle, AlertTriangle } from "lucide-react";

interface Props {
  estado: EstadoReserva;
}

// Definimos las etapas del "camino" del huésped
const PASOS = [
  { id: "PENDIENTE", label: "Reserva" },
  { id: "CONFIRMADA", label: "Confirmada" },
  { id: "CHECKIN", label: "Huésped en Hotel" },
  { id: "CHECKOUT", label: "Check-out" },
];

export function BarraProgresoReserva({ estado }: Props) {
  // Calculamos en qué punto del camino estamos
  const currentIndex = PASOS.findIndex((p) => p.id === estado);
  
  // Si el estado es de cierre (Finalizada o Checkout), marcamos todo como completado
  const esFinalizada = estado === "FINALIZADA" || estado === "CHECKOUT";
  const indexEfectivo = esFinalizada ? 3 : currentIndex;

  // Estados que "rompen" el camino normal
  const esCancelada = estado === "CANCELADA" || estado === "NOSHOW";

  if (esCancelada) {
    return (
      <div className="w-full p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95">
        <AlertTriangle className="w-5 h-5 text-rose-500" />
        <span className="text-xs font-black text-rose-700 uppercase tracking-widest">
          Esta reserva ha sido {estado === "CANCELADA" ? "Cancelada" : "marcada como No-Show"}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full py-8 px-4">
      <div className="relative flex justify-between">
        {/* LÍNEA GRIS DE FONDO */}
        <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
        
        {/* LÍNEA DE COLOR ACTIVA (PROGRESO) */}
        <div 
          className="absolute top-5 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-1000 rounded-full"
          style={{ width: `${(indexEfectivo / (PASOS.length - 1)) * 100}%` }}
        />

        {PASOS.map((paso, index) => {
          const completado = index < indexEfectivo;
          const actual = index === indexEfectivo;
          
          return (
            <div key={paso.id} className="relative z-10 flex flex-col items-center gap-3">
              {/* Círculo del paso */}
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-700 ${
                  completado 
                    ? "bg-primary border-primary text-white shadow-md shadow-primary/20" 
                    : actual 
                    ? "bg-white border-primary text-primary shadow-xl scale-125 ring-4 ring-primary/10" 
                    : "bg-white border-slate-200 text-slate-300"
                }`}
              >
                {completado || esFinalizada && index === 3 ? (
                  <Check className="w-5 h-5 stroke-[3px]" />
                ) : (
                  <span className="text-xs font-black">{index + 1}</span>
                )}
              </div>

              {/* Etiqueta del paso */}
              <span className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-500 ${
                actual ? "text-primary" : "text-slate-400"
              }`}>
                {paso.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}