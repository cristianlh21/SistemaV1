import { Habitacion, TipoHabitacion } from "@prisma/client";

// 1. Representación de los pagos que se cargan en el Wizard
export interface PagoReserva {
  monto: number;
  metodo: "EFECTIVO" | "TARJETA_DEBITO" | "TARJETA_CREDITO" | "TRANSFERENCIA" | "BILLETERA_VIRTUAL";
  referencia?: string;
}

// 2. Extensión de Habitación para incluir el tipo (la usaremos en el Paso 1)
export type HabitacionConTipo = Habitacion & {
  tipoBase: TipoHabitacion;
  tipoActual: TipoHabitacion;
};

// 3. LA ESTRUCTURA MAESTRA DEL WIZARD
export interface ReservaWizardData {
  // --- DATOS PARA EL PASO 1 (Estadía y Habitación) ---
  fechaEntrada: Date | undefined;
  fechaSalida: Date | undefined;
  habitacionId: string;
  habitacionSeleccionada?: HabitacionConTipo; // Para mostrar número y piso en el resumen

  // --- DATOS PARA EL PASO 2 (Huéspedes) ---
  titularId: string;
  titularSeleccionado?: ClienteData; // Para mostrar nombre y DNI en el resumen
  esNuevoCliente: boolean;
  // En caso de ser nuevo, guardamos los datos para crearlo
  datosNuevoCliente?: {
    nombre: string;
    apellido: string;
    documento: string;
    email?: string;
    telefono?: string;
  };
  // Soporte para múltiples huéspedes (según tu Schema)
  huespedesIds: string[]; 

  // --- DATOS PARA EL PASO 3 (Comercial/Configuración) ---
  tipoConfiguracionId: string; 
  tipoConfiguracion?: TipoHabitacionData;
  tipoConfiguracionSeleccionado?: TipoHabitacion; // Para mostrar el nombre del servicio (ej: "Doble")
  precioPactado: number; // Lo que se cobra por noche
  totalReserva: number;  // (Noches * PrecioPactado)
  notas?: string;

  // --- DATOS PARA EL PASO 4 (Dinero) ---
  adelanto?: number;           // El monto de la seña
  metodoPagoAdelanto?: string; // EFECTIVO, TRANSFERENCIA, etc.
  notasPago?: string;          // La descripción que el usuario pone en el MovimientoForm
  pagos: PagoReserva[];
}

// 4. ESTADO INICIAL (Para resetear el Wizard)
export const INITIAL_RESERVA_DATA: ReservaWizardData = {
  fechaEntrada: undefined,
  fechaSalida: undefined,
  habitacionId: "",
  titularId: "",
  esNuevoCliente: false,
  huespedesIds: [],
  tipoConfiguracionId: "",
  precioPactado: 0,
  totalReserva: 0,
  pagos: [],
  notas: "",
};

export interface RespuestaServerHabitaciones {
  success: boolean;
  data?: HabitacionConTipo[];
  error?: string;
}

export interface ClienteData {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
}

export interface TipoHabitacionData {
  id: string;
  nombre: string;
  capacidad: number;
  precio: number;
  descripcion?: string | null;
}