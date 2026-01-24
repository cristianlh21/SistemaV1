/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Hotel, 
  Users, 
  Wallet, 
  FileSearch, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  Loader2,
  Save // Icono para edición
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarStep } from "./SidebarStep";
import { StepHabitacion } from "./StepHabitacion";
import { StepHuesped } from "./StepHuesped";
import { StepPagos } from "./StepPagos";
import { StepResumen } from "./StepResumen";
import { toast } from "sonner";
import { confirmarReserva, actualizarReservaAction } from "../../_actions"; // Añadimos la acción de actualizar
import { ReservaWizardData } from "./types";

// ============================================================================
// DEFINICIÓN DE PROPS ADAPTADA
// ============================================================================
interface ReservaWizardProps {
  onSuccess?: () => void;
  isEdit?: boolean;           // Nuevo: Detecta si es edición
  initialData?: Partial<ReservaWizardData> & { id?: string }; // Nuevo: Datos que vienen de la DB
  onClose?: () => void;
}

const STEPS = [
  { id: 1, name: "Habitación", description: "Fechas y unidad", icon: Hotel },
  { id: 2, name: "Huésped", description: "Titular de reserva", icon: Users },
  { id: 3, name: "Pagos", description: "Seña y garantía", icon: Wallet },
  { id: 4, name: "Resumen", description: "Confirmar datos", icon: FileSearch },
];

export function ReservaWizard({ onSuccess, isEdit = false, initialData }: ReservaWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // El estado inicial ahora es "inteligente": usa initialData si existe, sino usa los vacíos
  const [reservaData, setReservaData] = useState<ReservaWizardData>({
    habitacionId: initialData?.habitacionId || "",
    habitacionNumero: initialData?.habitacionNumero || "",
    tipoConfiguracionId: initialData?.tipoConfiguracionId || "",
    tipoConfiguracionNombre: initialData?.tipoConfiguracionNombre || "",
    titularId: initialData?.titularId || "",
    huespedNombre: initialData?.huespedNombre || "",
    huespedApellido: initialData?.huespedApellido || "",
    huespedDni: initialData?.huespedDni || "",
    huespedTelefono: initialData?.huespedTelefono || "",
    fechaEntrada: initialData?.fechaEntrada ? new Date(initialData.fechaEntrada) : undefined,
    fechaSalida: initialData?.fechaSalida ? new Date(initialData.fechaSalida) : undefined,
    precioPactado: initialData?.precioPactado || 0,
    montoAdelanto: initialData?.montoAdelanto || 0,
    estadoActual: initialData?.estadoActual || "",
    notas: initialData?.notas || "",
  });

  // Si el initialData cambia (por ejemplo al abrir otro modal), reseteamos el estado
  useEffect(() => {
    if (initialData) {
      setReservaData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleNext = () => {
    if (currentStep === 1 && (!reservaData.habitacionId || !reservaData.fechaEntrada)) {
      return toast.error("Seleccione fechas y una habitación disponible");
    }
    if (currentStep === 2 && !reservaData.titularId) {
      return toast.error("Debe asignar un titular a la reserva");
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Lógica de guardado dividida: Crear vs Actualizar
  const handleFinalConfirm = async () => {
    setIsSubmitting(true);
    try {
      let res;
      if (isEdit && initialData?.id) {
        // Lógica de Edición
        res = await actualizarReservaAction(initialData.id, reservaData);
      } else {
        // Lógica de Creación
        res = await confirmarReserva(reservaData);
      }

      if (res.success) {
        toast.success(isEdit ? "Reserva actualizada" : "Reserva confirmada");
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Error al procesar la reserva");
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-[85vh] bg-white flex flex-col lg:flex-row overflow-hidden">
      
      {/* SIDEBAR FIJO */}
      <aside className="lg:w-70 bg-slate-50/80 border-r border-slate-100 p-8 flex flex-col justify-between shrink-0 h-full">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 text-center lg:text-left">
            {isEdit ? "Modificar Registro" : "Nuevo Registro"}
          </p>
          {STEPS.map((step, index) => (
            <SidebarStep 
              key={step.id} 
              step={step} 
              currentStep={currentStep} 
              isLast={index === STEPS.length - 1}
            />
          ))}
        </div>

        <div className="hidden lg:block p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Operación</p>
          <p className="text-xs font-black text-slate-700 uppercase tracking-tighter italic">
            {isEdit ? "Edición de Reserva" : "Alta de Reserva"}
          </p>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col bg-white h-full overflow-hidden">
        <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar bg-white min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <header className="mb-6">
                <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 leading-none">
                  {STEPS[currentStep - 1].name}
                </h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] mt-2 tracking-widest">
                  {STEPS[currentStep - 1].description}
                </p>
              </header>

              <div className="pb-6">
                {currentStep === 1 && <StepHabitacion data={reservaData} setData={setReservaData} />}
                {currentStep === 2 && <StepHuesped data={reservaData} setData={setReservaData} isEdit={isEdit} />}
                {currentStep === 3 && <StepPagos data={reservaData} setData={setReservaData} isEdit={isEdit} />}
                {currentStep === 4 && <StepResumen data={reservaData} setData={setReservaData} />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* FOOTER FIJO */}
        <footer className="h-20 px-8 border-t bg-slate-50/50 flex items-center justify-between shrink-0">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            disabled={currentStep === 1 || isSubmitting}
            className="px-4 font-bold uppercase tracking-tight text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
          </Button>

          {currentStep === STEPS.length ? (
            <Button 
              onClick={handleFinalConfirm}
              disabled={isSubmitting}
              className={`px-8 h-11 rounded-full font-black uppercase tracking-widest shadow-lg transition-all text-white border-none ${isEdit ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' : 'bg-primary shadow-primary/20 hover:scale-105'}`}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isEdit ? "Guardar Cambios" : "Finalizar Reserva"} 
                  {isEdit ? <Save className="ml-2 h-5 w-5" /> : <CheckCircle className="ml-2 h-5 w-5" />}
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              className="px-8 h-11 font-black tracking-widest hover:scale-105 transition-all text-white border-none"
            >
              Siguiente <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </footer>
      </main>
    </div>
  );
}