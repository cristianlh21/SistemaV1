// src/app/(dashboard)/dashboard/reservas/[id]/page.tsx
import { notFound } from "next/navigation";
import { getReservaById } from "../_actions";
import { BarraProgresoReserva } from "./_components/BarraProgresoReserva";
import { differenceInDays } from "date-fns";
import { BotoneraAcciones } from "./_components/BotoneraAcciones";
import { PorfolioHabitacion } from "./_components/PorfolioHabitacion";
import { ReservaCompletaFicha } from "./types.ts";
// Estos componentes los crearemos a continuación:
// import { PorfolioHabitacion } from "./_components/PorfolioHabitacion";
// import { BotoneraAcciones } from "./_components/BotoneraAcciones";

export default async function FichaReservaPage({
  params,
}: {
  params: Promise<{ id: string }>; // <--- Nota que ahora es una Promesa
}) {
  // UNWRAPPING: Esperamos a que los params lleguen
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // Ahora el ID ya no es undefined, es el string real
  const res = await getReservaById(id);
  
  if (!res.success || !res.data) notFound();
  
  const reserva = res.data as ReservaCompletaFicha;

  const totalPagado = reserva.movimientos
    .filter((m) => m.tipo === "INGRESO")
    .reduce((acc, m) => acc + m.monto, 0);
  const noches = Math.max(
    differenceInDays(
      new Date(reserva.fechaSalida),
      new Date(reserva.fechaEntrada),
    ),
    1,
  );
  const totalEstancia = noches * reserva.precioPactado;
  const saldoPendiente = totalEstancia - totalPagado;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* 1. TÍTULO Y BARRA DE PROGRESO */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter">
          Gestión de Reserva{" "}
          <span className="text-primary">#{reserva.numeroReserva}</span>
        </h1>
        <BarraProgresoReserva estado={reserva.estado} />
      </div>

      {/* 2. GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUMNA IZQUIERDA (PORFOLIO) - 8 de 12 columnas */}
        <div className="lg:col-span-8 space-y-6">
          <PorfolioHabitacion reserva={reserva} />
        </div>

        {/* COLUMNA DERECHA (ACCIONES) - 4 de 12 columnas */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm sticky top-8">
            <BotoneraAcciones
              reservaId={reserva.id}
              estadoActual={reserva.estado}
              saldoPendiente={saldoPendiente}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
