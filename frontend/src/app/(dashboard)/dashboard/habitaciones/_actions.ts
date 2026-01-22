/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Limpieza, Piso, Prisma } from "@prisma/client";

/**
 * 1. ACTUALIZAR ESTADOS RÁPIDOS
 * Estas son las funciones que más usará el recepcionista.
 */

// Cambiar el estado de limpieza (Sucia -> En Proceso -> Limpia)
export async function cambiarEstadoLimpieza(id: string, nuevoEstado: Limpieza) {
  try {
    await prisma.habitacion.update({
      where: { id },
      data: { estadoLimpieza: nuevoEstado },
    });
    revalidatePath("/habitaciones");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar limpieza" };
  }
}

export async function actualizarEstadoMantenimiento(id: string, mantenimiento: boolean) {
  try {
    await prisma.habitacion.update({
      where: { id },
      data: { mantenimiento },
    });
    revalidatePath("/dashboard/habitaciones");
    revalidatePath(`/dashboard/habitaciones/${id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar mantenimiento" };
  }
}

// Alternar el estado de mantenimiento
export async function toggleMantenimiento(id: string, valor: boolean) {
  try {
    await prisma.habitacion.update({
      where: { id },
      data: { mantenimiento: valor },
    });
    revalidatePath("/habitaciones");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar mantenimiento" };
  }
}

/**
 * 2. CRUD TRADICIONAL
 * Para gestión administrativa de las habitaciones.
 */

// CREAR una nueva habitación
export async function crearHabitacion(data: {
  numero: string;
  piso: Piso;
  tipoBaseId: string;
}) {
  try {
    await prisma.habitacion.create({
      data: {
        numero: data.numero,
        piso: data.piso,
        tipoBaseId: data.tipoBaseId,
        tipoActualId: data.tipoBaseId, // Por defecto al crear, el actual es el base
        estadoOcupacion: "LIBRE",
        estadoLimpieza: "LIMPIA",
      },
    });
    revalidatePath("/habitaciones");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al crear la habitación" };
  }
}

// EDITAR datos de la habitación
export async function editarHabitacion(id: string, data: Prisma.HabitacionUpdateInput) {
  try {
    await prisma.habitacion.update({
      where: { id },
      data: data,
    });
    revalidatePath("/habitaciones");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al editar" };
  }
}

// ELIMINAR una habitación
export async function eliminarHabitacion(id: string) {
  try {
    // Nota: Solo se debería poder eliminar si no tiene reservas activas
    await prisma.habitacion.delete({
      where: { id },
    });
    revalidatePath("/habitaciones");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se puede eliminar una habitación con historial" };
  }
}