/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EstadoReserva } from "@prisma/client"; // Importa el tipo real

export async function ejecutarCheckin(reservaId: string, datos: { huespedes: any[], montoPago?: number, metodoPago?: any }) {
  try {
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Buscamos la reserva con su habitación
      const reserva = await tx.reserva.findUnique({
        where: { id: reservaId },
        include: { habitacion: true }
      });

      if (!reserva) throw new Error("Reserva no encontrada");

      // 2. Procesamos los Huéspedes (Acompañantes)
      // Nota: Tu modelo Cliente NO tiene 'procedencia', así que la omitimos 
      // o la guardamos en 'direccion' si prefieres.
      const promesasHuespedes = datos.huespedes.map(async (h) => {
        return tx.cliente.upsert({
          where: { documento: h.documento },
          update: {
            nombre: h.nombre,
            apellido: h.apellido,
            direccion: h.procedencia // Opcional: usar dirección para la procedencia
          },
          create: {
            nombre: h.nombre,
            apellido: h.apellido,
            documento: h.documento,
            direccion: h.procedencia
          }
        });
      });

      const clientesCreados = await Promise.all(promesasHuespedes);

      // 3. Actualizamos la Reserva
      await tx.reserva.update({
        where: { id: reservaId },
        data: { 
          estado: "CHECKIN",
          huespedes: {
            // Sincronizamos la lista de huéspedes (reemplaza los anteriores con estos)
            set: clientesCreados.map(c => ({ id: c.id }))
          }
        }
      });

      // 4. Actualizamos la Habitación
      await tx.habitacion.update({
        where: { id: reserva.habitacionId },
        data: {
          estadoOcupacion: "OCUPADA",
          // Usamos tipoConfiguracionId si existe, sino el tipoBaseId
          tipoActualId: reserva.tipoConfiguracionId || reserva.habitacion.tipoBaseId
        }
      });

      // 5. Registro de pago si se realizó en el momento
      if (datos.montoPago && datos.montoPago > 0) {
        await tx.movimiento.create({
          data: {
            reservaId: reservaId,
            monto: datos.montoPago,
            tipo: "INGRESO",
            categoria: "HABITACION",
            metodoPago: datos.metodoPago,
            descripcion: "Pago registrado en Check-in",
          }
        });
      }

      return { success: true, error: null };
    });

    revalidatePath(`/dashboard/reservas/${reservaId}`);
    revalidatePath(`/dashboard/habitaciones`); 
    
    return resultado;

  } catch (error: any) {
    console.error("ERROR EN CHECKIN:", error);
    return { success: true, error: null };
  }
}

export async function cambiarEstadoExcepcion(
  reservaId: string, 
  nuevoEstado: EstadoReserva
) {
  try {
    // 1. Buscamos la reserva y la guardamos en la variable 'reservaEncontrada'
    const reservaEncontrada = await prisma.reserva.findUnique({
      where: { id: reservaId },
      select: { habitacionId: true } // Solo necesitamos el ID de la habitación
    });

    // 2. Si no existe, cortamos la ejecución
    if (!reservaEncontrada) {
      return { success: false, error: "La reserva no existe" };
    }

    // 3. Ahora que tenemos 'reservaEncontrada', podemos usar su 'habitacionId'
    await prisma.$transaction([
      prisma.reserva.update({
        where: { id: reservaId },
        data: { estado: nuevoEstado }
      }),
      prisma.habitacion.update({
        where: { id: reservaEncontrada.habitacionId }, // <-- AQUÍ usamos la variable correcta
        data: { 
          estadoOcupacion: "LIBRE" 
        } 
      })
    ]);

    revalidatePath("/dashboard/habitaciones");
    revalidatePath("/dashboard/planning");
    
    return { success: true };
  } catch (error) {
    console.error("Error en la transacción:", error);
    return { success: false, error: "Error al actualizar la base de datos" };
  }
}