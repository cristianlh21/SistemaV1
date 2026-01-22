// src/app/(dashboard)/dashboard/clientes/_components/ClienteHeader.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { DialogCliente } from "./DialogCliente";
import { Search, User } from "lucide-react";

export function ClienteHeader() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // 1. Estado local para el input (inicializado con la URL actual)
  const [term, setTerm] = useState(searchParams.get("query")?.toString() || "");

  useEffect(() => {
    // 2. Verificamos si el término local es igual al de la URL para evitar bucles innecesarios
    const currentQuery = searchParams.get("query") || "";
    if (term === currentQuery) return;

    // 3. Debounce para no saturar el servidor mientras el usuario escribe
    const delayDebounce = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (term) {
        params.set("query", term);
      } else {
        params.delete("query");
      }

      // 4. Actualizamos la URL. 
      // 'scroll: false' es clave para una experiencia fluida sin saltos.
      replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [term, pathname, replace, searchParams]);

  return (
    <div className="flex flex-col gap-6">
      {/* Título y Leyenda */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary">
          <User className="w-6 h-6" />
          <h1 className="text-3xl font-black tracking-tight uppercase">
            Gestión de Huéspedes
          </h1>
        </div>
        <p className="text-muted-foreground text-sm font-medium">
          Administra la base de datos de clientes, consulta historiales y registra nuevos perfiles para el Shauard.
        </p>
      </div>

      {/* Fila de Herramientas (Buscador central y Botón) */}
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
        
        {/* Espacio vacío a la izquierda para centrar el buscador en pantallas medianas */}
        <div className="hidden md:block" />

        {/* Buscador Central */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar por DNI, Nombre o Apellido..."
            className="pl-10 h-11 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-center placeholder:text-muted-foreground/60"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>

        {/* Botón Nuevo Cliente a la derecha */}
        <div className="flex justify-end">
          <DialogCliente />
        </div>
      </div>
    </div>
  );
}