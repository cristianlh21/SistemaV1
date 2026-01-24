"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Loader2 } from "lucide-react";
import { prepararDatosEdicion } from "../../_actions";
import { ReservaWizard } from "../ReservaWizard"; // Tu Wizard actual
import { toast } from "sonner";
import { ReservaWizardData } from "../ReservaWizard/types";

export function DialogModificar({ reservaId }: { reservaId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<ReservaWizardData | null>(null);

  const handleOpen = async (isOpen: boolean) => {
    if (isOpen) {
      setLoading(true);
      try {
        const datos = await prepararDatosEdicion(reservaId);
        if (datos) {
          setInitialData(datos);
          setOpen(true);
        } else {
          toast.error("No se pudieron cargar los datos de la reserva");
        }
      } catch (error) {
        toast.error("Error de conexión");
      } finally {
        setLoading(false);
      }
    } else {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button 
          disabled={loading}
          className="w-full h-16 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] gap-3 border border-white/10 transition-all active:scale-95"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Settings className="w-4 h-4 text-orange-400" />
          )}
          Modificar Reserva
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] w-full lg:max-w-6xl h-[90vh] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl flex flex-col">
        
        {/* Encabezado fijo */}
        <DialogHeader className="p-6 md:p-8 bg-slate-900 text-white shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                Modificar Reserva
              </DialogTitle>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Ajustando estadía de: <span className="text-orange-400">{initialData?.huespedApellido}, {initialData?.huespedNombre}</span>
              </p>
            </div>
            {/* Opcional: Badge de estado actual */}
            {initialData && (
              <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest">
                Estado: {initialData.estadoActual}
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Área de contenido con scroll independiente */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="max-w-5xl mx-auto py-6 px-4 md:px-8">
            {initialData && (
              <ReservaWizard 
                isEdit={true} 
                initialData={initialData} 
                onClose={() => setOpen(false)} 
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}