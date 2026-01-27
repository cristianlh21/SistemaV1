"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ReservaWizardData, TipoHabitacionData } from "../../../types";
import { 
  Settings2, 
  DollarSign, 
  FileText, 
  Info, 
  BedDouble, 
  CheckCircle2,
  AlertTriangle 
} from "lucide-react";
import { getTiposHabitacion } from "@/lib/actions/habitaciones";

interface Props {
  formData: ReservaWizardData;
  updateFormData: (newData: Partial<ReservaWizardData>) => void;
}

export default function StepDetallesReserva({ formData, updateFormData }: Props) {
  const [tipos, setTipos] = useState<TipoHabitacionData[]>([]);
  const [cargando, setCargando] = useState(true);

  // 1. Cargamos todos los tipos de habitación al iniciar
  useEffect(() => {
    async function cargarTipos() {
      try {
        const data = await getTiposHabitacion();
        setTipos(data as TipoHabitacionData[]);
      } catch (error) {
        console.error("Error al cargar tipos:", error);
      } finally {
        setCargando(false);
      }
    }
    cargarTipos();
  }, []);

  // 2. LÓGICA DE FILTRO INTELIGENTE:
  // Obtenemos la capacidad máxima de la habitación elegida en el Paso 1
  const capacidadMaxFisica = formData.habitacionSeleccionada?.tipoBase.capacidad || 0;

  // Filtramos para que solo aparezcan tipos que quepan físicamente
  const tiposDisponibles = tipos.filter(t => t.capacidad <= capacidadMaxFisica);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
          <Settings2 className="w-5 h-5 text-primary" /> 
          Configuración de la Estadía
        </h2>
        <p className="text-sm text-muted-foreground">
          Define cómo se preparará la habitación y ajusta la tarifa final.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: CONFIGURACIÓN Y PRECIO */}
        <div className="xl:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Vender como (Configuración)
              </Label>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold italic">
                Capacidad física máx: {capacidadMaxFisica} pers.
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {cargando ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />
                ))
              ) : tiposDisponibles.length > 0 ? (
                tiposDisponibles.map((tipo) => {
                  const isSelected = formData.tipoConfiguracionId === tipo.id;
                  return (
                    <Card
                      key={tipo.id}
                      onClick={() => updateFormData({ 
                        tipoConfiguracionId: tipo.id,
                        tipoConfiguracion: tipo, // Guardamos el objeto para el ticket
                        precioPactado: tipo.precio 
                      })}
                      className={`relative p-3 cursor-pointer transition-all border-2 flex flex-col gap-1 ${
                        isSelected 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-slate-100 hover:border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary" />
                      )}
                      <div className="flex items-center gap-2">
                        <BedDouble className={`w-4 h-4 ${isSelected ? "text-primary" : "text-slate-400"}`} />
                        <span className="font-bold text-xs uppercase truncate">{tipo.nombre}</span>
                      </div>
                      <div className="flex justify-between items-end mt-1">
                        <span className="text-[10px] text-slate-500 font-medium">Cap: {tipo.capacidad}</span>
                        <span className="font-black text-sm text-primary">${tipo.precio}</span>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-2 p-4 border-2 border-dashed rounded-xl flex items-center gap-3 text-amber-600 bg-amber-50">
                  <AlertTriangle className="w-5 h-5" />
                  <p className="text-xs font-medium">No hay tipos compatibles con esta habitación.</p>
                </div>
              )}
            </div>
          </div>

          {/* PRECIO FINAL */}
          <div className="space-y-3 pt-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Tarifa Pactada (Por Noche)
            </Label>
            <div className="relative group max-w-70">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign className="h-6 w-6 text-slate-400 group-focus-within:text-primary transition-colors" />
               </div>
               <Input 
                 type="number"
                 value={formData.precioPactado}
                 onChange={(e) => updateFormData({ precioPactado: Number(e.target.value) })}
                 className="pl-12 h-16 text-3xl font-black bg-slate-50 border-2 focus-visible:ring-primary rounded-2xl transition-all"
               />
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: NOTAS */}
        <div className="xl:col-span-5 space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <FileText className="w-3 h-3" /> Instrucciones de Preparación
          </Label>
          <Textarea 
            placeholder="Escribe aquí si el huésped solicitó algo especial o instrucciones para las mucamas..."
            className="min-h-62.5 resize-none border-2 focus:border-primary p-4 rounded-2xl bg-slate-50/50 text-sm"
            value={formData.notas || ""}
            onChange={(e) => updateFormData({ notas: e.target.value })}
          />
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Al elegir un tipo de configuración diferente al original, el sistema alertará al equipo de limpieza para que preparen la habitación según lo pactado.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}