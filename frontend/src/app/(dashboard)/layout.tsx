import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Componentes y Libs
import { SidebarProvider } from "@/components/ui/sidebar";
import { decrypt } from "@/lib/session"; // Nuestra función de descifrado
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppSidebar } from "@/components/SideBar";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Dashboard | Hotel Shauard",
  description: "Sistema de gestión hotelera",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Obtener la sesión y validar (Doble seguridad aparte del Proxy)
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await decrypt(token) : null;

  // Si por alguna razón el proxy fallara, el layout protege los datos
  if (!session) {
    redirect("/");
  }

  // 2. Persistencia del estado del Sidebar
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider defaultOpen={defaultOpen}>
        <div className="flex min-h-screen w-full">
          {/* Menú Lateral: Recibe la sesión para filtrar roles */}
          <AppSidebar session={session} />
          
          <main className="flex-1 flex flex-col min-w-0 bg-background">
            {/* Barra Superior: Recibe la sesión para perfil y nombre */}
            <NavBar session={session} />
            
            {/* Contenido de las páginas (Habitaciones, Empleados, etc.) */}
            <div className="p-4 md:p-6 flex-1">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}