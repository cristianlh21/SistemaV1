"use client";

import { useState } from "react";
import { Limpieza } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Trash2 } from "lucide-react"; // Nuevos íconos
import { cambiarEstadoLimpieza } from "../_actions"; 
import { customToast } from "@/lib/toast";

interface Props {
  habitacionId: string;
  estadoActual: Limpieza;
  variant?: "full" | "icon";
}

export function EstadoLimpiezaToggle({ habitacionId, estadoActual, variant = "full" }: Props) {
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    setIsPending(true);
    
    const nuevoEstado = estadoActual === "LIMPIA" ? "SUCIA" : "LIMPIA";
    const res = await cambiarEstadoLimpieza(habitacionId, nuevoEstado);
    
    setIsPending(false);
    if (res.success) customToast.success(`Habitación ${nuevoEstado.toLowerCase()}`);
  };

  // Definimos qué ícono y color usar según el estado actual
  const isLimpia = estadoActual === "LIMPIA";
  const Icono = isLimpia ? BadgeCheck : Trash2;
  const colorClass = isLimpia ? "text-emerald-500" : "text-rose-500";

  // VARIANTE ICONO (Para la Card)
  if (variant === "icon") {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        disabled={isPending}
        onClick={handleToggle}
        className={`${colorClass} hover:bg-muted`}
      >
        <Icono className="w-5 h-5" />
      </Button>
    );
  }

  // VARIANTE FULL (Para el Panel de Operaciones)
  return (
    <Button 
      variant={isLimpia ? "outline" : "destructive"} // Si está sucia, el botón es más llamativo
      disabled={isPending}
      onClick={handleToggle}
      className="w-full h-12 gap-3 font-bold"
    >
      <Icono className="w-5 h-5" />
      {isLimpia ? "MARCAR COMO SUCIA" : "MARCAR COMO LIMPIA"}
    </Button>
  );
}