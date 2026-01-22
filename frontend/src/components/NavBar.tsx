"use client";

import { LogOut, Moon, Sun, User, Wallet } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "./ui/sidebar";
// ✅ CORRECCIÓN 1: Importamos la ACCIÓN, no la función de sesión directa
import { logoutAction } from "@/app/(dashboard)/_actions"; 
import { Badge } from "./ui/badge"; 
// ✅ CORRECCIÓN 2: El tipo viene del archivo seguro de tipos
import { SessionPayload } from "@/types/session";

interface NavBarProps {
  session: SessionPayload | null;
}

const NavBar = ({ session }: NavBarProps) => {
  const { setTheme } = useTheme();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="p-4 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      {/* LEFT SIDE: Control del Sidebar */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="hidden md:block">
          <Badge variant="outline" className="font-mono text-xs uppercase tracking-wider">
            {session?.rol || "Invitado"}
          </Badge>
        </div>
      </div>

      {/* RIGHT SIDE: Acciones y Usuario */}
      <div className="flex items-center gap-3">
        
        {/* THEME TOGGLE */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Cambiar tema</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>Claro</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>Oscuro</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>Sistema</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* USER PROFILE */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-9 w-9 border transition-hover hover:opacity-80">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {session ? getInitials(session.nombre) : "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" sideOffset={10}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.nombre}</p>
                <p className="text-xs leading-none text-muted-foreground uppercase">
                  {session?.rol}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Mi Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Wallet className="mr-2 h-4 w-4" />
              <span>Recibo de Sueldo</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              // ✅ CORRECCIÓN 3: Llamamos a la Server Action
              onClick={async () => {
                await logoutAction();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default NavBar;