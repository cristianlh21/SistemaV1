import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, History, Construction, ClipboardList } from "lucide-react";
import { FormularioEdicionHabitacion } from "./_components/FormularioEdicionHabitacion";
import { formatEnumLetra } from "@/lib/utils";
// Importa tus componentes de formulario e historial (los crearemos abajo)
// import { FormularioEdicionHabitacion } from "./_components/FormularioEdicionHabitacion";
// import { HistorialOcupacion } from "./_components/HistorialOcupacion";

export default async function HabitacionSettingsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  // Ejecutamos ambas consultas al mismo tiempo
  const [habitacion, todosLosTipos] = await Promise.all([
    prisma.habitacion.findUnique({
      where: { id },
      include: { 
        tipoActual: true, 
        tipoBase: true,
        reservas: {
          where: { estado: "CHECKOUT" },
          include: { titular: true, movimientos: true },
          orderBy: { fechaSalida: "desc" },
          take: 10
        }
      }
    }),
    prisma.tipoHabitacion.findMany() // <--- Esta consulta define "todosLosTipos"
  ]);

  if (!habitacion) notFound();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Cabecera Estilizada */}
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
            <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-xl">
                <Settings2 className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-slate-800">
                    Habitación {habitacion.numero}
                </h1>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                    Gestión y Auditoría de Unidad
                </p>
            </div>
        </div>
      </header>

      <Tabs defaultValue="edicion" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-2xl h-14 mb-8">
          <TabsTrigger value="edicion" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Settings2 className="w-4 h-4 mr-2" /> Edición General
          </TabsTrigger>
          <TabsTrigger value="historial" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <History className="w-4 h-4 mr-2" /> Historial Ocupación
          </TabsTrigger>
          <TabsTrigger value="mantenimiento" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Construction className="w-4 h-4 mr-2" /> Limpieza y Mant.
          </TabsTrigger>
        </TabsList>

        {/* PESTAÑA 1: FORMULARIO DE EDICIÓN */}
        <TabsContent value="edicion">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 shadow-sm">
              <h3 className="font-black uppercase text-xs text-slate-400 mb-6 flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Datos Estructurales
              </h3>
              {/* Aquí llamarías a <FormularioEdicionHabitacion habitacion={habitacion} /> */}
              <FormularioEdicionHabitacion
                habitacion={habitacion} 
                tipos={todosLosTipos} 
              />
            </div>
            
            <div className="bg-slate-50 rounded-[2.5rem] p-8 border-2 border-white shadow-inner">
               <h3 className="font-black uppercase text-xs text-slate-400 mb-6">Resumen Actual</h3>
               <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2 border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Piso</span>
                    <span className="text-sm font-black text-slate-800">{formatEnumLetra(habitacion.piso)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Tipo Base</span>
                    <span className="text-sm font-black text-slate-800">{habitacion.tipoBase.nombre}</span>
                  </div>
               </div>
            </div>
          </div>
        </TabsContent>

        {/* PESTAÑA 2: HISTORIAL DE OCUPACIÓN */}
        <TabsContent value="historial">
           <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase">
                    <th className="px-6 py-4 text-left">Huésped Titular</th>
                    <th className="px-6 py-4 text-left">Periodo</th>
                    <th className="px-6 py-4 text-right">Estadía</th>
                    <th className="px-6 py-4 text-right">Consumos</th>
                    <th className="px-6 py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {habitacion.reservas.map((reserva) => {
                      const totalConsumos = reserva.movimientos.filter(m => m.tipo === "EGRESO").reduce((acc, m) => acc + m.monto, 0);
                      const totalEstadia = (reserva.precioPactado || 0); // Ajustar según lógica de días
                      
                      return (
                        <tr key={reserva.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-700 uppercase text-xs">{reserva.titular.apellido}, {reserva.titular.nombre}</td>
                          <td className="px-6 py-4 text-slate-500 text-[11px] font-medium">
                            {new Date(reserva.fechaEntrada).toLocaleDateString()} - {new Date(reserva.fechaSalida).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-600 text-xs">${totalEstadia.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-600 text-xs">${totalConsumos.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-black text-slate-800 text-xs">${(totalEstadia + totalConsumos).toLocaleString()}</td>
                        </tr>
                      )
                   })}
                </tbody>
              </table>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}