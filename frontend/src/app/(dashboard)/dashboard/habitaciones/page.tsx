/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/dashboard/habitaciones/page.tsx
import { prisma } from "@/lib/prisma";
import { Piso } from "@prisma/client";
import { Separator } from "@/components/ui/separator";
import { HeaderHabitaciones } from "./_components/header/HeaderHabitaciones";
import { HabitacionCard } from "./_components/HabitacionCard";
import { startOfDay, endOfDay } from "date-fns";

// Orden lógico para la vista del hotel
const ORDEN_PISOS: Piso[] = [
  "PLANTA_BAJA",
  "PRIMER_PISO",
  "SEGUNDO_PISO",
  "TERCER_PISO",
  "CUARTO_PISO",
];

export default async function HabitacionesPage() {
  const hoy = new Date();

  // 1. Fetch de datos (Habitaciones + Reservas críticas de hoy)
const [habitaciones, tipos] = await Promise.all([
    prisma.habitacion.findMany({
      include: {
        tipoActual: true,
        tipoBase: true,
        reservas: {
          where: {
            // Filtro 1: Evitamos traer ruido de reservas anuladas
            estado: { notIn: ["CANCELADA", "CHECKOUT"] },
            // Filtro 2: Solo reservas relevantes para la operación de hoy
            OR: [
              { estado: "CHECKIN" }, // Ocupantes actuales
              { 
                fechaEntrada: { 
                  gte: startOfDay(hoy), 
                  lte: endOfDay(hoy) 
                } 
              }, // Entradas de hoy
              { 
                fechaSalida: { 
                  gte: startOfDay(hoy), 
                  lte: endOfDay(hoy) 
                } 
              } // Salidas de hoy
            ]
          },
          orderBy: [
            // Prioridad 1: Quien ya está en la habitación (CHECKIN)
            { estado: 'desc' }, 
            // Prioridad 2: La reserva más antigua o próxima
            { fechaEntrada: 'asc' }
          ],
          include: {
            titular: true,
            tipoConfiguracion: true, // Fundamental para mostrar el tipo vendido
            _count: { 
              select: { huespedes: true } 
            }
          }
        }
      },
      orderBy: { 
        numero: "asc" 
      }
    }),
    prisma.tipoHabitacion.findMany({ 
      select: { 
        id: true, 
        nombre: true 
      } 
    })
  ]);
  
  // 2. Agrupamiento por Piso
  const habitacionesPorPiso = habitaciones.reduce((acc, hab) => {
    const piso = hab.piso;
    if (!acc[piso]) acc[piso] = [];
    acc[piso].push(hab);
    return acc;
  }, {} as Record<Piso, typeof habitaciones>);

  return (
    <div className="p-8 space-y-12 bg-slate-50/30 min-h-screen">
      {/* Cabecera con Buscador y Filtros */}
      <HeaderHabitaciones tipos={tipos} />

      {/* Renderizado de Pisos */}
      <div className="space-y-16">
        {ORDEN_PISOS.map((pisoKey) => {
          const habitacionesEnPiso = habitacionesPorPiso[pisoKey] || [];
          if (habitacionesEnPiso.length === 0) return null;

          return (
            <section key={pisoKey} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 whitespace-nowrap">
                  {pisoKey.replace("_", " ")}
                </h2>
                <Separator className="flex-1 bg-slate-200/60" />
                <span className="text-[9px] font-bold text-slate-400 bg-white border border-slate-100 px-3 py-1 rounded-full shadow-sm">
                  {habitacionesEnPiso.length} UNIDADES
                </span>
              </div>

              {/* Grid de Super Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {habitacionesEnPiso.map((hab) => (
                  <HabitacionCard key={hab.id} habitacion={hab as any} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}