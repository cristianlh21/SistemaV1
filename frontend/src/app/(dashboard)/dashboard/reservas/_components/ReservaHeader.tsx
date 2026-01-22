// src/app/(dashboard)/dashboard/reservas/_components/ReservaHeader.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarCheck2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// IMPORTANTE: Asegúrate de que estas rutas coincidan con tu estructura
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReservaWizard } from "./ReservaWizard";

export function ReservaHeader() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [term, setTerm] = useState(searchParams.get("query")?.toString() || "");
  const [open, setOpen] = useState(false); // Estado para controlar el Modal

  useEffect(() => {
    const currentQuery = searchParams.get("query") || "";
    if (term === currentQuery) return;

    const delayDebounce = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (term) params.set("query", term);
      else params.delete("query");

      replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [term, pathname, replace, searchParams]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary">
          <CalendarCheck2 className="w-6 h-6 stroke-[2.5px]" />
          <h1 className="text-3xl font-black tracking-tight uppercase">
            Libro de Reservas
          </h1>
        </div>
        <p className="text-muted-foreground text-sm font-medium">
          Control de ocupación, ingresos y salidas del Shauard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 p-4 rounded-xl border shadow-sm">
        <div className="hidden md:block" />

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar por Habitación, DNI o Huésped..."
            className="pl-10 h-11 bg-muted/30 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-center font-bold"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          {/* INTEGRACIÓN DEL DIALOG */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 px-6 font-bold gap-2 shadow-lg shadow-primary/20 uppercase tracking-tighter hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
                Nueva Reserva
              </Button>
            </DialogTrigger>

            {/* Configuración visual del Modal:
               - max-w-[1100px]: Ancho ideal para el Wizard.
               - p-0 y overflow-hidden: Para que el diseño del Wizard toque los bordes.
            */}
            <DialogContent className="w-[95vw] max-w-287.5 h-[90vh] p-0 overflow-hidden border-none bg-transparent shadow-none sm:max-w-287.5">
              <DialogHeader className="sr-only">
                <DialogTitle>Nueva Reserva</DialogTitle>
              </DialogHeader>

              {/* El Wizard ahora ocupará el 100% de este alto */}
              <ReservaWizard onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
