// src/app/(dashboard)/dashboard/reservas/[id]/checkout/_components/ModalPagoCheckout.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Wallet } from "lucide-react";
import { MovimientoForm } from "@/components/forms/MovimientoForm";
import { customToast } from "@/lib/toast";
import { crearMovimientoActionCheckout } from "../_actions";

export function ModalPagoCheckout({ reservaId, saldo }: { reservaId: string, saldo: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex-1 bg-white border-2 border-slate-200 py-4 rounded-2xl font-black uppercase text-xs hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-3"
      >
        <CreditCard className="w-4 h-4 text-emerald-500" />
        Registrar Pago
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-emerald-600 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                <Wallet className="w-6 h-6" /> Registrar Ingreso
              </DialogTitle>
              <p className="text-xs text-emerald-100 font-bold uppercase mt-1">
                Saldo restante: ${saldo.toLocaleString()}
              </p>
            </DialogHeader>
          </div>
          <div className="p-6 bg-white">
            <MovimientoForm 
              reservaId={reservaId} 
              montoSugerido={saldo} 
              onSuccess={async (values) => {
                const res = await crearMovimientoActionCheckout(values);
                if (res.success) {
                  setOpen(false);
                  customToast.success("Pago registrado y saldo actualizado");
                } else {
                  customToast.error(res.error || "Error al registrar el pago");
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}