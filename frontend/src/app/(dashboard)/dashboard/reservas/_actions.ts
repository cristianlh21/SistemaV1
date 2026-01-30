/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/(dashboard)/dashboard/reservas/_actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { MetodoPago, Prisma } from "@prisma/client";
import { ReservaWizardData } from "./types";
import { revalidatePath } from "next/cache";
import {
  TipoMovimiento,
  CategoriaMovimiento,
  EstadoReserva,
} from "@prisma/client";
import { MovimientoFormValues } from "@/components/forms/MovimientoForm";


export type HabitacionDisponible = Prisma.HabitacionGetPayload<{
  include: { tipoBase: true };
}>;



export async function getReservas(query?: string) {
  try {
    const reservas = await prisma.reserva.findMany({
      where: query
        ? {
            OR: [
              { titular: { nombre: { contains: query, mode: "insensitive" } } },
              {
                titular: { apellido: { contains: query, mode: "insensitive" } },
              },
              {
                titular: {
                  documento: { contains: query, mode: "insensitive" },
                },
              },
              {
                habitacion: {
                  numero: { contains: query, mode: "insensitive" },
                },
              },
              {
                tipoConfiguracion: {
                  nombre: { contains: query, mode: "insensitive" },
                },
              },
            ],
          }
        : {},
      include: {
        habitacion: true,
        titular: true,
        movimientos: true,
        tipoConfiguracion: true,
      },
      // Primero ordenamos por fecha de entrada (las más próximas primero)
      orderBy: {
        fechaEntrada: "asc",
      },
    });

    // 2. Aplicamos el segundo nivel de filtrado por prioridad de estado
    // Definimos los pesos: menor número = mayor prioridad
    const prioridadEstado: Record<string, number> = {
      CONFIRMADA: 1,
      PENDIENTE: 2,
      CHECKIN: 3, // Opcional: podrías ponerlo primero si quieres ver quién ya está en el hotel
      CANCELADA: 4,
      NOSHOW: 5,
      CHECKOUT: 6,
      FINALIZADA: 7,
    };

    const reservasOrdenadas = reservas.sort((a, b) => {
      // Si las fechas son distintas, mantenemos el orden por fecha (ya viene de Prisma)
      // Pero si queremos que el estado mande incluso sobre la fecha, invertimos la lógica.

      // Lógica: Primero agrupamos por estados críticos, y dentro de cada estado, por fecha.
      const pesoA = prioridadEstado[a.estado] || 99;
      const pesoB = prioridadEstado[b.estado] || 99;

      if (pesoA !== pesoB) {
        return pesoA - pesoB;
      }

      // Si tienen el mismo estado, comparamos la fecha de entrada
      return (
        new Date(a.fechaEntrada).getTime() - new Date(b.fechaEntrada).getTime()
      );
    });

    return { success: true, data: reservasOrdenadas };
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    return { success: false, data: [] };
  }
}


export async function updateEstadoReserva(id: string, estado: EstadoReserva) {
  try {
    await prisma.reserva.update({
      where: { id },
      data: { estado },
    });

    revalidatePath("/dashboard/reservas");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar" };
  }
}



export async function actualizarReservaAction(id: string, data: ReservaWizardData) {
  try {
    const reservaActualizada = await prisma.reserva.update({
      where: { id: id },
      data: {
        // Actualizamos fechas y habitación
        fechaEntrada: data.fechaEntrada,
        fechaSalida: data.fechaSalida,
        habitacionId: data.habitacionId,
        
        // Actualizamos precio y notas
        precioPactado: data.precioPactado,
        notas: data.notas,
        
        // El titular normalmente no cambia, pero lo incluimos por consistencia
        titularId: data.titularId,
        
        // Si tienes tipo de configuración (ej: Cama matrimonial o Twin)
        tipoConfiguracionId: data.tipoConfiguracionId || null,
      },
    });

    // Limpiamos la caché para que el usuario vea los datos nuevos al instante
    revalidatePath("/dashboard/reservas");
    revalidatePath(`/dashboard/reservas/${id}`);

    return { success: true, data: reservaActualizada };
  } catch (error) {
    console.error("Error al actualizar la reserva:", error);
    return { success: false, error: "No se pudo actualizar la reserva en la base de datos" };
  }
}

export async function guardarReservaCompleta(data: any) {
  try {
    // 1. Calculamos el total de la estadía (noches * precio)
    const noches = Math.ceil(
      (new Date(data.fechaSalida).getTime() - new Date(data.fechaEntrada).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    const totalEstadia = noches * data.precioPactado;

    // 2. Iniciamos la transacción en la DB
    const resultado = await prisma.$transaction(async (tx) => {
      
      // A. Creamos la Reserva
      const nuevaReserva = await tx.reserva.create({
        data: {
          habitacionId: data.habitacionId,
          titularId: data.titularId,
          tipoConfiguracionId: data.tipoConfiguracionId,
          precioPactado: data.precioPactado,
          total: totalEstadia,
          fechaEntrada: data.fechaEntrada,
          fechaSalida: data.fechaSalida,
          notas: data.notas,
          estado: EstadoReserva.PENDIENTE,
          // Conectamos al titular también como primer huésped por defecto
          huespedes: {
            connect: { id: data.titularId }
          }
        }
      });

      // B. Si hay una seña/adelanto, creamos el Movimiento de Ingreso
      if (data.adelanto && data.adelanto > 0) {
        await tx.movimiento.create({
          data: {
            reservaId: nuevaReserva.id,
            tipo: TipoMovimiento.INGRESO,
            categoria: CategoriaMovimiento.HABITACION,
            metodoPago: data.metodoPagoAdelanto,
            monto: data.adelanto,
            descripcion: data.notasPago || `Seña Reserva #${nuevaReserva.numeroReserva}`,
          }
        });
      }

      // C. (Opcional) Podríamos actualizar el estado de la habitación aquí
      // Pero usualmente se hace cuando el huésped llega (Check-in)

      return nuevaReserva;
    });

    revalidatePath("/dashboard/reservas");
    return { success: true, data: resultado };

  } catch (error: any) {
    console.error("Error al guardar reserva:", error);
    return { success: false, error: "No se pudo procesar la reserva. Intente nuevamente." };
  }
}