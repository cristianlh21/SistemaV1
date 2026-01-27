/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { format, addDays, isBefore, isAfter } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Save, AlertCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateFechasReserva } from "../_actions";
import { DateRange } from "react-day-picker";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reservaId: string;
  fechaEntradaOriginal: Date;
  fechaSalidaOriginal: Date;
}

export function DialogModificarFechas({ isOpen, onClose, reservaId, fechaEntradaOriginal, fechaSalidaOriginal }: Props) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(fechaEntradaOriginal),
    to: new Date(fechaSalidaOriginal),
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!dateRange.from || !dateRange.to) return;
    
    // Validación de seguridad: no permitir entrada después de salida
    if (isAfter(dateRange.from, dateRange.to) || dateRange.from.getTime() === dateRange.to.getTime()) {
      return toast.error("La fecha de salida debe ser al menos un día después de la entrada");
    }

    try {
      setIsSaving(true);
      const res = await updateFechasReserva(reservaId, dateRange.from, dateRange.to);
      if (res.success) {
        toast.success("Fechas actualizadas correctamente");
        onClose();
      } else {
        toast.error(res.error || "Error al actualizar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125 rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <CalendarIcon className="text-primary" /> Modificar Estancia
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center">
          <Calendar
            mode="range"
            defaultMonth={dateRange.from}
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range: DateRange | undefined) => {
              if (range?.from) {
                // Si solo selecciona entrada, forzamos salida +1 día automáticamente
                const nextTo = range.to || addDays(range.from, 1);
                setDateRange({ from: range.from, to: nextTo });
              }
            }}
            locale={es}
            className="rounded-2xl border shadow-sm"
          />
          
          <div className="grid grid-cols-2 gap-4 w-full mt-6">
            <div className="p-3 bg-slate-50 rounded-xl border text-center">
              <p className="text-[10px] font-black uppercase text-slate-400">Nueva Entrada</p>
              <p className="font-bold text-slate-700">{format(dateRange.from, "dd/MM/yyyy")}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border text-center">
              <p className="text-[10px] font-black uppercase text-slate-400">Nueva Salida</p>
              <p className="font-bold text-slate-700">{format(dateRange.to, "dd/MM/yyyy")}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="font-bold uppercase text-xs">Cancelar</Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="font-black uppercase text-xs tracking-widest bg-primary px-8"
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}