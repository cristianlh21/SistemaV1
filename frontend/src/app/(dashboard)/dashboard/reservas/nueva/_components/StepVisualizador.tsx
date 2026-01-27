import { ReservaWizardData } from "../../types";
import StepConfirmacion from "./Pasos/StepConfirmacion";
import StepDatosHuesped from "./Pasos/StepDatosHuesped";
import StepDetallesReserva from "./Pasos/StepDetallesReserva";
import StepFechasHabitacion from "./Pasos/StepFechasHabitacion";

interface StepVisualizadorProps {
  currentStep: number;
  formData: ReservaWizardData;
  updateFormData: (newData: Partial<ReservaWizardData>) => void;
}

interface StepVisualizadorProps {
  currentStep: number;
  formData: ReservaWizardData;
  updateFormData: (newData: Partial<ReservaWizardData>) => void;
}

export function StepVisualizador({
  currentStep,
  formData,
  updateFormData,
}: StepVisualizadorProps) {
  switch (currentStep) {
    case 1:
      return (
        <StepFechasHabitacion
          formData={formData}
          updateFormData={updateFormData}
        />
      );
    case 2:
      return (
        <StepDatosHuesped formData={formData} updateFormData={updateFormData} />
      );
    case 3:
      return (
        <StepDetallesReserva
          formData={formData}
          updateFormData={updateFormData}
        />
      );
    case 4:
        return <StepConfirmacion formData={formData} updateFormData={updateFormData} />;
      
    default:
      return null;
  }
}
