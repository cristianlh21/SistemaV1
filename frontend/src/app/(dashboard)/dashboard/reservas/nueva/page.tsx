/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { ResumenReserva } from "./_components/ResumenReserva";
import { StepVisualizador } from "./_components/StepVisualizador";
import { INITIAL_RESERVA_DATA, ReservaWizardData } from "../types";
import { guardarReservaCompleta } from "../_actions";
import { customToast } from "@/lib/toast";
import { useRouter } from "next/navigation";

export default function NuevaReservaPage() {
  const [step, setStep] = useState(1);

  const router = useRouter();

  // ESTADO MAESTRO: Aquí se guardará todo
  const [formData, setFormData] =
    useState<ReservaWizardData>(INITIAL_RESERVA_DATA);

  // 2. Envolvemos la función con useCallback
  const updateFormData = useCallback((newData: Partial<ReservaWizardData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  }, []); // Los corchetes vacíos significan: "Crea esta función una sola vez y no la cambies más"

  const canGoNext = () => {
    if (step === 1) {
      // Validamos que haya fechas y que haya una habitación elegida
      return !!(
        formData.fechaEntrada &&
        formData.fechaSalida &&
        formData.habitacionId
      );
    }

    if (step === 2) {
      // Validamos: Que exista un titularId seleccionado
      return !!formData.titularId;
    }
    // Para los demás pasos, de momento dejamos pasar
    return true;
  };

  const onFinalizarReserva = async () => {
  // 1. Validaciones mínimas de seguridad
  if (!formData.titularId || !formData.habitacionId) {
    return customToast.error("Faltan datos críticos de la reserva");
  }

  try {
    const res = await guardarReservaCompleta(formData);
    
    if (res.success) {
      customToast.success("¡Reserva y Pago registrados correctamente!");
      router.push("/dashboard/reservas"); // Redirigir a la lista
      router.refresh(); // Refrescar datos del servidor
    } else {
      customToast.error(res.error || "Error al guardar");
    }
  } catch (err) {
    customToast.error("Ocurrió un error inesperado");
  }
};



  return (
    <div className="container mx-auto py-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase">
            Nueva Reserva
          </h1>
          <p className="text-muted-foreground text-sm">
            Gestiona una nueva entrada al hotel.
          </p>
        </div>
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
        <Card className="lg:col-span-3 p-6 flex flex-col shadow-xl border-t-4 border-t-primary overflow-y-auto">
          {/* Indicador de pasos con Línea de Progreso */}
          <div className="flex items-center justify-between mb-10 px-4 max-w-2xl mx-auto w-full relative">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                {/* El Círculo del Paso */}
                <div className="relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-sm ${
                      step >= i
                        ? "bg-primary text-primary-foreground scale-110 shadow-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i}
                  </div>
                  {/* Etiqueta opcional debajo del círculo */}
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold tracking-tighter text-muted-foreground whitespace-nowrap">
                    {i === 1 && "Estadía"}
                    {i === 2 && "Huésped"}
                    {i === 3 && "Detalles"}
                    {i === 4 && "Pago"}
                  </span>
                </div>

                {/* La Línea Conectora */}
                {i !== 4 && (
                  <div className="flex-1 h-0.5 mx-0 bg-muted relative">
                    {/* Esta es la línea de progreso que se "llena" */}
                    <div
                      className={`absolute inset-0 bg-primary transition-all duration-500 ${
                        step > i ? "w-full" : "w-0"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* VISUALIZADOR DE PASOS: Le pasamos el estado y la función de actualización */}
          <StepVisualizador
            currentStep={step}
            formData={formData}
            updateFormData={updateFormData}
          />

          {/* BOTONES DE NAVEGACIÓN */}
          <div className="flex justify-between pt-6 mt-6 border-t">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              <ChevronLeft className="mr-2 w-4 h-4" /> Anterior
            </Button>

            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                // OPCIÓN A: Botón deshabilitado si no es válido
                disabled={!canGoNext()}
                className={!canGoNext() ? "opacity-50 cursor-not-allowed" : ""}
              >
                Siguiente <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button className="bg-green-600 hover:bg-green-700"
                onClick={onFinalizarReserva}
                disabled={!canGoNext()}
              >
                <Save className="mr-2 w-4 h-4" /> Finalizar Reserva
              </Button>
            )}
          </div>
        </Card>

        {/* COMPONENTE RESUMEN: Le pasamos el formData para que se actualice solo */}
        <ResumenReserva data={formData} />
      </div>
    </div>
  );
}
