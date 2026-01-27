"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ReservaWizardData, HabitacionConTipo } from "../../../types";
import { DateRange } from "react-day-picker";
import { CalendarIcon, Search, Layers } from "lucide-react";
import { getHabitacionesDisponibles } from "@/lib/actions/reservas";

// Definimos los pisos exactamente como están en tu Prisma Schema
const PISOS = [
  { id: "PLANTA_BAJA", label: "P. Baja" },
  { id: "PRIMER_PISO", label: "Piso 1" },
  { id: "SEGUNDO_PISO", label: "Piso 2" },
  { id: "TERCER_PISO", label: "Piso 3" },
  { id: "CUARTO_PISO", label: "Piso 4" },
];

interface Props {
  formData: ReservaWizardData;
  updateFormData: (newData: Partial<ReservaWizardData>) => void;
}

export default function StepFechasHabitacion({ formData, updateFormData }: Props) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: formData.fechaEntrada,
    to: formData.fechaSalida,
  });

  const [habitaciones, setHabitaciones] = useState<HabitacionConTipo[]>([]);
  const [cargando, setCargando] = useState(false);
  
  // NUEVO: Estado para saber qué piso seleccionó el recepcionista
  const [pisoFiltro, setPisoFiltro] = useState("PLANTA_BAJA");

  useEffect(() => {
    updateFormData({ fechaEntrada: dateRange?.from, fechaSalida: dateRange?.to });
  }, [dateRange, updateFormData]);

  useEffect(() => {
    async function buscar() {
      if (dateRange?.from && dateRange?.to) {
        setCargando(true);
        try {
          const resultado = await getHabitacionesDisponibles(dateRange.from, dateRange.to);
          setHabitaciones(resultado);
        } catch (error) {
          console.error(error);
          setHabitaciones([]);
        } finally {
          setCargando(false);
        }
      }
    }
    buscar();
  }, [dateRange?.from, dateRange?.to]);

  // LÓGICA DE FILTRADO: Solo mostramos las del piso seleccionado
  const habitacionesFiltradas = habitaciones.filter(h => h.piso === pisoFiltro);

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" /> Definir Estadía
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* CALENDARIO */}
        <div className="xl:col-span-7 flex justify-center lg:justify-start">
          <Card className="p-4 shadow-sm inline-block">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className="rounded-md"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              }}
            />
          </Card>
        </div>

        {/* LISTADO DE HABITACIONES CON FILTROS */}
        <div className="xl:col-span-5 space-y-4">
          <Label className="font-bold text-sm uppercase text-slate-500 flex items-center gap-2">
            <Layers className="w-4 h-4" /> Seleccionar Piso
          </Label>

          {/* BOTONES DE FILTRO POR PISO */}
          <div className="flex flex-wrap gap-2">
            {PISOS.map((piso) => (
              <button
                key={piso.id}
                onClick={() => setPisoFiltro(piso.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                  pisoFiltro === piso.id
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {piso.label}
              </button>
            ))}
          </div>

          <div className="min-h-75">
            {!dateRange?.from || !dateRange?.to ? (
              <div className="h-75 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-slate-50/50 text-slate-400 p-6 text-center">
                <Search className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">Selecciona fechas en el calendario</p>
              </div>
            ) : cargando ? (
              <div className="grid grid-cols-2 gap-3 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-xl" />
                ))}
              </div>
            ) : habitacionesFiltradas.length > 0 ? (
              /* GRID DE 2 COLUMNAS */
              <div className="grid grid-cols-2 gap-3">
                {habitacionesFiltradas.map((hab) => (
                  <Card
                    key={hab.id}
                    className={`p-3 cursor-pointer hover:border-primary transition-all border-2 flex flex-col items-center justify-center text-center ${
                      formData.habitacionId === hab.id ? 'border-primary bg-primary/5' : 'border-transparent'
                    }`}
                    onClick={() => updateFormData({ 
                      habitacionId: hab.id, 
                      habitacionSeleccionada: hab,
                      precioPactado: hab.tipoBase.precio 
                    })}
                  >
                    <span className="text-lg font-black text-slate-800">#{hab.numero}</span>
                    <span className="text-[9px] uppercase font-bold text-slate-500">{hab.tipoBase.nombre}</span>
                    <span className="text-sm font-bold text-primary mt-1">${hab.tipoBase.precio}</span>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="h-75 flex items-center justify-center border rounded-2xl p-6 text-center text-sm text-muted-foreground italic">
                No hay habitaciones libres en este piso.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}