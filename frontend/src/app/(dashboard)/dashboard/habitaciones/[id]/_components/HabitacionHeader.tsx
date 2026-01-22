import { Prisma } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

type HabitacionCompleta = Prisma.HabitacionGetPayload<{
  include: { tipoActual: true; tipoBase: true };
}>;

export function HabitacionHeader({ habitacion }: { habitacion: HabitacionCompleta }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-6xl font-black tracking-tighter text-primary">
          {habitacion.numero}
        </h1>
        <div className="mt-1">
          <p className="text-xl font-bold">{habitacion.tipoActual.nombre}</p>
          <p className="text-sm text-muted-foreground italic">
            Base: {habitacion.tipoBase.nombre}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-1">
        <Badge variant="outline" className="px-4 py-1.5 border-2 border-primary/20">
          {habitacion.estadoOcupacion}
        </Badge>
        <Badge variant="outline" className="px-4 py-1.5 border-2 border-primary/20">
          {habitacion.estadoLimpieza}
        </Badge>
      </div>
    </div>
  );
}