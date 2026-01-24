"use client";

import { Movimiento, MetodoPago } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Banknote, 
  Smartphone, 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TablaMovimientosProps {
  movimientos: Movimiento[];
}

const getIconoMetodo = (metodo: MetodoPago) => {
  switch (metodo) {
    case "EFECTIVO": return <Banknote className="w-3 h-3" />;
    case "TARJETA_CREDITO": return <CreditCard className="w-3 h-3" />;
    case "TARJETA_DEBITO": return <CreditCard className="w-3 h-3" />;
    case "TRANSFERENCIA": return <Smartphone className="w-3 h-3" />;
    default: return <CreditCard className="w-3 h-3" />;
  }
};

export function TablaMovimientos({ movimientos }: TablaMovimientosProps) {
  if (movimientos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-[2rem] bg-slate-50/50">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sin movimientos registrados</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
      <div className="p-6 border-b bg-slate-50/50">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Historial de Pagos y Movimientos</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-slate-50/30">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Concepto</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Método</th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {movimientos.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <p className="text-xs font-bold text-slate-700 capitalize">
                    {format(new Date(m.fecha), "dd MMM, yyyy", { locale: es })}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {format(new Date(m.fecha), "HH:mm 'hs'")}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${m.tipo === 'INGRESO' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {m.tipo === 'INGRESO' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight text-slate-700">{m.categoria.replace(/_/g, ' ')}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1 italic">{m.descripcion}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="gap-1.5 py-1 px-2 border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-500">
                    {getIconoMetodo(m.metodoPago || 'EFECTIVO')}
                    {m.metodoPago?.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm font-black ${m.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {m.tipo === 'INGRESO' ? '+' : '-'} ${m.monto.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}