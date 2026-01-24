"use client";

import { useState, useEffect, useMemo } from "react";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { AlertCircle, Hotel } from "lucide-react";
import { StepProps } from "./types";
import {
  getHabitacionesDisponibles,
  HabitacionDisponible,
} from "../../_actions";
import { FiltroTipoHabitacion } from "./habitacionStep/FiltroTipoHabitacion";
import { AnimatePresence, motion } from "framer-motion";
import { TarifarioSeleccionado } from "./habitacionStep/TarifarioSeleccionado";
import { HabitacionSelector } from "./habitacionStep/HabitacionSelector";

export function StepHabitacion({ data, setData, isEdit }: StepProps) {
  const [disponibles, setDisponibles] = useState<HabitacionDisponible[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [loading, setLoading] = useState(false);

 // 1. Carga de datos Inteligente (Sincronización con las fechas e ID de reserva)
  useEffect(() => {
    let isMounted = true;
    async function fetchDocs() {
      if (!data.fechaEntrada || !data.fechaSalida) return;

      setLoading(true);
      try {
        // Enviamos el ID de la reserva si estamos editando para que Prisma la ignore
        const res = await getHabitacionesDisponibles(
          data.fechaEntrada,
          data.fechaSalida,
          isEdit ? data.id : undefined // 👈 Enviamos el ID si es modo edición
        );

        if (isMounted && res.success) {
          setDisponibles(res.data);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDocs();
    return () => { isMounted = false; };
  }, [data.fechaEntrada, data.fechaSalida, isEdit, data.id]); // 👈 Dependencias actualizadas

  // 2. DERIVACIÓN DE DATOS (Con ordenamiento por capacidad)
const tiposDisponibles = useMemo(() => {
  const tiposMap = new Map();
  disponibles.forEach((h) => {
    if (!tiposMap.has(h.tipoBase.id)) {
      tiposMap.set(h.tipoBase.id, h.tipoBase);
    }
  });

  // Convertimos a array y ordenamos por capacidad de menor a mayor
  return Array.from(tiposMap.values()).sort((a, b) => a.capacidad - b.capacidad);
}, [disponibles]);

  // 3. Lógica de Filtrado Inteligente
  // 3. Lógica de Filtrado (También ordenamos las habitaciones por capacidad del tipo)
const habitacionesFiltradas = useMemo(() => {
  const resultado = tipoFiltro === "todos" 
    ? disponibles 
    : disponibles.filter((h) => h.tipoBaseId === tipoFiltro);

  // Ordenamos para que las habitaciones se agrupen por capacidad
  // (útil si hay varias habitaciones de distinto tipo en la vista 'todos')
  return [...resultado].sort((a, b) => a.tipoBase.capacidad - b.tipoBase.capacidad);
}, [disponibles, tipoFiltro]);

  const mostrarSugerencias =
    tipoFiltro !== "todos" && habitacionesFiltradas.length === 0;

  const sugerencias = useMemo(() => {
    if (!mostrarSugerencias) return [];
    const tipoBuscado = tiposDisponibles.find((t) => t.id === tipoFiltro);
    return disponibles.filter(
      (h) => h.tipoBase.capacidad >= (tipoBuscado?.capacidad || 0),
    );
  }, [mostrarSugerencias, disponibles, tiposDisponibles, tipoFiltro]);

  // Parte del render de StepHabitacion.tsx
  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* Aviso de Modo Edición */}
      {isEdit && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
            <Hotel className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-blue-600 leading-tight">Modo Ajuste de Estadía</p>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tight italic">
              Puedes cambiar las fechas. Tu habitación actual aparecerá disponible.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 space-y-4">
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              1. Periodo de Estadía
            </Label>
            <div className="rounded-3xl border bg-white p-6 shadow-sm flex justify-center w-full">
              <Calendar
                mode="range"
                selected={{ from: data.fechaEntrada, to: data.fechaSalida }}
                onSelect={(range) =>
                  setData((prev) => ({
                    ...prev,
                    fechaEntrada: range?.from,
                    fechaSalida: range?.to,
                    // Si cambia la fecha, reseteamos la habitación para obligar a re-seleccionar
                    // (Opcional, pero da más seguridad al recepcionista)
                    habitacionId: prev.habitacionId === prev.habitacionId ? prev.habitacionId : ""
                  }))
                }
                numberOfMonths={2}
                locale={es}
                className="w-full"
              />
            </div>
          </div>

          <FiltroTipoHabitacion
            tipos={tiposDisponibles}
            filtroActual={tipoFiltro}
            onChange={setTipoFiltro}
            loading={loading}
          />

          <AnimatePresence>
            {tipoFiltro !== "todos" && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <TarifarioSeleccionado
                  tipo={tiposDisponibles.find((t) => t.id === tipoFiltro)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-4">
        {mostrarSugerencias && (
          <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl">
            <AlertCircle className="text-orange-500 w-4 h-4 shrink-0" />
            <p className="text-[10px] font-black uppercase text-orange-800">
              Tipo no disponible. Mostrando opciones de capacidad similar o superior.
            </p>
          </div>
        )}

        <HabitacionSelector
          habitaciones={mostrarSugerencias ? sugerencias : habitacionesFiltradas}
          selectedId={data.habitacionId}
          onSelect={(hab) => {
            setData((prev) => ({
              ...prev,
              habitacionId: hab.id,
              habitacionNumero: hab.numero,
              tipoConfiguracionId: hab.tipoBaseId,
              tipoConfiguracionNombre: hab.tipoBase.nombre,
              precioPactado: hab.tipoBase.precio,
            }));
          }}
        />
      </div>
    </div>
  );
}
