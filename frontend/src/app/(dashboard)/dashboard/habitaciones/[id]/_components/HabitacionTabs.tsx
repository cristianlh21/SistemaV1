"use client";

import { Prisma, TipoHabitacion } from "@prisma/client"; // Importamos el tipo
import { NativeTabs } from "@/components/uitripled/native-tabs-shadcnui";
import { FormConfiguracion } from "./configuracionTab/FormConfiguracion";
import { PanelOperaciones } from "./operacionesTab/PanelOperaciones";

type HabitacionCompleta = Prisma.HabitacionGetPayload<{
  include: { tipoActual: true; tipoBase: true };
}>;

// Definimos la interfaz de las props para incluir los tipos
interface HabitacionTabsProps {
  habitacion: HabitacionCompleta;
  tiposDisponibles: TipoHabitacion[]; // <--- El dato que falta
}

export function HabitacionTabs({
  habitacion,
  tiposDisponibles, // <--- Lo recibimos aquí
}: HabitacionTabsProps) {
  return (
    <NativeTabs
      items={[
        {
          id: "operaciones",
          label: "Operaciones",
          content: (
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold tracking-tight text-primary">
                  Gestión Operativa
                </h3>
                <p className="text-muted-foreground">
                  Atención inmediata y control de estado para la habitación {habitacion.numero}.
                </p>
              </div>

              {/* 2. Inyectamos el panel de operaciones */}
              <PanelOperaciones habitacion={habitacion} />
            </div>
          ),
        },
        {
          id: "configuracion",
          label: "Configuración",
          content: (
            <div className="space-y-6"> {/* Cambié <> por div para mejor espaciado */}
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold tracking-tight">
                  Configuración Técnica
                </h3>
                <p className="text-muted-foreground">
                  Modifica los parámetros estructurales de la habitación en el sistema.
                </p>
              </div>

              {/* Ahora sí pasamos ambos datos al formulario */}
              <FormConfiguracion 
                habitacion={habitacion} 
                tiposDisponibles={tiposDisponibles} 
              />
            </div>
          ),
        },
        {
          id: "historial",
          label: "Historial",
          content: (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Historial de la Habitación</h3>
              <p className="text-muted-foreground">
                Registro de movimientos, limpiezas y cambios técnicos.
              </p>
            </div>
          ),
        },
      ]}
    />
  );
}