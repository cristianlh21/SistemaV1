"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BedDouble,
  Calendar,
  Users,
  Edit3,
  Plus,
  Calculator,
  Receipt,
  ArrowUpCircle,
  ChevronRight,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { TipoMovimiento } from "@prisma/client";
import { ReservaCompletaFicha } from "../types.ts";
import { useState } from "react";
import { DialogModificarFechas } from "./DialogModificarFechas";
import { DialogCambiarHabitacion } from "./DialogCambiarHabitacion";

interface Props {
  reserva: ReservaCompletaFicha;
}

export function PorfolioHabitacion({ reserva }: Props) {
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [isHabDialogOpen, setIsHabDialogOpen] = useState(false);
  // LÓGICA DE CÁLCULOS
  const noches = Math.max(
    differenceInDays(
      new Date(reserva.fechaSalida),
      new Date(reserva.fechaEntrada),
    ),
    1,
  );
  const totalPagado = reserva.movimientos
    .filter((m) => m.tipo === TipoMovimiento.INGRESO)
    .reduce((acc, m) => acc + m.monto, 0);
  const saldoPendiente = reserva.total - totalPagado;

  return (
    <div className="space-y-6">
      {/* BLOQUE 1: DATOS DE LA HABITACIÓN Y ESTANCIA */}
      <Card className="p-8 border-none shadow-sm bg-white rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <BedDouble className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                Unidad y Configuración
              </h3>
              <div
                onClick={() => setIsHabDialogOpen(true)}
                className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <BedDouble className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Habitación Actual
                    </p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter">
                      N° {reserva.habitacion.numero}
                    </h3>
                    <p className="text-xs font-bold text-primary/80 uppercase italic">
                      {reserva.tipoConfiguracion?.nombre || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="text-slate-300 group-hover:text-primary transition-colors">
                  <ChevronRight />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CARD ENTRADA */}
            <div
              onClick={() => setIsDateDialogOpen(true)}
              className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl cursor-pointer hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-primary transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Check-in
                </p>
                <p className="font-bold text-slate-700">
                  {format(new Date(reserva.fechaEntrada), "dd/MM/yyyy")}
                </p>
              </div>
            </div>

            {/* CARD SALIDA */}
            <div
              onClick={() => setIsDateDialogOpen(true)}
              className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl cursor-pointer hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-primary transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Check-out
                </p>
                <p className="font-bold text-slate-700">
                  {format(new Date(reserva.fechaSalida), "dd/MM/yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* BLOQUE 2: EL TITULAR */}
      <Card className="p-8 border-none shadow-sm bg-white rounded-3xl">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
          Responsable de Pago
        </h3>
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-400 uppercase">
            {reserva.titular.apellido[0]}
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
              {reserva.titular.apellido}, {reserva.titular.nombre}
            </h4>
            <div className="flex gap-4 mt-1 text-sm text-slate-500 font-medium">
              <span>DNI: {reserva.titular.documento}</span>
              {reserva.titular.email && <span>• {reserva.titular.email}</span>}
            </div>
          </div>
        </div>
      </Card>

      {/* BLOQUE 3: COSTOS DE LA ESTANCIA */}
      <Card className="p-8 border-none shadow-sm bg-white rounded-3xl">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
          Detalle de Tarifas
        </h3>
        <div className="flex justify-between items-end bg-slate-50 p-6 rounded-2xl">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Precio pactado x noche
            </p>
            <p className="text-2xl font-black text-slate-800">
              ${reserva.precioPactado.toLocaleString()}
            </p>
          </div>
          <div className="text-center opacity-30 font-black text-xl">
            x {noches}n
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-primary uppercase">
              Total Estadía
            </p>
            <p className="text-3xl font-black text-primary">
              ${reserva.total.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      {/* BLOQUE 4: PAGOS Y MOVIMIENTOS */}
      <Card className="p-8 border-none shadow-sm bg-white rounded-3xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Folio / Pagos realizados
          </h3>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase">
              Saldo Pendiente
            </p>
            <p
              className={`text-2xl font-black ${saldoPendiente > 0 ? "text-rose-600" : "text-emerald-600"}`}
            >
              ${saldoPendiente.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {reserva.movimientos.map((mov) => (
            <div
              key={mov.id}
              className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Receipt className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-700 leading-none">
                    {mov.descripcion}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    {format(new Date(mov.fecha), "dd/MM HH:mm")} •{" "}
                    {mov.metodoPago}
                  </p>
                </div>
              </div>
              <span
                className={`font-black ${mov.tipo === "INGRESO" ? "text-emerald-600" : "text-rose-600"}`}
              >
                {mov.tipo === "INGRESO" ? "+" : "-"} $
                {mov.monto.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* BLOQUE 5: ACOMPAÑANTES */}
      <Card
        className={`p-8 border-none shadow-sm rounded-3xl transition-all duration-500 ${
          reserva.estado === "CHECKIN"
            ? "bg-white opacity-100"
            : "bg-slate-50/50 opacity-60"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Acompañantes / Huéspedes
            </h3>
          </div>
          {reserva.estado === "CHECKIN" && (
            <Button size="sm" className="rounded-xl font-bold gap-2">
              <Plus className="w-4 h-4" /> Añadir Huésped
            </Button>
          )}
        </div>
        {(reserva.huespedes?.length ?? 0) > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reserva.huespedes?.map((huesped) => (
              <div
                key={huesped.id}
                className="flex items-center gap-3 p-3 border rounded-2xl bg-white"
              >
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold">
                  {huesped.apellido[0]}
                </div>
                <div className="text-xs">
                  <p className="font-bold uppercase tracking-tighter">
                    {huesped.apellido}, {huesped.nombre}
                  </p>
                  <p className="text-slate-400 font-medium">
                    {huesped.documento}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-xs text-slate-400 font-medium italic">
              Sin acompañantes registrados.
            </p>
          </div>
        )}
      </Card>
      <DialogModificarFechas
        isOpen={isDateDialogOpen}
        onClose={() => setIsDateDialogOpen(false)}
        reservaId={reserva.id}
        fechaEntradaOriginal={reserva.fechaEntrada}
        fechaSalidaOriginal={reserva.fechaSalida}
      />

      <DialogCambiarHabitacion
        isOpen={isHabDialogOpen}
        onClose={() => setIsHabDialogOpen(false)}
        reservaId={reserva.id}
        checkIn={reserva.fechaEntrada}
        checkOut={reserva.fechaSalida}
        habitacionActualId={reserva.habitacionId}
      />
    </div>
  );
}
