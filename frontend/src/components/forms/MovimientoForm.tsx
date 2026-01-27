"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TipoMovimiento,
  CategoriaMovimiento,
  MetodoPago,
} from "@prisma/client";
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

// 1. CORRECCIÓN EN EL SCHEMA: El schema debe reflejar lo que el formulario maneja
const movimientoSchema = z.object({
  monto: z.number().min(0, "El monto no puede ser negativo"),
  tipo: z.nativeEnum(TipoMovimiento),
  categoria: z.nativeEnum(CategoriaMovimiento),
  metodoPago: z.nativeEnum(MetodoPago),
  descripcion: z.string().min(3, "La descripción es muy corta"),
  reservaId: z.string().optional(),
});

export type MovimientoFormValues = z.infer<typeof movimientoSchema>;

interface MovimientoFormProps {
  onSuccess: (values: MovimientoFormValues) => void;
  reservaId?: string;
  montoSugerido?: number; // Este es el que pasamos desde la botonera
  defaultMetodo?: MetodoPago;
  defaultDescripcion?: string;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function MovimientoForm({
  onSuccess,
  reservaId,
  montoSugerido = 0, // Valor por defecto si no viene nada
  defaultMetodo = MetodoPago.EFECTIVO,
  defaultDescripcion = "",
  isSubmitting = false,
  submitLabel = "Registrar Movimiento",
}: MovimientoFormProps) {
  // 2. CORRECCIÓN EN DEFAULT VALUES: Usamos montoSugerido para el monto inicial
  const form = useForm<MovimientoFormValues>({
    resolver: zodResolver(movimientoSchema),
    defaultValues: {
      reservaId: reservaId || "",
      monto: montoSugerido > 0 ? montoSugerido : 0, // Si hay saldo, lo ponemos acá
      tipo: TipoMovimiento.INGRESO,
      categoria: CategoriaMovimiento.HABITACION,
      metodoPago: defaultMetodo,
      descripcion: defaultDescripcion || (reservaId ? "Pago de reserva" : ""),
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSuccess)} className="space-y-5">
        {/* MONTO */}
        <FormField
          control={form.control}
          name="monto"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500">
                Importe a Cobrar
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="number"
                    className="pl-10 h-14 text-2xl font-black bg-slate-50 border-2 border-slate-200 focus:border-primary transition-all shadow-sm"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* MEDIO DE PAGO */}
          <FormField
            control={form.control}
            name="metodoPago"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Medio de Pago
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 font-bold uppercase text-xs border-2">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(MetodoPago).map((metodo) => (
                      <SelectItem
                        key={metodo}
                        value={metodo}
                        className="font-bold uppercase text-xs"
                      >
                        {metodo.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* CATEGORÍA (Bloqueada si es reserva, libre si es general) */}
          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Categoría
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!!reservaId}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 font-bold uppercase text-xs border-2">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(CategoriaMovimiento).map((cat) => (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className="font-bold uppercase text-xs"
                      >
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        {/* DESCRIPCIÓN */}
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-500">
                Observaciones
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: Saldo de estancia..."
                  className="resize-none font-medium min-h-25 bg-slate-50 border-2"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-14 font-black uppercase tracking-widest shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-[0.98]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            submitLabel
          )}
        </Button>
      </form>
    </Form>
  );
}
