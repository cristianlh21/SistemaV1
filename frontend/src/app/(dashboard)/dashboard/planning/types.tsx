// src/app/(dashboard)/dashboard/planning/types.ts

export interface ReservaPlanning {
  id: string;
  fechaEntrada: Date;
  fechaSalida: Date;
  estado: string;
  titular: {
    nombre: string;
    apellido: string;
  };
}

export interface HabitacionPlanning {
  id: string;
  numero: string;
  tipoActual: {
    nombre: string;
  };
  reservas: ReservaPlanning[];
}