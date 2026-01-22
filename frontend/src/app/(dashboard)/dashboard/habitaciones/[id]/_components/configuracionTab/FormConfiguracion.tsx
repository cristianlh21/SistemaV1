"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Piso, Prisma, TipoHabitacion } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { editarHabitacion } from "../../../_actions";
import { customToast } from "@/lib/toast";
import { Fingerprint, Hotel } from "lucide-react";

// Esquema extendido con todos los campos de configuración
const formSchema = z.object({
  numero: z.string().min(1, "El número es requerido"),
  piso: z.nativeEnum(Piso),
  tipoBaseId: z.string().min(1, "El tipo base es requerido"),
  tipoActualId: z.string().min(1, "El tipo actual es requerido"),
  mantenimiento: z.boolean(),
});

type HabitacionCompleta = Prisma.HabitacionGetPayload<{
  include: { tipoActual: true; tipoBase: true };
}>;

interface Props {
  habitacion: HabitacionCompleta;
  tiposDisponibles: TipoHabitacion[]; // Lista para los Selects
}

export function FormConfiguracion({ habitacion, tiposDisponibles }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numero: habitacion.numero,
      piso: habitacion.piso,
      tipoBaseId: habitacion.tipoBaseId,
      tipoActualId: habitacion.tipoActualId,
      mantenimiento: habitacion.mantenimiento,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await editarHabitacion(habitacion.id, values);
    if (res.success) customToast.success("Habitación actualizada con éxito");
    else customToast.error("Error al actualizar");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  
  {/* SECCIÓN 1: IDENTIDAD */}
  <Card className="p-6 border-none bg-muted/30 shadow-none flex flex-col justify-between">
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b pb-3">
        <Fingerprint className="w-5 h-5 text-primary" />
        <h4 className="font-bold text-sm uppercase tracking-tight">Identidad Física</h4>
      </div>
      
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="numero"
          render={({ field }) => (
            <FormItem className="w-full"> {/* Aseguramos el ancho total */}
              <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Número</FormLabel>
              <FormControl>
                <Input {...field} className="w-full bg-white border-2 h-11" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="piso"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Piso</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  {/* El w-full aquí es clave para que el select estire */}
                  <SelectTrigger className="w-full bg-white border-2 h-11">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(Piso).map((p) => (
                    <SelectItem key={p} value={p}>{p.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  </Card>

  {/* SECCIÓN 2: CATEGORIZACIÓN */}
  <Card className="p-6 border-none bg-muted/30 shadow-none flex flex-col justify-between">
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b pb-3">
        <Hotel className="w-5 h-5 text-primary" />
        <h4 className="font-bold text-sm uppercase tracking-tight">Venta y Capacidad</h4>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="tipoBaseId"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Tipo Base</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full bg-white border-2 h-11">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tiposDisponibles.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipoActualId"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Venta Actual</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full bg-white border-2 h-11">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tiposDisponibles.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  </Card>
</div>
        {/* ESTADO TÉCNICO */}
        <div className="p-4 border rounded-lg bg-muted/20 flex items-center justify-between">
          <div className="space-y-0.5">
            <FormLabel className="text-base">Estado de Mantenimiento</FormLabel>
            <FormDescription>Bloquea la habitación para reparaciones técnicas.</FormDescription>
          </div>
          <FormField
            control={form.control}
            name="mantenimiento"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">Actualizar Configuración Completa</Button>
      </form>
    </Form>
  );
}