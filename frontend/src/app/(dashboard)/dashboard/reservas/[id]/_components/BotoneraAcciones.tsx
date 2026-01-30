/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { EstadoReserva } from "@prisma/client";
import {
  Check,
  ArrowBigRightDash,
  ArrowRightToLine,
  XCircle,
  UserMinus,
  PlusCircle,
  CreditCard,
  Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateEstadoReserva } from "../../_actions";
import { toast } from "sonner";
import {
  MovimientoForm,
  MovimientoFormValues,
} from "@/components/forms/MovimientoForm"; // Asegúrate de que esta ruta sea correcta
import { crearMovimientoAction } from "../_actions";
import { customToast } from "@/lib/toast";
import { useRouter } from "next/navigation";



interface Props {
  reservaId: string;
  estadoActual: EstadoReserva;
  saldoPendiente: number;
}

export function BotoneraAcciones({
  reservaId,
  estadoActual,
  saldoPendiente,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [isPagoOpen, setIsPagoOpen] = useState(false);

  const router = useRouter();
  // MANEJADOR DE CAMBIO DE ESTADO (CONFIRMAR, CHECKIN, ETC)
  const handleUpdateEstado = async (nuevoEstado: EstadoReserva) => {
    if (nuevoEstado === "CHECKOUT" && saldoPendiente > 0) {
      return toast.error("No se puede realizar Check-out con saldo pendiente");
    }

    try {
      setLoading(true);
      const res = await updateEstadoReserva(reservaId, nuevoEstado);
      if (res.success) {
        toast.success(`Estado actualizado: ${nuevoEstado}`);
      } else {
        toast.error("Error al actualizar estado");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarPago = async (values: MovimientoFormValues) => {
    try {
      setLoading(true);
      // Llamamos a la acción del servidor que guarda en la BD
      const res = await crearMovimientoAction(values);

      if (res.success) {
        toast.success("Pago registrado correctamente");
        setIsPagoOpen(false);
      } else {
        toast.error(res.error || "Error al guardar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* SECCIÓN 1: CONTROL DE FLUJO (CHECK-IN / CHECK-OUT) */}
      <div className="space-y-3">
        <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-1">
          Flujo de Estancia
        </h2>

        {estadoActual === "PENDIENTE" && (
          <Button
            disabled={loading}
            onClick={() => handleUpdateEstado("CONFIRMADA")}
            className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest bg-[#80c0a0] hover:bg-[#52a67c] text-white border-b-4 border-[#52a67c] transition-all"
          >
            <Check className="w-5 h-5 mr-2" /> Confirmar Reserva
          </Button>
        )}

        {estadoActual === "CONFIRMADA" && (
          <Button
            onClick={() =>
              router.push(`/dashboard/reservas/${reservaId}/checkin`)
            }
            className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest bg-[#80a0c0] hover:bg-[#527ca6] text-white border-b-4 border-[#527ca6] transition-all"
          >
            <ArrowBigRightDash className="w-5 h-5 mr-2" /> Ir al Check-in
          </Button>
        )}

        {estadoActual === "CHECKIN" && (
          <Button
            disabled={loading}
            onClick={() => router.push(`/dashboard/reservas/${reservaId}/checkout`)}
            className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest bg-slate-800 hover:bg-slate-900 text-white border-b-4 border-black transition-all"
          >
            <ArrowRightToLine className="w-5 h-5 mr-2" /> Realizar Check-out
          </Button>
        )}
      </div>

      {/* SECCIÓN 2: GESTIÓN DE DINERO */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-1">
          Caja y Cargos
        </h2>

        <Button
          onClick={() => setIsPagoOpen(true)}
          variant="outline"
          className="w-full h-12 rounded-xl font-bold text-xs uppercase border-2 border-slate-200 hover:bg-slate-50 transition-all hover:border-emerald-200 group"
        >
          <CreditCard className="w-4 h-4 mr-2 text-emerald-500 group-hover:scale-110 transition-transform" />
          Registrar Pago
        </Button>

        <Button
          variant="outline"
          className="w-full h-12 rounded-xl font-bold text-xs uppercase border-2 border-slate-200 hover:bg-slate-50 transition-all hover:border-blue-200 group"
        >
          <PlusCircle className="w-4 h-4 mr-2 text-blue-500 group-hover:scale-110 transition-transform" />
          Cargar Consumo
        </Button>
      </div>

      {/* SECCIÓN 3: CANCELACIONES (Sólo si no hay check-in) */}
      {(estadoActual === "PENDIENTE" || estadoActual === "CONFIRMADA") && (
        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            disabled={loading}
            onClick={() => handleUpdateEstado("NOSHOW")}
            className="rounded-xl font-bold text-[10px] uppercase text-[#c080a0] hover:bg-rose-50"
          >
            <UserMinus className="w-3 h-3 mr-1" /> No-Show
          </Button>

          <Button
            variant="ghost"
            disabled={loading}
            onClick={() => handleUpdateEstado("CANCELADA")}
            className="rounded-xl font-bold text-[10px] uppercase text-rose-500 hover:bg-rose-50"
          >
            <XCircle className="w-3 h-3 mr-1" /> Cancelar
          </Button>
        </div>
      )}

      {/* --- MODAL DE PAGOS --- */}
      <Dialog open={isPagoOpen} onOpenChange={setIsPagoOpen}>
        <DialogContent className="sm:max-w-112.5 rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          {/* Header del Modal */}
          <div className="bg-emerald-600 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                <Wallet className="w-6 h-6" /> Registrar Ingreso
              </DialogTitle>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest">
                  Saldo pendiente:
                </span>
                <span className="text-sm font-black text-white">
                  ${saldoPendiente.toLocaleString()}
                </span>
              </div>
            </DialogHeader>
          </div>

          {/* Cuerpo del Modal con el Formulario */}
          <div className="p-6 bg-white">
            <MovimientoForm
              reservaId={reservaId}
              montoSugerido={saldoPendiente}
              onSuccess={async (values) => {
                try {
                  setLoading(true); // Para que el botón muestre el cargando

                  // ¡ESTO ES LO QUE FALTABA! Mandar los datos al servidor
                  const res = await crearMovimientoAction(values);

                  if (res.success) {
                    setIsPagoOpen(false);
                    customToast.success("Pago registrado en la base de datos");
                  } else {
                    toast.error(res.error || "Error al guardar");
                  }
                } catch (error) {
                  toast.error("Error crítico de conexión");
                } finally {
                  setLoading(false);
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
