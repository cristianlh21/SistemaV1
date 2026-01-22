// src/app/(dashboard)/dashboard/reservas/_components/detalle/DialogPago.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { MovimientoForm, MovimientoFormValues } from "@/components/forms/MovimientoForm";
import { registrarPagoAction } from "../../_actions"; // Importamos la acción
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // O la librería de alertas que uses

export function DialogPago({ reservaId, titularNombre }: { reservaId: string; titularNombre: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleGuardarPago = async (values: MovimientoFormValues) => {
    setIsPending(true);
    const result = await registrarPagoAction(reservaId, values);
    
    if (result.success) {
      toast.success("Pago registrado correctamente");
      setOpen(false);
      router.refresh(); // Esto actualiza el saldo en la CardFinanzas automáticamente
    } else {
      toast.error("Hubo un error al procesar el pago");
    }
    setIsPending(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-16 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] gap-3 border border-white/10">
          <CreditCard className="w-4 h-4 text-emerald-400" /> Registrar Pago
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-106.25 rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter">Registrar Pago</DialogTitle>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Titular: {titularNombre}</p>
        </DialogHeader>

        <div className="py-4">
          <MovimientoForm 
            reservaId={reservaId} 
            onSuccess={handleGuardarPago}
            isSubmitting={isPending}
            submitLabel="Confirmar y Guardar Pago"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}