/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/(dashboard)/dashboard/reservas/_actions.ts
'use server'
import { prisma } from "@/lib/prisma";
import { differenceInDays, startOfDay } from "date-fns";
import { revalidatePath } from "next/cache";

// src/app/(dashboard)/dashboard/reservas/_actions.ts

export async function getReservaById(id: string) {
  try {
    const reserva = await prisma.reserva.findUnique({
      where: { id: id },
      include: {
        titular: true,
        huespedes: true, // <--- ESTA ES LA LÍNEA QUE MANDA
        habitacion: {
          include: { 
            tipoBase: true 
          }
        },
        tipoConfiguracion: true,
        movimientos: {
          orderBy: { fecha: "desc" }
        }
      }
    });

    if (!reserva) return { success: false, error: "Reserva no encontrada" };
    return { success: true, data: reserva };
  } catch (error) {
    console.error("Error al obtener reserva:", error);
    return { success: false, error: "Error de servidor" };
  }
}

export async function updateFechasReserva(
  reservaId: string,
  nuevaEntrada: Date,
  nuevaSalida: Date
) {
  try {
    // 1. Buscamos la reserva actual para conocer el precio pactado
    const reservaActual = await prisma.reserva.findUnique({
      where: { id: reservaId },
      select: { precioPactado: true, habitacionId: true }
    });

    if (!reservaActual) {
      return { success: false, error: "Reserva no encontrada" };
    }

    // 2. Validación de disponibilidad (Evitar solapamiento)
    // Buscamos si hay OTRAS reservas en esa misma habitación que se crucen con las nuevas fechas
    const conflicto = await prisma.reserva.findFirst({
      where: {
        habitacionId: reservaActual.habitacionId,
        id: { not: reservaId }, // Ignoramos la reserva que estamos editando
        estado: { in: ['CONFIRMADA', 'CHECKIN'] }, // Solo estados que bloquean
        OR: [
          {
            AND: [
              { fechaEntrada: { lte: nuevaEntrada } },
              { fechaSalida: { gt: nuevaEntrada } }
            ]
          },
          {
            AND: [
              { fechaEntrada: { lt: nuevaSalida } },
              { fechaSalida: { gte: nuevaSalida } }
            ]
          }
        ]
      }
    });

    if (conflicto) {
      return { 
        success: false, 
        error: "La habitación ya está ocupada en esas fechas por otra reserva." 
      };
    }

    // 3. Cálculo del nuevo total
    // Usamos startOfDay para que las horas no afecten el conteo de noches
    const d1 = startOfDay(nuevaEntrada);
    const d2 = startOfDay(nuevaSalida);
    const nuevasNoches = Math.max(differenceInDays(d2, d1), 1);
    const nuevoTotal = nuevasNoches * reservaActual.precioPactado;

    // 4. Actualización en la base de datos
    const reservaActualizada = await prisma.reserva.update({
      where: { id: reservaId },
      data: {
        fechaEntrada: nuevaEntrada,
        fechaSalida: nuevaSalida,
        total: nuevoTotal, // Actualizamos el total contable
      }
    });

    // 5. Refrescamos la página para que la ficha muestre los nuevos datos
    revalidatePath(`/dashboard/reservas/${reservaId}`);
    
    return { success: true, data: reservaActualizada };

  } catch (error) {
    console.error("Error al actualizar fechas:", error);
    return { success: false, error: "Error interno del servidor" };
  }
}

export async function getHabitacionesDisponibles(reservaId: string, checkIn: Date, checkOut: Date) {
  try {
    // Buscamos todas las habitaciones que NO tengan reservas 
    // que se solapen con estas fechas (exceptuando la reserva actual)
    const habitacionesDisponibles = await prisma.habitacion.findMany({
      where: {
        reservas: {
          none: {
            id: { not: reservaId }, // Ignorar la reserva que estamos editando
            estado: { in: ['CONFIRMADA', 'CHECKIN'] },
            AND: [
              { fechaEntrada: { lt: checkOut } },
              { fechaSalida: { gt: checkIn } }
            ]
          }
        }
      },
      include: {
        tipoBase: true 
      },
      orderBy: { numero: 'asc' }
    });

    return { success: true, data: habitacionesDisponibles };
  } catch (error) {
    return { success: false, error: "No se pudieron consultar las habitaciones" };
  }
}

export async function updateHabitacionReserva(reservaId: string, nuevaHabitacionId: string) {
  try {
    const actualizada = await prisma.reserva.update({
      where: { id: reservaId },
      data: { habitacionId: nuevaHabitacionId },
    });
    
    revalidatePath(`/dashboard/reservas/${reservaId}`);
    return { success: true, data: actualizada };
  } catch (error) {
    return { success: false, error: "Error al cambiar la habitación" };
  }
}

export async function crearMovimientoAction(data: any) {
  try {
    const nuevoMovimiento = await prisma.movimiento.create({
      data: {
        monto: data.monto,
        tipo: data.tipo,
        categoria: data.categoria,
        metodoPago: data.metodoPago,
        descripcion: data.descripcion,
        reservaId: data.reservaId || null, // Muy importante para vincularlo
        fecha: new Date(),
      },
    });

    // Si el movimiento está vinculado a una reserva, refrescamos la ficha
    if (data.reservaId) {
      revalidatePath(`/dashboard/reservas/${data.reservaId}`);
    }

    return { success: true, data: nuevoMovimiento };
  } catch (error) {
    console.error("Error al crear movimiento:", error);
    return { success: false, error: "No se pudo guardar el movimiento" };
  }
}