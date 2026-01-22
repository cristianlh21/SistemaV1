"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wrench, ShieldCheck } from "lucide-react";
import { actualizarEstadoMantenimiento } from "../_actions";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Props {
  habitacionId: string;
  enMantenimiento: boolean;
  variant?: "full" | "icon" | "switch"; // Añadimos 'switch' para el formulario
}

export function EstadoMantenimientoToggle({ habitacionId, enMantenimiento, variant = "full" }: Props) {
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async (e?: React.MouseEvent | boolean) => {
    // Si es un evento de ratón, prevenimos navegación
    if (typeof e !== 'boolean') e?.preventDefault();
    
    setIsPending(true);
    // Si recibimos un booleano (del switch) lo usamos, si no, invertimos el actual
    const nuevoEstado = typeof e === 'boolean' ? e : !enMantenimiento;
    
    const res = await actualizarEstadoMantenimiento(habitacionId, nuevoEstado);
    
    setIsPending(false);
    if (res.success) {
      toast.success(nuevoEstado ? "Habitación en mantenimiento" : "Habitación operativa");
    } else {
      toast.error("Error al cambiar estado");
    }
  };

  // VARIANTE ICONO (Para la Card del Dashboard)
  if (variant === "icon") {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        disabled={isPending}
        onClick={(e) => handleToggle(e)}
        className={enMantenimiento ? "text-orange-500" : "text-muted-foreground/30"}
      >
        <Wrench className="w-4 h-4" />
      </Button>
    );
  }

  // VARIANTE SWITCH (Para el formulario de Configuración)
  if (variant === "switch") {
    return (
      <div className="flex items-center space-x-2">
        <Switch 
          id="maint-mode" 
          checked={enMantenimiento} 
          onCheckedChange={(checked) => handleToggle(checked)}
          disabled={isPending}
        />
        <Label htmlFor="maint-mode">Modo Mantenimiento</Label>
      </div>
    );
  }

  // VARIANTE FULL (Para el Panel de Operaciones)
  return (
    <Button 
      variant={enMantenimiento ? "destructive" : "outline"}
      disabled={isPending}
      onClick={(e) => handleToggle(e)}
      className="w-full h-12 gap-3 font-bold"
    >
      {enMantenimiento ? <Wrench className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
      {enMantenimiento ? "QUITAR DE MANTENIMIENTO" : "PONER EN MANTENIMIENTO"}
    </Button>
  );
}