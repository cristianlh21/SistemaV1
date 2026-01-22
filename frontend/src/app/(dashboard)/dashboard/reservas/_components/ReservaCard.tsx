/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/(dashboard)/dashboard/reservas/_components/ReservaCard.tsx
"use client";

import { Prisma, EstadoReserva, TipoMovimiento } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  DollarSign,
  User,
  Calculator,
  MoreVertical,
  Eye,
  Check,
  UserMinus,
  XCircle,
  ArrowBigRightDash,
  ArrowRightToLine,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
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

export type ReservaCompleta = Prisma.ReservaGetPayload<{
  include: {
    habitacion: true;
    titular: true;
    movimientos: true;
    tipoConfiguracion: true;
  };
}>;

export function ReservaCard({ reserva }: { reserva: ReservaCompleta }) {
  // 1. LÓGICA FINANCIERA
  const noches =
    differenceInDays(
      new Date(reserva.fechaSalida),
      new Date(reserva.fechaEntrada),
    ) || 1;
  const totalEstancia = noches * reserva.precioPactado;
  const totalPagado = reserva.movimientos
    .filter((m) => m.tipo === TipoMovimiento.INGRESO)
    .reduce((acc, m) => acc + m.monto, 0);
  const saldoPendiente = totalEstancia - totalPagado;

  // 2. MANEJADORES DE ACCIÓN
  const handleUpdateEstado = async (nuevoEstado: EstadoReserva) => {
    try {
      const res = await updateEstadoReserva(reserva.id, nuevoEstado);
      if (res.success) {
        toast.success(`Reserva actualizada a ${nuevoEstado}`);
      } else {
        toast.error("Error al actualizar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  // 3. PALETA DE COLORES PERSONALIZADA
  const getEstadoStyles = (estado: EstadoReserva) => {
    switch (estado) {
      case "PENDIENTE":
        return "bg-[#cda073] text-white border-[#b77c41] shadow-[#f8f2e3]";
      case "CONFIRMADA":
        return "bg-[#80c0a0] text-white border-[#52a67c] shadow-[#e6f5f1]";
      case "NOSHOW":
        return "bg-[#a080c0] text-white border-[#7c52a6] shadow-[#f1e6f5]";
      case "CANCELADA":
        return "bg-[#c080a0] text-white border-[#a6527c] shadow-[#f5e6ea]";
      case "CHECKIN":
        return "bg-blue-600 text-white border-blue-700 shadow-blue-100";
      case "CHECKOUT":
      case "FINALIZADA":
        return "bg-slate-800 text-white border-slate-900 shadow-slate-100";
      default:
        return "bg-slate-400 text-white border-slate-500";
    }
  };

  // 3. PALETA DE COLORES PERSONALIZADA
  const getEstadoNombreStyles = (estado: EstadoReserva) => {
    switch (estado) {
      case "PENDIENTE":
        return "text-[#cda073]";
      case "CONFIRMADA":
        return "text-[#80c0a0]";
      case "NOSHOW":
        return "text-[#a080c0]";
      case "CANCELADA":
        return "text-[#c080a0]";
      case "CHECKIN":
        return "bg-blue-600 text-white border-blue-700 shadow-blue-100";
      case "CHECKOUT":
      case "FINALIZADA":
        return "bg-slate-800 text-white border-slate-900 shadow-slate-100";
      default:
        return "bg-slate-400 text-white border-slate-500";
    }
  };

  // 3. PALETA DE COLORES PERSONALIZADA
  const getBorderStyles = (estado: EstadoReserva) => {
    switch (estado) {
      case "PENDIENTE":
        return "border-[#cda073]";
      case "CONFIRMADA":
        return "border-[#80c0a0]";
      case "NOSHOW":
        return "border-[#a080c0]";
      case "CANCELADA":
        return "border-[#c080a0]";
      case "CHECKIN":
        return "bg-blue-600 text-white border-blue-700 shadow-blue-100";
      case "CHECKOUT":
      case "FINALIZADA":
        return "bg-slate-800 text-white border-slate-900 shadow-slate-100";
      default:
        return "bg-slate-400 text-white border-slate-500";
    }
  };

  return (
    <Card className={`group ${getBorderStyles(reserva.estado)}`}>
      <div className="flex items-center p-2 gap-6">
        {/* AVATAR: HABITACIÓN (Color Dinámico) */}
        <div
          className={`shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg border-b-4 transition-colors duration-500 ${getEstadoStyles(reserva.estado)}`}
        >
          <span className="text-[9px] uppercase font-black tracking-tighter opacity-80 leading-none mb-1">
            Hab
          </span>
          <span className="text-2xl font-black leading-none">
            {reserva.habitacion.numero}
          </span>
        </div>

        {/* INFO HUÉSPED */}
        <div className="flex-1 min-w-50">
          <div className="flex items-center gap-1 mb-0.5">
            <User className="w-3 h-3 text-slate-800" />
            <span className="text-xs font-thin tracking-widest text-slate-800">
              Huésped Titular
            </span>
          </div>
          <div className="flex-1 min-w-50">
            <h3
              className={`text-lg font-black leading-tight uppercase ${getEstadoNombreStyles(reserva.estado)}`}
            >
              {reserva.titular.apellido}
            </h3>
            <p
              className={`text-base font-extralight leading-tight capitalize ${getEstadoNombreStyles(reserva.estado)}`}
            >
              {reserva.titular.nombre}
            </p>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span
              className={`text-[9px] font-black px-2 py-0.5 rounded border capitalize tracking-tighter ${getEstadoStyles(reserva.estado)}`}
            >
              {reserva.tipoConfiguracion?.nombre || "Estándar"}
            </span>
          </div>
        </div>

        {/* CRONOGRAMA */}
        <div className="flex-[1.2] flex items-center justify-center gap-4 px-6 border-x border-primary/20">
          <div className="text-center">
            <p className="text-[9px] font-black uppercase text-[#52a67c] mb-1 leading-none">
              In
            </p>
            <p className="text-sm font-light text-[#52a67c] uppercase leading-none">
              {format(new Date(reserva.fechaEntrada), "dd MMM", { locale: es })}
            </p>
          </div>

          <div className="flex flex-col items-center gap-1 opacity-40">
            <span className="text-[8px] font-black text-foreground">
              {noches}n
            </span>
            <ArrowRightToLine className="w-4 h-4 text-primary" />
          </div>

          <div className="text-center">
            <p className="text-[9px] font-black uppercase text-[#a6527c] mb-1 leading-none">
              Out
            </p>
            <p className="text-sm font-light text-[#a6527c] uppercase leading-none">
              {format(new Date(reserva.fechaSalida), "dd MMM", { locale: es })}
            </p>
          </div>
        </div>

        {/* FINANZAS */}
        <div className="flex-[1.5] flex gap-8 pl-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-foreground">
              <Calculator className="w-3 h-3 text-foreground" />
              <span className="text-[9px] font-black capitalize tracking-tighter">
                Total
              </span>
            </div>
            <p className="text-base font-black text-slate-800 leading-none">
              ${totalEstancia.toLocaleString()}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-destructive">
              <DollarSign className="w-3 h-3" />
              <span className="text-[9px] font-black uppercase tracking-tighter">
                Saldo
              </span>
            </div>
            <p
              className={`text-base font-black leading-none ${saldoPendiente > 0 ? "text-[#b54a35]" : "text-[#35b54a]"}`}
            >
              ${saldoPendiente.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ESTADO Y MENÚ (Colores coordinados) */}
        <div className="shrink-0 flex items-center gap-3 min-w-40 justify-end">
          <Badge
            className={`${getEstadoStyles(reserva.estado)} border-none px-4 py-2 font-black text-[10px] shadow-sm uppercase tracking-widest transition-colors duration-500`}
          >
            {reserva.estado.replace("_", " ")}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-slate-100 h-9 w-9"
              >
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-2xl p-2 shadow-xl border-slate-200"
            >
              <DropdownMenuLabel className="text-[9px] font-black uppercase text-slate-400 px-2 pb-2 tracking-widest">
                Acciones Rápidas
              </DropdownMenuLabel>

              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/reservas/${reserva.id}`}
                  className="cursor-pointer font-bold uppercase text-[10px]"
                >
                  <Eye className="w-4 h-4 mr-2" /> Ver Ficha Maestra
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />

              {/* LÓGICA DE TRANSICIONES DE ESTADO */}
              {reserva.estado === "PENDIENTE" && (
                <DropdownMenuItem
                  onClick={() => handleUpdateEstado("CONFIRMADA")}
                  className="rounded-xl font-bold text-xs uppercase gap-2 text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 cursor-pointer py-2.5"
                >
                  <Check className="w-4 h-4" /> Confirmar Reserva
                </DropdownMenuItem>
              )}

              {(reserva.estado === "PENDIENTE" ||
                reserva.estado === "CONFIRMADA") && (
                <DropdownMenuItem
                  onClick={() => handleUpdateEstado("NOSHOW")}
                  className="rounded-xl font-bold text-xs uppercase gap-2 text-fuchsia-700 focus:text-fuchsia-800 focus:bg-fuchsia-50 cursor-pointer py-2.5"
                >
                  <UserMinus className="w-4 h-4" /> Marcar No-Show
                </DropdownMenuItem>
              )}

              {reserva.estado !== "CANCELADA" &&
                reserva.estado !== "CHECKOUT" && (
                  <DropdownMenuItem
                    onClick={() => handleUpdateEstado("CANCELADA")}
                    className="rounded-xl font-bold text-xs uppercase gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer py-2.5"
                  >
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
