"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BedDouble,
  Calendar,
  Plus,
  Receipt,
  ChevronRight,
  User,
  MapPin,
  IdCard,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
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
      {/* BLOQUE 1: UNIDAD Y CONFIGURACIÓN */}
      <Card className="p-8 border-none shadow-sm bg-white rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <BedDouble className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
            Unidad y Estancia
          </h3>
          <div
            onClick={() => setIsHabDialogOpen(true)}
            className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all group mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <BedDouble className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Habitación N° {reserva.habitacion.numero}</p>
                <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">
                   {reserva.tipoConfiguracion?.nombre || "Sin Configurar"}
                </h3>
              </div>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-primary transition-colors" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div onClick={() => setIsDateDialogOpen(true)} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl cursor-pointer hover:bg-white border border-transparent hover:border-slate-200 transition-all">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400">Entrada</p>
                <p className="font-bold text-slate-700 text-sm">{format(new Date(reserva.fechaEntrada), "dd/MM/yyyy")}</p>
              </div>
            </div>
            <div onClick={() => setIsDateDialogOpen(true)} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl cursor-pointer hover:bg-white border border-transparent hover:border-slate-200 transition-all">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400">Salida</p>
                <p className="font-bold text-slate-700 text-sm">{format(new Date(reserva.fechaSalida), "dd/MM/yyyy")}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* BLOQUE 2: RESPONSABLE DE PAGO */}
      <Card className="p-8 border-none shadow-sm bg-white rounded-3xl">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Responsable de Pago</h3>
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black uppercase">
            {reserva.titular.apellido[0]}
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
              {reserva.titular.apellido}, {reserva.titular.nombre}
            </h4>
            <div className="flex gap-4 mt-1 text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1"><IdCard className="w-3 h-3"/> {reserva.titular.documento}</span>
              {reserva.titular.email && <span>• {reserva.titular.email}</span>}
            </div>
          </div>
        </div>
      </Card>

      {/* BLOQUE 3: DETALLE ECONÓMICO */}
      <Card className="p-8 border-none shadow-sm bg-white rounded-3xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tarifas y Folio</h3>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase">Saldo Actual</p>
            <p className={`text-2xl font-black ${saldoPendiente > 0 ? "text-rose-500" : "text-emerald-500"}`}>
              ${saldoPendiente.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-[2rem] flex justify-between items-center mb-6">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Total Estadía ({noches}n)</p>
            <p className="text-3xl font-black text-slate-800">${reserva.total.toLocaleString()}</p>
          </div>
          <div className="text-right">
             <p className="text-[9px] font-black text-emerald-500 uppercase leading-none mb-1">Abonado</p>
             <p className="text-xl font-black text-emerald-600">${totalPagado.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-3">
          {reserva.movimientos.map((mov) => (
            <div key={mov.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${mov.tipo === "INGRESO" ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}>
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-slate-700">{mov.descripcion}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                    {format(new Date(mov.fecha), "dd/MM HH:mm")} • {mov.metodoPago?.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <span className={`font-black text-sm ${mov.tipo === "INGRESO" ? "text-emerald-600" : "text-rose-600"}`}>
                {mov.tipo === "INGRESO" ? "+" : "-"} ${mov.monto.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* BLOQUE 4: HUÉSPEDES (ACOMPAÑANTES) */}
      <Card className={`p-8 border-none shadow-sm rounded-3xl transition-all duration-500 ${reserva.estado === "CHECKIN" ? "bg-white" : "bg-slate-50/50"}`}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ocupantes de la Unidad</h3>
            <p className="text-[9px] font-bold text-primary uppercase mt-1 tracking-widest">
               {reserva.huespedes?.length || 0} personas registradas
            </p>
          </div>
          {reserva.estado === "CHECKIN" && (
            <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase border-2 tracking-widest">
              <Plus className="w-3 h-3 mr-2" /> Editar Lista
            </Button>
          )}
        </div>

        {reserva.huespedes && reserva.huespedes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reserva.huespedes.map((huesped) => (
              <div key={huesped.id} className="group flex items-center gap-4 p-5 bg-white border-2 border-slate-50 rounded-2xl hover:border-primary/20 transition-all">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 uppercase text-xs truncate">
                    {huesped.apellido}, {huesped.nombre}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                       <IdCard className="w-3 h-3"/> {huesped.documento}
                    </p>
                    {huesped.direccion && (
                      <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3"/> {huesped.direccion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
            <User className="w-8 h-8 text-slate-200 mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
               Esperando Check-in para listar ocupantes
            </p>
          </div>
        )}
      </Card>

      {/* DIALOGS */}
      <DialogModificarFechas isOpen={isDateDialogOpen} onClose={() => setIsDateDialogOpen(false)} reservaId={reserva.id} fechaEntradaOriginal={reserva.fechaEntrada} fechaSalidaOriginal={reserva.fechaSalida} />
      <DialogCambiarHabitacion isOpen={isHabDialogOpen} onClose={() => setIsHabDialogOpen(false)} reservaId={reserva.id} checkIn={reserva.fechaEntrada} checkOut={reserva.fechaSalida} habitacionActualId={reserva.habitacionId} />
    </div>
  );
}