import { Prisma } from "@prisma/client";

export type ReservaParaCheckin = Prisma.ReservaGetPayload<{
  include: {
    titular: true;
    habitacion: {
      include: { tipoBase: true }
    };
    tipoConfiguracion: true;
    movimientos: true;
    huespedes: true;
  };
}>;

export interface CheckinFormData {
  huespedes: {
    nombre: string;
    apellido: string;
    documento: string;
    email?: string;
    telefono?: string;
    procedencia?: string; // Dato clave para estadísticas
  }[];
  metodoPago?: string;
  montoPagoInicial?: number;
}