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


export async function confirmarReserva(datos: any) {
  try {
    // 1. CREACIÓN DE LA RESERVA
    const nuevaReserva = await prisma.reserva.create({
      data: {
        // Fechas de estadía
        fechaEntrada: datos.fechaEntrada,
        fechaSalida: datos.fechaSalida,
        
        // Lógica de Precios:
        // 'total' es el monto acumulado de toda la estadía.
        // 'precioPactado' es el precio por noche que acordaste (el de la Doble, por ejemplo).
        total: datos.total, 
        precioPactado: datos.precioPactado, 

        // Relación con la Habitación Física (Donde dormirá)
        habitacion: { connect: { id: datos.habitacionId } },

        // RELACIÓN CLAVE: Tipo de Configuración (Cómo se prepara y qué se cobra)
        // Aquí conectamos el ID del tipo de habitación que pactaste con el cliente.
        tipoConfiguracion: { connect: { id: datos.tipoConfiguracionId } },

        // El cliente que paga
        titular: { connect: { id: datos.titularId } },

        // Estado inicial
        estado: EstadoReserva.CONFIRMADA,

        // 2. CREACIÓN DE MOVIMIENTOS (PAGOS/SEÑAS)
        // Si el Wizard envió pagos, los creamos vinculados a esta reserva
        movimientos: {
          create: datos.pagos.map((p: any) => ({
            monto: p.monto,
            tipo: TipoMovimiento.INGRESO,
            categoria: CategoriaMovimiento.HABITACION,
            // Mapeamos el string simple del Wizard al Enum complejo de Postgres
            metodoPago: p.metodo === "EFECTIVO" ? MetodoPago.EFECTIVO : 
                        p.metodo === "TARJETA" ? MetodoPago.TARJETA_CREDITO : 
                        MetodoPago.TRANSFERENCIA,
            descripcion: `Entrega seña reserva - Ref: ${p.referencia || 'S/R'}`
          }))
        }
      }
    });

    // 3. REVALIDACIÓN
    // Esto limpia la caché para que la tabla de reservas se actualice sin parpadeos.
    revalidatePath("/dashboard/reservas");

    return { success: true, data: nuevaReserva };

  } catch (error: any) {
    console.error("ERROR AL GUARDAR RESERVA:", error);
    return { 
      success: false, 
      error: "No se pudo guardar la reserva. Revisa que todos los campos obligatorios estén completos." 
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

export async function getHabitacionesDisponibles(
  fechaEntrada: Date,
  fechaSalida: Date,
  reservaIdAExcluir?: string // 👈 1. Agregamos este parámetro opcional
): Promise<{ success: boolean; data: HabitacionDisponible[]; error?: string }> {
  try {
    // 1. Buscamos los IDs de las habitaciones ocupadas
    const habitacionesOcupadas = await prisma.reserva.findMany({
      where: {
        // 👈 2. AQUÍ ESTÁ EL TRUCO:
        // Si me pasas un ID, buscame todas las reservas MENOS esa.
        ...(reservaIdAExcluir && {
          id: { not: reservaIdAExcluir }, 
        }),
        estado: {
          notIn: ["CANCELADA", "NOSHOW"],
        },
        AND: [
          { fechaEntrada: { lt: fechaSalida } },
          { fechaSalida: { gt: fechaEntrada } },
        ],
      },
      select: { habitacionId: true },
    });

    const idsOcupados = habitacionesOcupadas.map((r) => r.habitacionId);

    // 2. Buscamos las que no estén ocupadas (Ahora nuestra propia reserva no nos bloquea)
    const disponibles = await prisma.habitacion.findMany({
      where: {
        id: { notIn: idsOcupados },
      },
      include: {
        tipoBase: true,
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


export async function verificarDisponibilidadEdicion(
  reservaId: string, 
  habitacionId: string, 
  inicio: Date, 
  fin: Date
) {
  try {
    const colisiones = await prisma.reserva.findMany({
      where: {
        habitacionId: habitacionId,
        id: { not: reservaId }, // Ignora la que estamos editando
        // Filtramos estados que NO bloquean el calendario
        estado: { 
          notIn: [EstadoReserva.CANCELADA, EstadoReserva.CANCELADA, EstadoReserva.NOSHOW] 
        },
        AND: [
          { fechaEntrada: { lt: fin } },
          { fechaSalida: { gt: inicio } },
        ],
      },
    });

    return { 
      disponible: colisiones.length === 0, 
      conflictos: colisiones.length 
    };
  } catch (error) {
    console.error("Error validando disponibilidad:", error);
    return { disponible: false, error: "Error técnico" };
  }
}

export async function buscarAlternativasEdicion(
  reservaId: string,
  tipoHabitacionId: string,
  inicio: Date,
  fin: Date
) {
  try {
    // 1. Buscamos todas las habitaciones que coincidan con el tipo actual
    const habitacionesDelTipo = await prisma.habitacion.findMany({
      where: { tipoActualId: tipoHabitacionId },
      select: { id: true, numero: true }
    });

    const idsHabitaciones = habitacionesDelTipo.map(h => h.id);

    // 2. Buscamos qué habitaciones están ocupadas en ese rango (excluyendo esta reserva)
    const ocupadas = await prisma.reserva.findMany({
      where: {
        habitacionId: { in: idsHabitaciones },
        id: { not: reservaId },
        estado: { notIn: [EstadoReserva.CANCELADA, EstadoReserva.CANCELADA] },
        AND: [
          { fechaEntrada: { lt: fin } },
          { fechaSalida: { gt: inicio } }
        ]
      },
      select: { habitacionId: true }
    });

    const idsOcupadas = ocupadas.map(o => o.habitacionId);

    // 3. Filtramos las que están realmente disponibles
    const disponibles = habitacionesDelTipo.filter(h => !idsOcupadas.includes(h.id));

    return { success: true, disponibles };
  } catch (error) {
    return { success: false, error: "Error en búsqueda de alternativas" };
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