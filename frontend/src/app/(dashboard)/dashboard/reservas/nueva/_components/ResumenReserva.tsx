"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReservaWizardData } from "../../types";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDays,
  BedDouble,
  Receipt,
  Moon,
  User,
  Settings2,
} from "lucide-react";

interface Props {
  data: ReservaWizardData;
}

export function ResumenReserva({ data }: Props) {
  // 1. Calculamos la cantidad de noches
  const noches =
    data.fechaEntrada && data.fechaSalida
      ? differenceInDays(data.fechaSalida, data.fechaEntrada)
      : 0;

  // 2. Calculamos el total (Noches * Precio de la habitación)
  const precioNoche = data.precioPactado || 0;
  const totalEstancia = noches * precioNoche;

  return (
    <Card className="p-6 sticky top-6 border-none bg-slate-50 dark:bg-slate-900 shadow-xl overflow-hidden">
      {/* Decoración superior tipo "Ticket" */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

      <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
        <Receipt className="w-4 h-4" /> Detalle de Estancia
      </h3>

      <div className="space-y-5">
        {/* FECHAS */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <CalendarDays className="w-3 h-3" /> Período
            </p>
            <p className="text-sm font-semibold">
              {data.fechaEntrada
                ? format(data.fechaEntrada, "dd MMM", { locale: es })
                : "—"}{" "}
              al{" "}
              {data.fechaSalida
                ? format(data.fechaSalida, "dd MMM", { locale: es })
                : "—"}
            </p>
          </div>
          {noches > 0 && (
            <div className="bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center gap-1">
              <Moon className="w-3 h-3" />
              <span className="text-xs font-bold">
                {noches} {noches === 1 ? "noche" : "noches"}
              </span>
            </div>
          )}
        </div>

        <Separator className="bg-slate-200/50" />

        {/* HUÉSPED RESPONSABLE */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <User className="w-3 h-3" /> Responsable
          </p>
          {data.titularSeleccionado ? (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase">
                {data.titularSeleccionado.apellido},{" "}
                {data.titularSeleccionado.nombre}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                DOC: {data.titularSeleccionado.documento}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic font-medium">
              No identificado
            </p>
          )}
        </div>

        <Separator className="bg-slate-200/50" />

        {/* HABITACIÓN */}
        {/* HABITACIÓN Y CONFIGURACIÓN */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <BedDouble className="w-3 h-3" /> Habitación Seleccionada
              </p>
              {data.habitacionSeleccionada ? (
                <p className="text-sm font-black text-slate-700">
                  HAB. {data.habitacionSeleccionada.numero}
                  <span className="ml-2 text-[10px] text-slate-400 font-medium italic">
                    (Física: {data.habitacionSeleccionada.tipoBase.nombre})
                  </span>
                </p>
              ) : (
                <p className="text-sm text-slate-400 italic">No seleccionada</p>
              )}
            </div>
          </div>

          {/* ALERTA DE CONFIGURACIÓN REQUERIDA */}
          {data.tipoConfiguracionId && (
            <div className="animate-in zoom-in-95 duration-300 mt-2">
              <div className="bg-amber-100 dark:bg-amber-900/30 border-l-4 border-amber-500 p-2 rounded-r-md">
                <p className="text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-tighter">
                  Preparar Habitación como:
                </p>

                {/* MOSTRAMOS EL NOMBRE DEL TIPO ELEGIDO */}
                <p className="text-sm font-black text-amber-800 dark:text-amber-200 uppercase flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  {data.tipoConfiguracion?.nombre || "Cargando..."}
                </p>

                {/* Una pequeña validación visual extra */}
                {data.habitacionSeleccionada?.tipoBaseId !==
                  data.tipoConfiguracionId && (
                  <p className="text-[8px] font-bold text-amber-600 mt-1 italic">
                    ⚠️ Requiere cambio de mobiliario/ropa de cama
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <Separator className="bg-slate-200/50" />

        {/* DESGLOSE DE PRECIOS */}
        {noches > 0 && data.habitacionSeleccionada && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>
                {noches} noches x ${precioNoche}
              </span>
              <span>${totalEstancia}</span>
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
            <span>TOTAL ESTADÍA</span>
            <span>${(totalEstancia || 0).toLocaleString()}</span>
          </div>

          {data.adelanto ? (
            <div className="flex justify-between items-center text-[11px] font-bold text-emerald-600">
              <span className="flex items-center gap-1 uppercase tracking-tighter">
                <Receipt className="w-3 h-3" /> Seña / Adelanto
              </span>
              <span>- ${data.adelanto.toLocaleString()}</span>
            </div>
          ) : null}

          <div className="pt-2 border-t-2 border-dashed border-slate-200">
            <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Saldo Pendiente
                </p>
                <p
                  className={`text-xl font-black leading-none ${data.adelanto || 0 >= totalEstancia ? "text-emerald-600" : "text-slate-800"}`}
                >
                  ${(totalEstancia - (data.adelanto || 0)).toLocaleString()}
                </p>
              </div>
              {data.adelanto ||
                (0 >= totalEstancia && (
                  <span className="bg-emerald-100 text-emerald-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                    Pagado
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* TOTAL FINAL */}
      </div>

      {/* Pie del ticket */}
      <p className="text-[9px] text-center text-slate-400 mt-8 font-medium uppercase tracking-widest">
        Sistema de Gestión Hotelera
      </p>
    </Card>
  );
}
