/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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