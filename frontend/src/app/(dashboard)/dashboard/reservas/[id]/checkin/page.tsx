import { getReservaById } from "../_actions";
import { notFound, redirect } from "next/navigation";
import { CheckinWizard } from "./_components/CheckinWizard";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function CheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getReservaById(id);

  if (!res.success || !res.data) notFound();
  
  const reserva = res.data;

  // Si ya se hizo el check-in, lo devolvemos a la ficha
  if (reserva.estado === "CHECKIN") {
    redirect(`/dashboard/reservas/${id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-12">
      <div className="max-w-5xl mx-auto">
        
        {/* ENCABEZADO DE NAVEGACIÓN */}
        <div className="mb-8 flex items-center justify-between">
          <Link 
            href={`/dashboard/reservas/${id}`}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" /> Volver a la Ficha
          </Link>
          <div className="text-right">
            <span className="bg-primary/10 text-primary text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest">
              Proceso de Admisión
            </span>
          </div>
        </div>

        {/* TÍTULO PRINCIPAL */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">
            Check-in <span className="text-slate-400">#Hab {reserva.habitacion.numero}</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Titular: <span className="font-bold text-slate-700 uppercase">{reserva.titular.apellido}, {reserva.titular.nombre}</span>
          </p>
        </div>

        {/* EL COMPONENTE "MAGO" (WIZARD) */}
        <CheckinWizard reserva={reserva} />
        
      </div>
    </div>
  );
}