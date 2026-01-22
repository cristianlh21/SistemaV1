// src/app/(dashboard)/dashboard/habitaciones/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { HabitacionHeader } from "./_components/HabitacionHeader";
import { HabitacionTabs } from "./_components/HabitacionTabs";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalleHabitacionPage({ params }: PageProps) {
  const { id } = await params;

  // Traemos la habitación y los tipos disponibles en paralelo para mayor velocidad
  const [habitacion, tipos] = await Promise.all([
    prisma.habitacion.findUnique({
      where: { id },
      include: {
        tipoActual: true,
        tipoBase: true,
      },
    }),
    prisma.tipoHabitacion.findMany(), // <--- Necesario para los selects del form
  ]);

  if (!habitacion) notFound();

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 space-y-6">
      <HabitacionHeader habitacion={habitacion} />

      {/* Enviamos tanto la habitación como la lista de tipos */}
      <HabitacionTabs 
        habitacion={habitacion} 
        tiposDisponibles={tipos} 
      />
    </div>
  );
}