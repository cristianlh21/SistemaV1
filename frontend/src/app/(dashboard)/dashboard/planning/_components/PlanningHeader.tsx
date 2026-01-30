// src/app/(dashboard)/dashboard/planning/_components/PlanningHeader.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { 
  format, 
  addMonths, 
  subMonths, 
} from "date-fns";
import { es } from "date-fns/locale";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  mes: number;
  anio: number;
}

export function PlanningHeader({ mes, anio }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Creamos un objeto Date basado en el mes y año que vienen de la URL
  const fechaActual = new Date(anio, mes - 1, 1);

  const actualizarUrl = (nuevaFecha: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mes", (nuevaFecha.getMonth() + 1).toString());
    params.set("anio", nuevaFecha.getFullYear().toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const irMesAnterior = () => actualizarUrl(subMonths(fechaActual, 1));
  const irMesSiguiente = () => actualizarUrl(addMonths(fechaActual, 1));
  const irHoy = () => actualizarUrl(new Date());

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100/50">
      
      {/* TÍTULO Y FECHA ACTUAL */}
      <div className="flex items-center gap-4">
        <div className="bg-slate-900 p-3 rounded-2xl shadow-lg shadow-slate-200">
          <CalendarIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">
            {format(fechaActual, "MMMM yyyy", { locale: es })}
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
            Planificación de Reservas
          </p>
        </div>
      </div>

      {/* CONTROLES DE NAVEGACIÓN */}
      <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={irMesAnterior}
          className="rounded-xl hover:bg-white hover:shadow-sm transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Button>

        <Button
          variant="outline"
          onClick={irHoy}
          className="px-6 rounded-xl border-none shadow-none font-black text-[10px] uppercase tracking-widest bg-white hover:bg-slate-900 hover:text-white transition-all"
        >
          Hoy
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={irMesSiguiente}
          className="rounded-xl hover:bg-white hover:shadow-sm transition-all"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </Button>
      </div>
    </div>
  );
}