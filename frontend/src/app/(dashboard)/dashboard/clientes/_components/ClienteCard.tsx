// src/app/(dashboard)/dashboard/clientes/_components/ClienteCard.tsx
import { Card } from "@/components/ui/card";
import { Cliente } from "@prisma/client";
import { Phone, MapPin, IdCard, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClienteCard({ cliente }: { cliente: Cliente }) {
  // Generar iniciales (Ej: Juan Perez -> PJ)
  const iniciales = `${cliente.apellido.charAt(0)}${cliente.nombre.charAt(0)}`.toUpperCase();

  return (
    <Card className="group hover:border-primary/40 transition-all duration-200 shadow-sm hover:shadow-md border-slate-200 overflow-hidden">
      <div className="flex items-center p-4 gap-6">
        
        {/* AVATAR CUADRADO */}
        <div className="shrink-0 w-14 h-14 bg-slate-100 border-2 border-slate-200 rounded-lg flex items-center justify-center text-slate-600 font-black text-xl tracking-tighter group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-colors">
          {iniciales}
        </div>

        {/* NOMBRE Y APELLIDO (Jerarquía) */}
        <div className="flex-1 min-w-50">
          <h3 className="text-lg font-black leading-tight text-slate-900 uppercase tracking-tight">
            {cliente.apellido}
          </h3>
          <p className="text-sm font-medium text-slate-500 capitalize">
            {cliente.nombre}
          </p>
        </div>

        {/* DATOS DEL CLIENTE (Columnas visuales) */}
        <div className="hidden lg:grid grid-cols-3 gap-8 flex-2">
          
          {/* Documento */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-full text-slate-400">
              <IdCard className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Documento</span>
              <span className="text-sm font-bold text-slate-700">{cliente.documento}</span>
            </div>
          </div>

          {/* Nacionalidad / Lugar */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-full text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Lugar</span>
              <span className="text-sm font-bold text-slate-700 truncate max-w-30">
                {cliente.direccion || "No especificado"}
              </span>
            </div>
          </div>

          {/* Teléfono */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-full text-emerald-500/20">
              <Phone className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Teléfono</span>
              <span className="text-sm font-bold text-slate-700">{cliente.telefono || "—"}</span>
            </div>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="shrink-0">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}