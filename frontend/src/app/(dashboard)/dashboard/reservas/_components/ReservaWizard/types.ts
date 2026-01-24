// src/app/(dashboard)/dashboard/reservas/_components/reservaWizard/types.ts

export interface ReservaWizardData {
  id?: string;
  habitacionId: string;
  habitacionNumero: string;   
  tipoConfiguracionId: string;
  tipoConfiguracionNombre: string
  titularId: string;
  huespedNombre: string;      
  huespedApellido: string;    
  huespedDni: string;         
  huespedTelefono?: string;   
  fechaEntrada: Date | undefined;
  fechaSalida: Date | undefined;
  precioPactado: number;
  montoAdelanto: number;
  estadoActual: string;
  notas: string;
}

export interface StepProps {
  data: ReservaWizardData;
  setData: React.Dispatch<React.SetStateAction<ReservaWizardData>>;
  isEdit?: boolean;
}