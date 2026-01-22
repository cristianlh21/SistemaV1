"use client";

import { Prisma } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserMinus, UserPlus, AlertCircle } from "lucide-react";
import { EstadoLimpiezaToggle } from "../../../_components/EstadoLimpiezaToggle";
import { EstadoMantenimientoToggle } from "../../../_components/EstadoMantenimientoToggle";

type HabitacionCompleta = Prisma.HabitacionGetPayload<{
  include: { tipoActual: true; tipoBase: true };
}>;

export function PanelOperaciones({
  habitacion,
}: {
  habitacion: HabitacionCompleta;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CARD: ESTADO DE LA HABITACIÓN */}
      <Card className="p-6 border-2 flex flex-col justify-between space-y-6">
        <div>
          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Mantenimiento y Limpieza
          </h4>
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border">
            <div
              className={`p-3 rounded-full ${habitacion.estadoLimpieza === "LIMPIA" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}
            >
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado actual</p>
              <p className="font-bold text-lg">{habitacion.estadoLimpieza}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p>Control de Limpieza:</p>
          <EstadoLimpiezaToggle
            habitacionId={habitacion.id}
            estadoActual={habitacion.estadoLimpieza}
          />
        </div>

        <EstadoMantenimientoToggle
          habitacionId={habitacion.id}
          enMantenimiento={habitacion.mantenimiento}
        />
      </Card>

      {/* CARD: FLUJO DE HUÉSPEDES */}
      <Card className="p-6 border-2 flex flex-col justify-between space-y-6">
        <div>
          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Ocupación
          </h4>
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border">
            <div
              className={`p-3 rounded-full ${habitacion.estadoOcupacion === "LIBRE" ? "bg-blue-100 text-blue-600" : "bg-rose-100 text-rose-600"}`}
            >
              {habitacion.estadoOcupacion === "LIBRE" ? (
                <UserPlus className="w-6 h-6" />
              ) : (
                <UserMinus className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Situación</p>
              <p className="font-bold text-lg">{habitacion.estadoOcupacion}</p>
            </div>
          </div>
        </div>

        {habitacion.estadoOcupacion === "LIBRE" ? (
          <Button className="h-16 text-lg font-bold bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg shadow-blue-200">
            <UserPlus className="w-5 h-5" /> Iniciar Check-in
          </Button>
        ) : (
          <Button
            variant="destructive"
            className="h-16 text-lg font-bold gap-2 shadow-lg shadow-destructive/20"
          >
            <UserMinus className="w-5 h-5" /> Realizar Check-out
          </Button>
        )}
      </Card>
    </div>
  );
}
