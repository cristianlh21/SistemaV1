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

export default async function HabitacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; tipo?: string }>;
}){
  // 1. Esperamos los parámetros de la URL
  const { q, estado, tipo } = await searchParams;
  const hoy = new Date();

  // 2. Ejecutamos la consulta dinámica
  const [habitaciones, tipos] = await Promise.all([
    prisma.habitacion.findMany({
      where: {
        // Filtro por Tipo (del Select del Header)
        ...(tipo && tipo !== "todos" ? { tipoActualId: tipo } : {}),
        
        // Filtros por Estado (de los botones del Header)
        ...(estado === "SUCIA" ? { estadoLimpieza: "SUCIA" } : {}),
        ...(estado === "MANTENIMIENTO" ? { mantenimiento: true } : {}),
        ...(estado === "LIBRE" ? { estadoOcupacion: "LIBRE" } : {}),
        ...(estado === "OCUPADA" ? { estadoOcupacion: "OCUPADA" } : {}),

        // Buscador de Huésped (del Input del Header)
        ...(q ? {
          reservas: {
            some: {
              estado: { in: ["CONFIRMADA", "CHECKIN", "CHECKOUT", "PENDIENTE"] },
              titular: {
                OR: [
                  { nombre: { contains: q, mode: 'insensitive' } },
                  { apellido: { contains: q, mode: 'insensitive' } },
                  { documento: { contains: q, mode: 'insensitive' } },
                ]
              }
            }
          }
        } : {}),
      },
      include: {
        tipoActual: true,
        tipoBase: true,
        reservas: {
          where: {
            // ESTA ES LA LÓGICA QUE YA TENÍAS Y NO TOCAMOS PARA NO ROMPER LAS CARDS
            estado: { notIn: ["CANCELADA", "CHECKOUT"] }, // Quitamos checkout de la vista principal
            OR: [
              { estado: "CHECKIN" },
              { fechaEntrada: { gte: startOfDay(hoy), lte: endOfDay(hoy) } },
            ]
          },
          include: {
            titular: true,
            tipoConfiguracion: true,
            _count: { select: { huespedes: true } }
          }
        }
      },
      orderBy: { numero: "asc" }
    }),
    // Traemos los tipos para el FiltroTipos del Header
    prisma.tipoHabitacion.findMany({ select: { id: true, nombre: true } })
  ]);

  // 1. Obtenemos los conteos totales de forma súper rápida
  const conteos = await prisma.habitacion.groupBy({
    by: ['estadoOcupacion', 'estadoLimpieza', 'mantenimiento'],
    _count: { _all: true }
  });

  // 2. Procesamos los resultados para pasarlos al Header
  const stats = {
    TOTAL: await prisma.habitacion.count(),
    LIBRE: await prisma.habitacion.count({ where: { estadoOcupacion: 'LIBRE', mantenimiento: false } }),
    OCUPADA: await prisma.habitacion.count({ where: { estadoOcupacion: 'OCUPADA' } }),
    SUCIA: await prisma.habitacion.count({ where: { estadoLimpieza: 'SUCIA' } }),
    MANTENIMIENTO: await prisma.habitacion.count({ where: { mantenimiento: true } }),
  };

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
      <HeaderHabitaciones tipos={tipos} stats={stats} />

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