// src/app/(dashboard)/dashboard/habitaciones/_components/cardHabitacion/CardHeader.tsx
import { HabitacionDashboard, ReservaDashboard } from "../../types";
import { isToday } from "date-fns";


export function CardHeader({ habitacion, reserva }: { habitacion: HabitacionDashboard, reserva?: ReservaDashboard }) {
  const esSalidaHoy = !!reserva && isToday(new Date(reserva.fechaSalida)) && reserva.estado === "CHECKIN";
  const esEntradaHoy = !!reserva && isToday(new Date(reserva.fechaEntrada)) && reserva.estado !== "CHECKIN";
  const estaOcupada = habitacion.estadoOcupacion === "OCUPADA" && !esSalidaHoy;
  
  const isSucia = habitacion.estadoLimpieza === "SUCIA";
  const enMantenimiento = habitacion.mantenimiento;

  // 1. Lógica de "Configuración Vendida"
  // Si hay reserva, mostramos el tipo que se pactó (tipoConfiguracion)
  const nombreAMostrar = reserva?.tipoConfiguracion?.nombre || habitacion.tipoActual.nombre;
  const esConfiguracionEspecial = reserva && reserva.tipoConfiguracionId !== habitacion.tipoActualId;

  let estilos = {
    color: "#94a3b8",
    tipoActual: "#475569",
    tipoBase: "#94a3b8",
    labelEstado: "LIBRE"
  };

  if (esSalidaHoy) {
    estilos = { color: "#a6527c", tipoActual: "#4a3540", tipoBase: "#5c3f4e", labelEstado: "CHECK-OUT HOY" };
  } else if (esEntradaHoy) {
    estilos = { color: "#7c7c7c", tipoActual: "#404040", tipoBase: "#4e4e4e", labelEstado: "RESERVA HOY" };
  } else if (estaOcupada) {
    estilos = { color: "#527ca6", tipoActual: "#35404a", tipoBase: "#3f4e5c", labelEstado: "OCUPADA" };
  }

  return (
    <div className="pt-6 px-5 pb-2 flex flex-col items-center text-center">
      <div className="h-8 flex flex-col justify-end items-center mb-1">
        {enMantenimiento ? (
          <span className="text-[8px] font-black text-rose-600 uppercase tracking-[0.3em] leading-none mb-1">⚠️ Mantenimiento</span>
        ) : isSucia ? (
          <span className="text-[8px] font-black text-pink-500 uppercase tracking-[0.3em] leading-none mb-1">🧹 Sucia</span>
        ) : null}

        <span 
          className={`text-[9px] font-black uppercase tracking-[0.25em] leading-none ${(esSalidaHoy || esEntradaHoy) ? 'animate-pulse' : ''}`}
          style={{ color: estilos.color }}
        >
          {estilos.labelEstado}
        </span>
      </div>
      
      <span 
        className={`text-6xl font-black tracking-tighter leading-none mb-4 ${(esSalidaHoy || esEntradaHoy) ? 'animate-pulse' : ''}`}
        style={{ color: estilos.color }}
      >
        {habitacion.numero}
      </span>

      <div className="w-full pt-1 border-t border-slate-50">
        {/* Aquí mostramos la configuración de la RESERVA si existe */}
        <h3 className="text-[10px] font-black uppercase leading-tight" style={{ color: estilos.tipoActual }}>
          {nombreAMostrar}
          {esConfiguracionEspecial && <span className="text-[9px] block text-amber-600 italic mt-0.5">✨ Config. Especial</span>}
        </h3>
        <p className="text-[8px] font-bold uppercase italic tracking-widest mt-0.5" style={{ color: estilos.tipoBase }}>
          Base: {habitacion.tipoBase.nombre}
        </p>
      </div>
    </div>
  );
}