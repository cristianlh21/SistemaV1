// src/app/(dashboard)/dashboard/habitaciones/types.ts
import { Prisma } from "@prisma/client";

export type HabitacionDashboard = Prisma.HabitacionGetPayload<{
  include: {
    tipoActual: true;
    tipoBase: true;
    reservas: {
      include: {
        titular: true;
        huespedes: true;
        tipoConfiguracion: true;
        _count: {
          select: { huespedes: true };
        };
      };
    };
  };
}>;

// Definimos un tipo específico para la reserva que viene dentro de la habitación
export type ReservaDashboard = HabitacionDashboard["reservas"][0];
export type FiltroEstado = "TODAS" | "LIBRE" | "OCUPADA" | "SUCIA" | "MANTENIMIENTO";