// src/app/(dashboard)/dashboard/planning/page.tsx
import { prisma } from "@/lib/prisma";
import { 
  startOfMonth, 
  endOfMonth, 
} from "date-fns";
import { PlanningGrid } from "./_components/PlanningGrid";
import { PlanningHeader } from "./_components/PlanningHeader";

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; anio?: string }>;
}) {
  const params = await searchParams;
  
  // 1. Determinar el mes y año a visualizar
  const hoy = new Date();
  const mes = params.mes ? parseInt(params.mes) : hoy.getMonth() + 1; // 1-12
  const anio = params.anio ? parseInt(params.anio) : hoy.getFullYear();

  // 2. Crear la fecha de inicio y fin del mes seleccionado
  const fechaReferencia = new Date(anio, mes - 1, 1);
  const inicioVista = startOfMonth(fechaReferencia);
  const finVista = endOfMonth(fechaReferencia);

  // 3. Consulta de Prisma: Traer habitaciones y reservas que SE SOLAPAN con este mes
  const habitaciones = await prisma.habitacion.findMany({
    include: {
      tipoActual: true,
      reservas: {
        where: {
          estado: { not: "CANCELADA" },
          OR: [
            // La reserva empieza dentro del mes
            { fechaEntrada: { gte: inicioVista, lte: finVista } },
            // La reserva termina dentro del mes
            { fechaSalida: { gte: inicioVista, lte: finVista } },
            // La reserva empezó antes y termina después (cruza todo el mes)
            {
              AND: [
                { fechaEntrada: { lte: inicioVista } },
                { fechaSalida: { gte: finVista } },
              ],
            },
          ],
        },
        include: { titular: true },
      },
    },
    orderBy: { numero: "asc" },
  });

  return (
    <div className="space-y-6 p-6">
      {/* Pasamos mes y anio para que el Header sepa dónde está parado */}
      <PlanningHeader mes={mes} anio={anio} />
      
      {/* El Grid recibirá las habitaciones y el rango de días a dibujar */}
      <PlanningGrid 
        habitaciones={habitaciones} 
        inicio={inicioVista} 
        fin={finVista} 
      />
    </div>
  );
}