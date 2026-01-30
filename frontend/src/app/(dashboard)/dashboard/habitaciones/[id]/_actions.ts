// src/app/(dashboard)/dashboard/habitaciones/[id]/_actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { Piso } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Definimos la estructura de los datos que esperamos recibir
interface ActualizarHabitacionInput {
  numero: string;
  piso: Piso;
  tipoBaseId: string;
  tipoActualId: string;
}

export async function actualizarHabitacionAction(id: string, values: ActualizarHabitacionInput) {
  try {
    await prisma.habitacion.update({
      where: { id },
      data: {
        numero: values.numero,
        piso: values.piso,
        tipoBaseId: values.tipoBaseId,
        tipoActualId: values.tipoActualId,
      },
    });

    // Refrescamos las rutas para que los cambios se vean al instante
    revalidatePath("/dashboard/habitaciones");
    revalidatePath(`/dashboard/habitaciones/${id}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar habitación:", error);
    return { success: false, error: "No se pudo actualizar la habitación" };
  }
}