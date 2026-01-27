"use server";

import { prisma } from "@/lib/prisma";

export async function getTiposHabitacion() {
  try {
    const tipos = await prisma.tipoHabitacion.findMany({
      orderBy: {
        capacidad: 'asc', // Los ordena de la más chica a la más grande
      },
    });
    return tipos;
  } catch (error) {
    console.error("Error al obtener tipos de habitación:", error);
    return [];
  }
}