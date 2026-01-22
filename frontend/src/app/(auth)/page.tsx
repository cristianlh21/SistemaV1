"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { loginAction } from "./_actions";
import { useState } from "react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// 1. Definimos el esquema (Contrato)
const loginSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  documento: z.string().min(4, {
    message: "El documento debe tener al menos 4 caracteres.",
  }),
});

// 2. Extraemos el tipo automáticamente (¡Adiós al 'any'!)
type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [errorServer, setErrorServer] = useState<string | null>(null);

  // 3. Inicializamos el formulario
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      nombre: "",
      documento: "",
    },
  });

  // 4. Función que se ejecuta al pasar la validación de Zod
  async function onSubmit(values: LoginValues) {
    setErrorServer(null);
    
    // Creamos el FormData manualmente para nuestra Server Action
    const formData = new FormData();
    formData.append("nombre", values.nombre);
    formData.append("documento", values.documento);

    const result = await loginAction(null, formData);
    
    if (result?.error) {
      setErrorServer(result.error);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Shauard Hotel</CardTitle>
        <CardDescription className="text-center">Control de Acceso</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empleado</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre registrado" {...field} />
                  </FormControl>
                  <FormMessage /> {/* <-- Aquí aparece el error de Zod */}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña (Documento)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Tu DNI" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorServer && (
              <p className="text-sm font-medium text-destructive text-center">
                {errorServer}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Accediendo..." : "Ingresar"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}