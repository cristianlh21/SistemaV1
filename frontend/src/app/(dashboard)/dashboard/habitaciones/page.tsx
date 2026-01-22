import { prisma } from "@/lib/prisma";
import { Piso } from "@prisma/client";
import { Separator } from "@/components/ui/separator";
import { HabitacionCard } from "./_components/HabitacionCard";

// 1. Definimos el orden lógico de los pisos para el recepcionista
const ORDEN_PISOS: Piso[] = [
  "PLANTA_BAJA",
  "PRIMER_PISO",
  "SEGUNDO_PISO",
  "TERCER_PISO",
  "CUARTO_PISO",
];

export default async function HabitacionesPage() {
  // 2. Fetch de datos con la relación que TS nos pedía
  const habitaciones = await prisma.habitacion.findMany({
    include: {
      tipoActual: true,
      tipoBase: true,
    },
    orderBy: { numero: "asc" },
  });

  // 3. Agrupamos las habitaciones por piso
  const habitacionesPorPiso = habitaciones.reduce((acc, hab) => {
    const piso = hab.piso;
    if (!acc[piso]) acc[piso] = [];
    acc[piso].push(hab);
    return acc;
  }, {} as Record<Piso, typeof habitaciones>);

  return (
    <div className="p-6 space-y-8">
      {/* Encabezado Principal */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Estado del Hotel</h1>
        <p className="text-muted-foreground">
          Vista general de habitaciones y estados de limpieza.
        </p>
      </div>

      {/* 4. Renderizado por secciones de Piso */}
      <div className="space-y-12">
        {ORDEN_PISOS.map((pisoKey) => {
          const habitacionesEnPiso = habitacionesPorPiso[pisoKey] || [];
          
          // Si no hay habitaciones en ese piso, no mostramos la sección
          if (habitacionesEnPiso.length === 0) return null;

          return (
            <section key={pisoKey} className="space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold whitespace-nowrap uppercase tracking-widest text-primary">
                  {pisoKey.replace("_", " ")}
                </h2>
                <Separator className="flex-1" />
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                  {habitacionesEnPiso.length} Habitaciones
                </span>
              </div>

              {/* Grid de Habitaciones */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {habitacionesEnPiso.map((hab) => (
                  <HabitacionCard key={hab.id} habitacion={hab} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}