// src/app/(dashboard)/dashboard/reservas/[id]/page.tsx
import { getReservaById } from "../_actions";
import { differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LogIn, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { CardEstadia } from "../_components/ReservaWizard/resumenStep/CardEstadia";
import { CardHuesped } from "../_components/ReservaWizard/resumenStep/CardHuesped";
import { CardFinanzas } from "../_components/ReservaWizard/resumenStep/CardFinanzas";
import { DialogPago } from "../_components/detalle/DialogPago";

export default async function DetalleReservaPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const { data: reserva } = await getReservaById(id);

  if (!reserva) return <div className="p-10">Reserva no encontrada</div>;

  const noches = Math.max(
    1,
    differenceInDays(
      new Date(reserva.fechaSalida),
      new Date(reserva.fechaEntrada),
    ),
  );
  const totalEstancia = noches * (reserva.precioPactado || 0);
  const totalPagado =
    reserva.movimientos?.reduce((acc, m) => acc + m.monto, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 1. CABECERA: Navegación y Título */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reservas">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black uppercase tracking-tighter">
                {reserva.titular.apellido}, {reserva.titular.nombre}
              </h1>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3 font-bold">
                {reserva.estado}
              </Badge>
            </div>
            <p className="text-slate-500 font-medium text-sm italic">
              Reserva #{reserva.id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* 2. CUERPO: Grid 70/30 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* PARTE IZQUIERDA (Resumen Atómico) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardEstadia
              fechaEntrada={reserva.fechaEntrada}
              fechaSalida={reserva.fechaSalida}
              habitacionNumero={reserva.habitacion.numero}
              tipoConfiguracion={
                reserva.tipoConfiguracion?.nombre || "No definido"
              }
            />
            <CardHuesped
              nombre={reserva.titular.nombre}
              apellido={reserva.titular.apellido}
              documento={reserva.titular.documento}
            />
          </div>

          <CardFinanzas
            totalEstancia={totalEstancia}
            montoAdelanto={totalPagado}
            precioPorNoche={reserva.precioPactado}
            noches={noches}
          />

          {/* Aquí podríamos meter la tabla de movimientos más adelante */}
          <div className="bg-white rounded-[2rem] border p-8 border-dashed border-slate-300">
            <p className="text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              Historial de movimientos y pagos (Próximamente)
            </p>
          </div>
        </div>

        {/* PARTE DERECHA (Panel de Botones) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200 space-y-4 border border-slate-800">
            <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-center opacity-50">
              Panel de Control
            </h3>

            <Button className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-[10px] gap-3">
              <LogIn className="w-4 h-4" /> Iniciar Check-In
            </Button>

            {/* USAMOS EL NUEVO DIALOG AQUÍ */}
            <DialogPago
              reservaId={reserva.id}
              titularNombre={`${reserva.titular.apellido}, ${reserva.titular.nombre}`}
            />

            <Button className="w-full h-16 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] gap-3 border border-white/10">
              <Settings className="w-4 h-4 text-orange-400" /> Modificar Reserva
            </Button>

            <div className="pt-4">
              <Button
                variant="ghost"
                className="w-full h-14 rounded-2xl text-red-400 hover:text-red-500 hover:bg-red-500/10 font-black uppercase tracking-widest text-[10px] gap-3"
              >
                <LogOut className="w-4 h-4" /> Check-Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
