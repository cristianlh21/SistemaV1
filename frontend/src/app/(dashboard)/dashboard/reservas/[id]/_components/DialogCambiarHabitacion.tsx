/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { BedDouble, Check, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Importamos ScrollArea para controlar el alto
import { toast } from "sonner";
import { getHabitacionesDisponibles, updateHabitacionReserva } from "../_actions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reservaId: string;
  checkIn: Date;
  checkOut: Date;
  habitacionActualId: string;
}

export function DialogCambiarHabitacion({ isOpen, onClose, reservaId, checkIn, checkOut, habitacionActualId }: Props) {
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) cargarDisponibles();
  }, [isOpen]);

  const cargarDisponibles = async () => {
    setLoading(true);
    const res = await getHabitacionesDisponibles(reservaId, checkIn, checkOut);
    if (res.success) setHabitaciones(res.data || []);
    setLoading(false);
  };

  const handleSelect = async (id: string) => {
    if (id === habitacionActualId) return onClose();
    try {
      setIsSaving(true);
      const res = await updateHabitacionReserva(reservaId, id);
      if (res.success) {
        toast.success("Habitación cambiada");
        onClose();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Reducimos el max-width a xs (384px) y quitamos paddings excesivos */}
      <DialogContent className="max-w-xs sm:max-w-sm rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
        
        {/* Header más compacto y colorido */}
        <div className="bg-slate-900 p-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-primary" /> 
              Seleccionar Unidad
            </DialogTitle>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
              Disponibles para tu rango de fechas
            </p>
          </DialogHeader>
        </div>

        {/* Contenedor con scroll para que no se salga de la pantalla */}
        <ScrollArea className="max-h-[60vh] p-4 bg-slate-50">
          {loading ? (
            <div className="py-12 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
              <span className="text-[10px] font-black uppercase text-slate-400">Buscando...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {habitaciones.map((hab) => (
                <button
                  key={hab.id}
                  disabled={isSaving}
                  onClick={() => handleSelect(hab.id)}
                  className={`
                    relative group py-3 px-2 rounded-2xl border-2 transition-all flex flex-col items-center
                    ${hab.id === habitacionActualId 
                      ? "border-primary bg-white shadow-md ring-2 ring-primary/10" 
                      : "border-white bg-white hover:border-primary/40 hover:shadow-sm"}
                  `}
                >
                  <span className={`text-base font-black ${hab.id === habitacionActualId ? "text-primary" : "text-slate-700"}`}>
                    {hab.numero}
                  </span>
                  <span className="text-[8px] uppercase font-black text-slate-400 truncate w-full text-center">
                    {hab.tipoBase?.nombre || "N/A"}
                  </span>
                  
                  {hab.id === habitacionActualId && (
                    <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5">
                      <Check className="w-3 h-3 stroke-[4px]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer simple para cerrar */}
        <div className="p-3 bg-white border-t border-slate-100 flex justify-center">
          <Button variant="ghost" onClick={onClose} className="text-[10px] font-black uppercase text-slate-400 h-8 hover:bg-slate-50">
            Cerrar ventana
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}