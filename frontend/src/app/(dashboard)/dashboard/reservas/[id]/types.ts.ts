import { Prisma } from "@prisma/client";

/**
 * Definimos qué incluye una reserva para la Ficha Maestra.
 * Esto le dice a TypeScript: "Una reserva no es solo la fecha, 
 * también trae al cliente, la habitación y sus pagos".
 */
export type ReservaCompletaFicha = Prisma.ReservaGetPayload<{
  include: {
    // Necesitamos los datos del cliente para el encabezado
    titular: true;
    huespedes: true; // Incluimos acompañantes
    // Necesitamos la habitación y su tipo base para saber qué estamos vendiendo
    habitacion: {
      include: {
        tipoBase: true;
      };
    };
    
    // Necesitamos saber si se configuró de forma especial (ej: Suite como Doble)
    tipoConfiguracion: true;
    
    // Crucial: Todos los movimientos (Pagos, Señas, Consumos) para calcular el saldo
    movimientos: {
        orderBy: {
            fecha: 'desc' // Los más nuevos primero
        }
    };
  };
}>;