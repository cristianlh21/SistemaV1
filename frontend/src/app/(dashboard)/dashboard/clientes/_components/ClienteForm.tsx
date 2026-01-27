// src/app/(dashboard)/dashboard/clientes/_components/ClienteForm.tsx
"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { crearCliente } from "../_actions";
import { toast } from "sonner";
import { Cliente } from "@prisma/client"; // Importamos el tipo de Prisma

// Definimos la interfaz de las props para que el Wizard pueda recibir al cliente
interface ClienteFormProps {
  onSuccess: (cliente: Cliente) => void; 
  isEdit?: boolean;
  submitLabel?: string;
}

const clientSchema = z.object({
  nombre: z.string().min(2, "El nombre es muy corto"),
  apellido: z.string().min(2, "El apellido es muy corto"),
  documento: z.string().min(5, "Documento inválido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export function ClienteForm({ onSuccess, submitLabel = "Guardar Huésped" }: ClienteFormProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      documento: "",
      email: "",
      telefono: "",
      direccion: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: ClientFormValues) {
    const res = await crearCliente(values);
    if (res.success && res.data) {
      toast.success("Huésped registrado con éxito");
      // Pasamos el cliente creado (res.data) al componente padre
      onSuccess(res.data as Cliente);
    } else {
      toast.error(res.error || "Ocurrió un error al crear el cliente");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-xs uppercase text-slate-500">Nombre</FormLabel>
                <FormControl><Input placeholder="Ej: Juan" {...field} className="font-semibold" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-xs uppercase text-slate-500">Apellido</FormLabel>
                <FormControl><Input placeholder="Ej: Pérez" {...field} className="font-semibold" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="documento"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-xs uppercase text-primary">Documento (Identidad)</FormLabel>
              <FormControl><Input placeholder="DNI o Pasaporte" {...field} className="font-bold bg-primary/5 border-primary/20" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4 border-t border-dashed pt-4">
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-xs uppercase text-slate-500">Teléfono</FormLabel>
                <FormControl><Input placeholder="+54..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-xs uppercase text-slate-500">Email</FormLabel>
                <FormControl><Input placeholder="correo@ejemplo.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-xs uppercase text-slate-500">Procedencia / Dirección</FormLabel>
              <FormControl><Input placeholder="Ciudad, País" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full font-black uppercase tracking-widest h-12 shadow-lg" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}