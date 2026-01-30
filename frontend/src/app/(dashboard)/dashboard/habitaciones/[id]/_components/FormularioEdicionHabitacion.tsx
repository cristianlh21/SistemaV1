/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Habitacion, Piso, TipoHabitacion } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { actualizarHabitacionAction } from "../_actions";

// 1. Esquema de validación
const formSchema = z.object({
  numero: z.string().min(1, "El número es obligatorio"),
  piso: z.enum(Piso),
  tipoBaseId: z.string().min(1, "Debes seleccionar un tipo base"),
  tipoActualId: z.string().min(1, "Debes seleccionar un tipo actual"),
});

interface Props {
  habitacion: Habitacion & {
    tipoActual: TipoHabitacion;
    tipoBase: TipoHabitacion;
  };
  tipos: TipoHabitacion[];
}

export function FormularioEdicionHabitacion({ habitacion, tipos }: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numero: habitacion.numero,
      piso: habitacion.piso,
      tipoBaseId: habitacion.tipoBaseId,
      tipoActualId: habitacion.tipoActualId,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const res = await actualizarHabitacionAction(habitacion.id, values);

      if (res.success) {
        toast.success("Habitación actualizada correctamente");
      } else {
        toast.error("Error al actualizar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase text-slate-400">
                  Nro. Habitación
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="rounded-xl border-2 focus:border-slate-800 transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="piso"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase text-slate-400">
                  Piso / Sector
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl border-2">
                      <SelectValue placeholder="Selecciona piso" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(Piso).map((p) => (
                      <SelectItem key={p} value={p}>
                        {p.replace("_", " ")}{" "}
                        {/* Convierte PLANTA_BAJA a PLANTA BAJA */}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipoBaseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase text-slate-400">
                  Tipo Estructural (Base)
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl border-2">
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tipos.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nombre}
                      </SelectItem>
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
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase text-slate-400">
                  Configuración Actual
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl border-2">
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tipos.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-slate-900 hover:bg-black text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar Cambios
        </Button>
      </form>
    </Form>
  );
}
