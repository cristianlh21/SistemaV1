/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/(dashboard)/dashboard/reservas/_actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ReservaWizardData } from "./_components/ReservaWizard/types";
import { revalidatePath } from "next/cache";
import {
  TipoMovimiento,
  CategoriaMovimiento,
  EstadoReserva,
} from "@prisma/client";
import { MovimientoFormValues } from "@/components/forms/MovimientoForm";

export async function confirmarReserva(data: ReservaWizardData) {
  try {
    // 1. Validaciones básicas
    if (
      !data.habitacionId ||
      !data.titularId ||
      !data.fechaEntrada ||
      !data.fechaSalida
    ) {
      return { success: false, error: "Datos de reserva incompletos." };
    }

    // 2. Transacción para asegurar integridad
    const resultado = await prisma.$transaction(async (tx) => {
      // A. Crear la Reserva usando tus nombres de campos exactos
      const nuevaReserva = await tx.reserva.create({
        data: {
          habitacionId: data.habitacionId,
          titularId: data.titularId,
          tipoConfiguracionId: data.tipoConfiguracionId,
          fechaEntrada: data.fechaEntrada!,
          fechaSalida: data.fechaSalida!,
          precioPactado: data.precioPactado,
          estado: EstadoReserva.PENDIENTE,
          notas: data.notas,
        },
      });

      // B. Si hay adelanto, creamos el Movimiento vinculado
      if (data.montoAdelanto > 0) {
        await tx.movimiento.create({
          data: {
            reservaId: nuevaReserva.id,
            tipo: TipoMovimiento.INGRESO,
            categoria: CategoriaMovimiento.HABITACION,
            metodoPago: "EFECTIVO", // Podríamos parametrizarlo luego
            descripcion: "PAGO DE SEÑA - RESERVA INICIAL",
            monto: data.montoAdelanto,
            fecha: new Date(),
          },
        });
      }

      return nuevaReserva;
    });

    // 3. Revalidamos las rutas necesarias
    revalidatePath("/dashboard/reservas");
    // Si tuvieras un dashboard principal con el estado de habitaciones:
    revalidatePath("/dashboard");

    return { success: true, data: resultado };
  } catch (error) {
    console.error("Error al confirmar reserva:", error);
    return {
      success: false,
      error: "No se pudo procesar la reserva en la base de datos.",
    };
  }
}

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

export type HabitacionDisponible = Prisma.HabitacionGetPayload<{
  include: { tipoBase: true };
}>;

export async function getHabitacionesDisponibles(
  fechaEntrada: Date,
  fechaSalida: Date,
): Promise<{ success: boolean; data: HabitacionDisponible[]; error?: string }> {
  try {
    // 1. Buscamos los IDs de las habitaciones que YA tienen reservas en ese rango
    const habitacionesOcupadas = await prisma.reserva.findMany({
      where: {
        estado: {
          notIn: ["CANCELADA", "NOSHOW"], // Las canceladas liberan la habitación
        },
        AND: [
          { fechaEntrada: { lt: fechaSalida } },
          { fechaSalida: { gt: fechaEntrada } },
        ],
      },
      select: { habitacionId: true },
    });

    const idsOcupados = habitacionesOcupadas.map((r) => r.habitacionId);

    // 2. Buscamos todas las habitaciones que NO estén en esa lista de ocupadas
    const disponibles = await prisma.habitacion.findMany({
      where: {
        id: { notIn: idsOcupados },
      },
      include: {
        tipoBase: true, // Incluimos el tipo para mostrar capacidad y nombre
      },
      orderBy: {
        numero: "asc",
      },
    });

    return { success: true, data: disponibles };
  } catch (error) {
    console.error("Error al buscar disponibilidad:", error);
    return {
      success: false,
      data: [],
      error: "Error al consultar disponibilidad",
    };
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

export async function getReservaById(id: string) {
  try {
    const reserva = await prisma.reserva.findUnique({
      where: { 
        id: id 
      },
      include: {
        habitacion: true,
        titular: true,
        tipoConfiguracion: true,
        // Incluimos movimientos para que CardFinanzas calcule el saldo
        movimientos: {
          orderBy: {
            fecha: 'desc'
          }
        },
      },
    });

    if (!reserva) {
      return { success: false, data: null, error: "Reserva no encontrada" };
    }

    return { success: true, data: reserva };
  } catch (error) {
    console.error("Error al obtener reserva por ID:", error);
    return { success: false, data: null, error: "Error de servidor" };
  }
}

export async function registrarPagoAction(reservaId: string, values: MovimientoFormValues) {
  try {
    const nuevoMovimiento = await prisma.movimiento.create({
      data: {
        monto: values.monto,
        tipo: values.tipo,
        categoria: values.categoria,
        metodoPago: values.metodoPago, // Prisma ya reconoce este Enum
        descripcion: values.descripcion,
        reservaId: reservaId,
        // Si en tu schema el campo es 'fecha', Prisma lo toma por defecto si tiene @default(now())
        // pero lo enviamos explícitamente para mayor control:
        fecha: new Date(), 
      },
    });

    // Forzamos a Next.js a limpiar la caché de esta ruta para ver el saldo actualizado
    revalidatePath(`/dashboard/reservas/${reservaId}`);

    return { success: true, data: nuevoMovimiento };
  } catch (error) {
    console.error("Error al registrar pago:", error);
    return { success: false, error: "No se pudo guardar el pago en la base de datos." };
  }
}