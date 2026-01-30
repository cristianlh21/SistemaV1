/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Prisma, EstadoReserva, TipoMovimiento } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Calculator,
  MoreVertical,
  Eye,
  Check,
  UserMinus,
  XCircle,
  ArrowBigRightDash,
  ArrowRightToLine,
  DollarSign,
} from "lucide-react";
import { format, differenceInDays, isToday } from "date-fns";
import { es } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateEstadoReserva } from "../_actions";
import { toast } from "sonner";
import Link from "next/link";

// 1. CONFIGURACIÓN DE ESTILOS UNIFICADA
const ESTADO_CONFIG: Record<EstadoReserva, { bg: string; text: string; border: string }> = {
  PENDIENTE: { bg: "bg-[#cda073]", text: "text-[#cda073]", border: "border-[#cda073]" },
  CONFIRMADA: { bg: "bg-[#80c0a0]", text: "text-[#80c0a0]", border: "border-[#80c0a0]" },
  NOSHOW: { bg: "bg-[#a080c0]", text: "text-[#a080c0]", border: "border-[#a080c0]" },
  CANCELADA: { bg: "bg-[#c080a0]", text: "text-[#c080a0]", border: "border-[#c080a0]" },
  CHECKIN: { bg: "bg-blue-600", text: "text-blue-600", border: "border-blue-600" },
  CHECKOUT: { bg: "bg-slate-800", text: "text-slate-800", border: "border-slate-800" },
  FINALIZADA: { bg: "bg-slate-800", text: "text-slate-800", border: "border-slate-800" },
};

export type ReservaCompleta = Prisma.ReservaGetPayload<{
  include: {
    habitacion: true;
    titular: true;
    movimientos: true;
    tipoConfiguracion: true;
  };
}>;

