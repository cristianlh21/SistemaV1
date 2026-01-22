"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import { createSession } from "@/lib/session";

// 1. Definimos la "forma" de nuestra respuesta
export type AuthState = {
  error?: string; // El signo '?' significa que es opcional (puede no haber error)
} | null;

export async function loginAction(prevState: AuthState, formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const documento = formData.get("documento") as string;

  // 1. Buscamos al empleado en la base de datos
  const empleado = await prisma.empleado.findUnique({
    where: { nombre },
  });

  // 2. Validamos si existe y si el documento coincide
  if (!empleado || empleado.documento !== documento) {
    return { error: "El nombre o el documento son incorrectos." };
  }

  await createSession({
    id: empleado.id,
    nombre: empleado.nombre,
    rol: empleado.rol,
  });
  // 3. Si es correcto, lo mandamos al dashboard
  // (Más adelante aquí crearemos la cookie de sesión)
  redirect("/dashboard");
}
