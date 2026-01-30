// src/app/(dashboard)/dashboard/habitaciones/_components/header/BuscadorHuespedes.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function BuscadorHuespedes() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Función de búsqueda "limpia"
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    // Solo hacemos el replace cuando el usuario interactúa
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
      <Input 
        placeholder="BUSCAR POR HUÉSPED O DOCUMENTO..." 
        className="h-12 pl-12 rounded-2xl bg-slate-50 border-none font-bold text-xs uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
        defaultValue={searchParams.get("q")?.toString()} // IMPORTANTE: Usar defaultValue
        onChange={(e) => handleSearch(e.target.value)} // El evento manda, no el useEffect
      />
    </div>
  );
}