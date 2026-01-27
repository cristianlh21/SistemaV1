"use server";

import { HabitacionConTipo } from "@/app/(dashboard)/dashboard/reservas/types";
import { prisma } from "@/lib/prisma";

export async function getHabitacionesDisponibles(
  fechaEntrada: Date,
  fechaSalida: Date,
) {
  try {
    // Buscamos habitaciones ocupadas por reservas activas
    const ocupadas = await prisma.reserva.findMany({
      where: {
        // Solo contamos reservas que NO estén canceladas ni sean No-Show
        // ya que ambos estados liberan la habitación.
        NOT: [{ estado: "CANCELADA" }, { estado: "NOSHOW" }],
        // Lógica de solapamiento de fechas
        fechaEntrada: { lt: fechaSalida },
        fechaSalida: { gt: fechaEntrada },
      },
      select: { habitacionId: true },
    });

    const idsOcupados = ocupadas.map((r) => r.habitacionId);

    const disponibles = await prisma.habitacion.findMany({
      where: {
        id: { notIn: idsOcupados },
        mantenimiento: false, // Habitaciones que no estén en reparación
      },
      include: {
        tipoBase: true,
        tipoActual: true,
      },
      orderBy: {
        numero: "asc",
      },
    });

    return disponibles as HabitacionConTipo[];
  } catch (error) {
    console.error("Error al obtener disponibilidad:", error);
    return [];
  }
}
