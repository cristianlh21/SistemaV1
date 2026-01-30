// src/app/(dashboard)/dashboard/reservas/[id]/checkout/_components/BotonFinalizar.tsx
"use client";

import { useState } from "react";
import { finalizarCheckoutAction } from "../_actions";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function BotonFinalizar({ 
  reservaId, 
  habitacionId, 
  habilitado 
}: { 
  reservaId: string, 
  habitacionId: string, 
  habilitado: boolean 
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFinalizar = async () => {
    setLoading(true);
    const res = await finalizarCheckoutAction(reservaId, habitacionId);
    
    if (res.success) {
      toast.success("Checkout finalizado. Habitación liberada para limpieza.");
      router.push("/dashboard/habitaciones"); // Volvemos al panel principal
      router.refresh();
    } else {
      toast.error(res.error);
      setLoading(false);
    }
  };

  return (
    <button 
      disabled={!habilitado || loading}
      onClick={handleFinalizar}
      className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs transition-all flex items-center justify-center gap-3 ${
        habilitado 
        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95' 
        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
      }`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : habilitado ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      {loading ? "Procesando..." : "Finalizar Checkout"}
    </button>
  );
}