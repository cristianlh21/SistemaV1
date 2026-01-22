"use server"; // 👈 Vital: Esto le dice a Next.js que es una acción de servidor

import { deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

/**
 * Esta función se encarga de:
 * 1. Eliminar la cookie 'session' del servidor.
 * 2. Redirigir al usuario a la página de login (/).
 */
export async function logoutAction() {
  await deleteSession();
  
  // El redirect lanza un error interno que Next.js captura 
  // para realizar la navegación, por eso no necesita return.
  redirect("/");
}