import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

// 1. Definimos qué rutas queremos proteger
const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Verificamos si la ruta actual empieza con /dashboard
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  // 2. Obtenemos y desciframos la sesión
  const cookie = req.cookies.get("session")?.value;
  const session = cookie ? await decrypt(cookie) : null;

  // 3. REGLA: Si no hay sesión y es ruta protegida -> Al Login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // 4. REGLA: Si ya hay sesión e intenta ir al Login -> Al Dashboard
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Configuración para que el proxy solo se ejecute en estas rutas
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};