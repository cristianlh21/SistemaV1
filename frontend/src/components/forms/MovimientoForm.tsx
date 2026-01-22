// src/components/forms/MovimientoForm.tsx
"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TipoMovimiento, CategoriaMovimiento, MetodoPago } from "@prisma/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, DollarSign } from "lucide-react";

const movimientoSchema = z.object({
  monto: z.number().min(0, "El monto no puede ser negativo"),
  // Usamos el Enum de Prisma directamente en Zod
  tipo: z.enum(TipoMovimiento),
  categoria: z.enum(CategoriaMovimiento),
  metodoPago: z.enum(MetodoPago).optional(),
  descripcion: z.string().min(3, "La descripción es muy corta"),
});

export type MovimientoFormValues = z.infer<typeof movimientoSchema>;

interface MovimientoFormProps {
  reservaId?: string; // OPCIONAL: Solo se usa en la Ficha Maestra
  onSuccess: (values: MovimientoFormValues) => void; // Vuelve a pedir values para el Wizard
  defaultMonto?: number;
  defaultTipo?: TipoMovimiento;
  defaultCategoria?: CategoriaMovimiento;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function MovimientoForm({
  reservaId,
  onSuccess,
  defaultMonto = 0,
  defaultTipo = TipoMovimiento.INGRESO,
  defaultCategoria = CategoriaMovimiento.HABITACION,
  isSubmitting = false,
  submitLabel = "Registrar Movimiento"
}: MovimientoFormProps) {
  
  const form = useForm<MovimientoFormValues>({
    resolver: zodResolver(movimientoSchema),
    defaultValues: {
      monto: defaultMonto,
      tipo: defaultTipo,
      categoria: defaultCategoria,
      metodoPago: MetodoPago.EFECTIVO,
      descripcion: "",
    },
  });

  // Esta función es la que maneja el envío
  const handleInternalSubmit = (values: MovimientoFormValues) => {
    // Si hay reservaId, aquí podrías llamar a la Server Action directamente
    // Pero por ahora, simplemente devolvemos los valores al padre
    onSuccess(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleInternalSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="monto"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500">Importe</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    type="number" 
                    className="pl-10 h-14 text-2xl font-black bg-slate-50 border-2" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="metodoPago"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500">Medio de Pago</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 font-bold uppercase text-xs">
                      <SelectValue placeholder="Medio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(MetodoPago).map((metodo) => (
                      <SelectItem key={metodo} value={metodo} className="font-bold uppercase text-xs">
                        {metodo.replace(/_/g, " ")}
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
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500">Categoría</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 font-bold uppercase text-xs">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(CategoriaMovimiento).map((cat) => (
                      <SelectItem key={cat} value={cat} className="font-bold uppercase text-xs">
                        {cat.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500">Notas de la operación</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: Pago de adelanto..." className="resize-none font-medium min-h-20" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-14 font-black uppercase tracking-widest shadow-xl" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : submitLabel}
        </Button>
      </form>
    </Form>
  );
}