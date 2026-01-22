import { Prisma } from "@prisma/client";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { HabitacionCardHeader } from "./HabitacionCardHeader";
import { HabitacionCardContent } from "./HabitacionCardContent";
import { EstadoLimpiezaToggle } from "./EstadoLimpiezaToggle";
import { EstadoMantenimientoToggle } from "./EstadoMantenimientoToggle";


// 1. Definimos un tipo que incluya la relación 'tipoActual'
// Esto le dice a TS: "Es una Habitacion, pero trae el payload de tipoActual"
type HabitacionCompleta = Prisma.HabitacionGetPayload<{
  include: { 
    tipoActual: true; 
    tipoBase: true; 
  };
}>;

export function HabitacionCard({ habitacion }: { habitacion: HabitacionCompleta }) {
  const isOcupada = habitacion.estadoOcupacion === "OCUPADA";
  const enMantenimiento = habitacion.mantenimiento;

  // Clase dinámica para el borde y sombra
  const cardStyles = enMantenimiento 
    ? "border-rose-200 bg-rose-50/20 shadow-none" 
    : isOcupada 
    ? "border-blue-400 bg-white shadow-blue-50" 
    : "border-slate-200 bg-white hover:border-slate-300";

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-2 ${cardStyles}`}>
      
      <Link href={`/dashboard/habitaciones/${habitacion.id}`}>
        <HabitacionCardHeader 
          numero={habitacion.numero}
          estadoOcupacion={habitacion.estadoOcupacion}
          estadoLimpieza={habitacion.estadoLimpieza}
          mantenimiento={habitacion.mantenimiento}
        />

        <HabitacionCardContent 
          tipoActual={habitacion.tipoActual.nombre}
          tipoBase={habitacion.tipoBase.nombre}
          // Aquí podríamos pasar el nombre real del huésped en el futuro
          nombreHuesped={isOcupada ? "García, Estanislao" : null}
        />
      </Link>

      {/* Footer con botones atomizados */}
      <div className={`grid grid-cols-2 divide-x border-t ${isOcupada ? 'bg-blue-50/30' : 'bg-slate-50/30'}`}>
        <div className="flex justify-center p-1">
          <EstadoLimpiezaToggle 
            habitacionId={habitacion.id} 
            estadoActual={habitacion.estadoLimpieza} 
            variant="icon" 
          />
        </div>
        <div className="flex justify-center p-1">
          <EstadoMantenimientoToggle 
            habitacionId={habitacion.id} 
            enMantenimiento={habitacion.mantenimiento} 
            variant="icon" 
          />
        </div>
      </div>
    </Card>
  );
}