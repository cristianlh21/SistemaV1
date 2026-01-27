"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { MovimientoForm, MovimientoFormValues } from "@/components/forms/MovimientoForm";
import { ReservaWizardData } from "../../../types";
import { Wallet, Receipt, Plus, CheckCircle2, AlertCircle, TrendingDown } from "lucide-react";
import { differenceInDays } from "date-fns";

interface Props {
  formData: ReservaWizardData;
  updateFormData: (newData: Partial<ReservaWizardData>) => void;
}

export default function StepConfirmacion({ formData, updateFormData }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePagoRegistrado = (values: MovimientoFormValues) => {
    updateFormData({
      adelanto: values.monto,
      metodoPagoAdelanto: values.metodoPago,
      notasPago: values.descripcion 
    });
    setIsDialogOpen(false);
  };

  // Cálculos económicos
  const noches = formData.fechaEntrada && formData.fechaSalida 
    ? Math.abs(differenceInDays(formData.fechaSalida, formData.fechaEntrada)) 
    : 0;
  
  const totalEstadia = noches * formData.precioPactado;
  const montoAdelanto = formData.adelanto || 0;
  const saldoPendiente = totalEstadia - montoAdelanto;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> 
          Revisión de Cuenta y Pago
        </h2>
        <p className="text-sm text-muted-foreground">Verifica el saldo final y registra pagos adelantados si los hay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* RESUMEN DE CUENTA ESTILO DARK CARD */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Balance de Reserva</h3>
          <Card className="p-6 bg-slate-900 text-white border-none shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-24 h-24 text-white" />
            </div>
            
            <div className="relative z-10 space-y-5">
               <div className="flex justify-between items-center opacity-60 text-xs font-bold uppercase">
                  <span>Subtotal ({noches} noches)</span>
                  <span>${totalEstadia.toLocaleString()}</span>
               </div>
               
               <div className="flex justify-between items-center text-emerald-400 border-b border-white/10 pb-4">
                  <span className="text-xs font-black uppercase">Entrega / Seña</span>
                  <span className="font-black text-2xl">- ${montoAdelanto.toLocaleString()}</span>
               </div>

               <div className="pt-2 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase opacity-50 font-black tracking-widest mb-1">Total a cobrar en Check-in</p>
                    <p className="text-4xl font-black tracking-tighter">${saldoPendiente.toLocaleString()}</p>
                  </div>
               </div>
            </div>
          </Card>
        </div>

        {/* SECCIÓN DE GESTIÓN DE PAGOS */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gestión de Cobro</h3>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            {montoAdelanto > 0 ? (
              <Card className="p-5 border-2 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 border-dashed animate-in zoom-in-95">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Pago Confirmado</p>
                      <p className="font-bold text-slate-700 uppercase leading-tight mt-0.5">{formData.metodoPagoAdelanto?.replace(/_/g, " ")}</p>
                      <p className="text-xs text-slate-500 italic mt-1 max-w-45 truncate">{formData.notasPago}</p>
                    </div>
                  </div>
                  <DialogTrigger asChild>
                    <Button variant="link" className="text-emerald-700 font-bold text-xs h-auto p-0 hover:text-emerald-900">
                      CORREGIR
                    </Button>
                  </DialogTrigger>
                </div>
              </Card>
            ) : (
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-[140px] border-dashed border-2 flex flex-col gap-3 hover:bg-slate-50 hover:border-primary transition-all group">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Plus className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                  </div>
                  <div className="text-center">
                    <span className="block font-black text-slate-600 uppercase text-xs tracking-widest">Añadir Seña</span>
                    <span className="text-[10px] text-slate-400 font-medium italic mt-1">Recomendado para garantizar reserva</span>
                  </div>
                </Button>
              </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-106.25">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 uppercase tracking-tighter font-black">
                  <Wallet className="w-5 h-5 text-primary" />
                  Registro de Ingreso
                </DialogTitle>
              </DialogHeader>
              <div className="py-2">
                <MovimientoForm 
                  onSuccess={handlePagoRegistrado}
                  defaultMonto={montoAdelanto}
                  defaultMetodo={formData.metodoPagoAdelanto}
                  defaultDescripcion={formData.notasPago}
                  submitLabel={montoAdelanto > 0 ? "Actualizar Pago" : "Confirmar Seña"}
                />
              </div>
            </DialogContent>
          </Dialog>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
             <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
             <p className="text-[11px] text-amber-800 leading-normal font-medium italic">
                Asegúrate de que el medio de pago coincida con la realidad (Efectivo en caja o comprobante de banco) antes de confirmar la reserva final.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}