export function ReservaCard({ reserva }: { reserva: ReservaCompleta }) {
  // 2. LÓGICA FINANCIERA Y DE TIEMPO
  const noches = Math.max(differenceInDays(new Date(reserva.fechaSalida), new Date(reserva.fechaEntrada)), 1);
  const totalEstancia = noches * reserva.precioPactado;
  const totalPagado = reserva.movimientos
    .filter((m) => m.tipo === TipoMovimiento.INGRESO)
    .reduce((acc, m) => acc + m.monto, 0);
  const saldoPendiente = totalEstancia - totalPagado;
  
  const esLlegadaHoy = isToday(new Date(reserva.fechaEntrada));

  // 3. MANEJADOR DE ESTADOS
  const handleUpdateEstado = async (nuevoEstado: EstadoReserva) => {
    if (nuevoEstado === "CHECKOUT" && saldoPendiente > 0) {
      return toast.error("No se puede realizar Check-out con saldo pendiente.");
    }

    try {
      const res = await updateEstadoReserva(reserva.id, nuevoEstado);
      if (res.success) {
        toast.success(`Reserva movida a ${nuevoEstado}`);
      } else {
        toast.error("Error al actualizar la reserva");
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor");
    }
  };

  const style = ESTADO_CONFIG[reserva.estado] || ESTADO_CONFIG.PENDIENTE;

  return (
    <Card className={`group bg-white border-2 transition-all duration-300 ${style.border} hover:shadow-lg`}>
      <div className="flex items-center p-3 gap-6">
        
        {/* AVATAR: NÚMERO DE HABITACIÓN */}
        <div className={`shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg border-b-4 ${style.bg} text-white transition-colors duration-500`}>
          <span className="text-[9px] uppercase font-black tracking-tighter opacity-80 leading-none mb-1">Hab</span>
          <span className="text-2xl font-black leading-none">{reserva.habitacion.numero}</span>
        </div>

        {/* INFO HUÉSPED */}
        <div className="flex-1 min-w-50">
          <div className="flex items-center gap-1 mb-0.5 opacity-60">
            <User className="w-3 h-3 text-slate-800" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-800">Titular</span>
          </div>
          <h3 className={`text-lg font-black leading-tight uppercase ${style.text}`}>
            {reserva.titular.apellido}
          </h3>
          <p className={`text-sm font-medium leading-tight capitalize opacity-80 ${style.text}`}>
            {reserva.titular.nombre}
          </p>
          <div className="mt-2">
            <Badge className={`${style.bg} text-white border-none text-[9px] font-black uppercase`}>
              {reserva.tipoConfiguracion?.nombre || "Estándar"}
            </Badge>
          </div>
        </div>

        {/* CRONOGRAMA DE ESTANCIA */}
        <div className="flex-[1.2] flex items-center justify-center gap-6 px-6 border-x border-slate-100">
          <div className="text-center">
            <p className="text-[9px] font-black uppercase text-emerald-600 mb-1">Entrada</p>
            <p className="text-sm font-bold text-slate-700 uppercase">
              {format(new Date(reserva.fechaEntrada), "dd MMM", { locale: es })}
            </p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black text-slate-400">{noches}N</span>
            <ArrowRightToLine className="w-4 h-4 text-slate-300" />
          </div>

          <div className="text-center">
            <p className="text-[9px] font-black uppercase text-rose-600 mb-1">Salida</p>
            <p className="text-sm font-bold text-slate-700 uppercase">
              {format(new Date(reserva.fechaSalida), "dd MMM", { locale: es })}
            </p>
          </div>
        </div>

        {/* CONTABILIDAD RÁPIDA */}
        <div className="flex-[1.5] flex gap-8 pl-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 opacity-50">
              <Calculator className="w-3 h-3" />
              <span className="text-[9px] font-black uppercase tracking-tighter">Total</span>
            </div>
            <p className="text-base font-black text-slate-800">${totalEstancia.toLocaleString()}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <DollarSign className={`w-3 h-3 ${saldoPendiente > 0 ? "text-rose-500" : "text-emerald-500"}`} />
              <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">Saldo</span>
            </div>
            <p className={`text-base font-black ${saldoPendiente > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              ${saldoPendiente.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ACCIONES Y ESTADO */}
        <div className="shrink-0 flex items-center gap-3 min-w-40 justify-end">
          <div className="flex flex-col items-end gap-1">
            <Badge className={`${style.bg} text-white border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest`}>
              {reserva.estado.replace("_", " ")}
            </Badge>
            {esLlegadaHoy && reserva.estado === "CONFIRMADA" && (
              <span className="text-[8px] font-black text-blue-600 animate-pulse uppercase">¡Llega Hoy!</span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 h-10 w-10">
                <MoreVertical className="w-5 h-5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2 shadow-2xl border-slate-200">
              <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 px-2 pb-2">Operaciones</DropdownMenuLabel>
              
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link href={`/dashboard/reservas/${reserva.id}`} className="flex items-center gap-2 font-bold text-xs uppercase">
                  <Eye className="w-4 h-4" /> Ver Ficha Completa
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              {/* ACCIONES DINÁMICAS SEGÚN ESTADO */}
              {reserva.estado === "PENDIENTE" && (
                <DropdownMenuItem onClick={() => handleUpdateEstado("CONFIRMADA")} className="rounded-xl font-bold text-xs uppercase gap-2 text-emerald-600 focus:bg-emerald-50 cursor-pointer py-3">
                  <Check className="w-4 h-4" /> Confirmar Reserva
                </DropdownMenuItem>
              )}

              {reserva.estado === "CONFIRMADA" && (
                <DropdownMenuItem onClick={() => handleUpdateEstado("CHECKIN")} className="rounded-xl font-bold text-xs uppercase gap-2 text-blue-600 focus:bg-blue-50 cursor-pointer py-3">
                  <ArrowBigRightDash className="w-4 h-4" /> Registrar Check-in
                </DropdownMenuItem>
              )}

              {reserva.estado === "CHECKIN" && (
                <DropdownMenuItem onClick={() => handleUpdateEstado("CHECKOUT")} className="rounded-xl font-bold text-xs uppercase gap-2 text-slate-900 focus:bg-slate-100 cursor-pointer py-3">
                  <ArrowRightToLine className="w-4 h-4" /> Registrar Check-out
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="my-2" />

              {(reserva.estado === "PENDIENTE" || reserva.estado === "CONFIRMADA") && (
                <DropdownMenuItem onClick={() => handleUpdateEstado("NOSHOW")} className="rounded-xl font-bold text-xs uppercase gap-2 text-fuchsia-700 focus:bg-fuchsia-50 cursor-pointer py-2">
                  <UserMinus className="w-4 h-4" /> Marcar No-Show
                </DropdownMenuItem>
              )}

              {reserva.estado !== "CANCELADA" && reserva.estado !== "CHECKOUT" && reserva.estado !== "FINALIZADA" && (
                <DropdownMenuItem onClick={() => handleUpdateEstado("CANCELADA")} className="rounded-xl font-bold text-xs uppercase gap-2 text-rose-600 focus:bg-rose-50 cursor-pointer py-2">
                  <XCircle className="w-4 h-4" /> Cancelar Reserva
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}