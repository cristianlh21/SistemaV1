"use client";

import {
  BedDouble,
  ClipboardCheck,
  Home,
  LogOut,
  LucideIcon,
  Settings,
  Users, // Agregué este para Empleados
  ConciergeBell,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { SessionPayload } from "@/types/session";
import { logoutAction } from "@/app/(dashboard)/_actions";

type Rol = "ADMIN" | "RECEPCIONISTA" | "MUCAMA";

interface SidebarProps {
  session: SessionPayload | null;
}

// Definimos el tipo para los items para tener autocompletado
type MenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  rolesPermitidos: Rol[];
};

const items: MenuItem[] = [
  {
    title: "Inicio",
    url: "/dashboard",
    icon: Home,
    rolesPermitidos: ["ADMIN", "MUCAMA", "RECEPCIONISTA"],
  },
  {
    title: "Reservas",
    url: "/dashboard/reservas",
    icon: ConciergeBell,
    rolesPermitidos: ["ADMIN", "RECEPCIONISTA"],
  },
  {
    title: "Empleados",
    url: "/dashboard/empleados",
    icon: Users,
    rolesPermitidos: ["ADMIN"], // Generalmente solo Admin ve esto
  },
  {
    title: "Clientes",
    url: "/dashboard/clientes",
    icon: Users,
    rolesPermitidos: ["ADMIN", "RECEPCIONISTA"],
  },
  {
    title: "Habitaciones",
    url: "/dashboard/habitaciones",
    icon: BedDouble,
    rolesPermitidos: ["ADMIN", "RECEPCIONISTA"],
  },
  {
    title: "Limpieza",
    url: "/dashboard/limpieza",
    icon: ClipboardCheck,
    rolesPermitidos: ["ADMIN", "MUCAMA", "RECEPCIONISTA"],
  },
  {
    title: "Ajustes",
    url: "/dashboard/settings",
    icon: Settings,
    rolesPermitidos: ["ADMIN"],
  },
];

export function AppSidebar({ session }: SidebarProps) {
  const userRol = session?.rol;
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-6">
          {!isCollapsed && (
            <h1 className="text-lg font-semibold">Hotel Management</h1>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Aplicación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // Si el rol del usuario no tiene permiso, saltamos este item
                if (!item.rolesPermitidos.includes(userRol as Rol)) {
                  return null;
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-2 text-sidebar-foreground hover:text-destructive hover:bg-destructive/10 ${
              isCollapsed ? "px-2" : ""
            }`}
            onClick={async () => {
              await logoutAction();
              window.location.href = "/";
            }}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}