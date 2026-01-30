// src/app/(dashboard)/dashboard/reservas/[id]/checkout/page.tsx
import { prisma } from "@/lib/prisma";
import { differenceInDays } from "date-fns";
import { Receipt } from "lucide-react";
import { redirect } from "next/navigation";
import { ModalPagoCheckout } from "./ModalPagoCheckout";
import { BotonFinalizar } from "./BotonFinalizar";

// 1. IMPORTANTE: Cambiamos la definición de las props para avisar que es una Promise
export default async function CheckoutPage(props: {
  params: Promise<{ id: string }>;
}) {
  // 2. DESENVOLVEMOS los params antes de usarlos
  const params = await props.params;
  const id = params.id;

  // 3. Ahora Prisma recibirá el ID correctamente y no fallará
  const reserva = await prisma.reserva.findUnique({
    where: { id: id }, // <-- Ahora 'id' ya tiene el valor real
    include: {
      titular: true,
      habitacion: { include: { tipoActual: true } },
      movimientos: true, // Aprovechamos para traer los pagos/consumos
    },
  });

  if (!reserva) redirect("/dashboard/habitaciones");

  // --- 3. AQUÍ VAN LOS CÁLCULOS (Lógica de Negocio) ---

  // Calculamos noches (mínimo 1)
  const noches =
    differenceInDays(
      new Date(reserva.fechaSalida),
      new Date(reserva.fechaEntrada),
    ) || 1;
  const subtotalHabitacion = noches * reserva.precioPactado;

  // Sumamos los pagos registrados (Movimientos de tipo INGRESO)
  const totalPagado = reserva.movimientos
    .filter((m) => m.tipo === "INGRESO")
    .reduce((acc, m) => acc + m.monto, 0);

  // Sumamos consumos extras (Movimientos de tipo EGRESO o CARGO si los tienes así)
  // Si no tienes cargos extra todavía, dejamos en 0
  const totalConsumos = reserva.movimientos
    .filter((m) => m.tipo === "EGRESO")
    .reduce((acc, m) => acc + m.monto, 0);

  const totalGeneral = subtotalHabitacion + totalConsumos;
  const saldoPendiente = totalGeneral - totalPagado;
  const puedeFinalizar = saldoPendiente <= 0;

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      {/* Encabezado Estilo Ticket */}
      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl">
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">
              Resumen de Cuenta
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Habitación {reserva.habitacion.numero}
            </p>
          </div>
          <Receipt className="w-10 h-10 text-slate-700" />
        </div>

        <div className="p-8 space-y-6">
          {/* Datos del Titular */}
          <section className="border-b border-dashed border-slate-200 pb-6">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">
              Responsable de Pago
            </p>
            <h2 className="text-xl font-black text-slate-800 uppercase">
              {reserva.titular.apellido}, {reserva.titular.nombre}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              DNI: {reserva.titular.documento}
            </p>
          </section>

          {/* Detalle de Conceptos */}
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                <th className="py-2">Concepto</th>
                <th className="py-2 text-right">Cant.</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-slate-700">
              <tr className="border-b border-slate-50">
                <td className="py-4 uppercase">
                  Estadía - {reserva.habitacion.tipoActual.nombre}
                </td>
                <td className="py-4 text-right">{noches} nts</td>
                <td className="py-4 text-right">
                  ${subtotalHabitacion.toLocaleString()}
                </td>
              </tr>
              {/* Aquí mapearías los consumos si los tuvieras */}
            </tbody>
          </table>

          {/* Resumen Final */}
          <div className="bg-slate-50 rounded-3xl p-6 space-y-3">
            <div className="flex justify-between text-slate-500 font-bold uppercase text-xs">
              <span>Total Cargos</span>
              <span>${totalGeneral.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-bold uppercase text-xs">
              <span>Pagos Realizados</span>
              <span>- ${totalPagado.toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-lg font-black uppercase text-slate-800 tracking-tighter">
                Saldo a Pagar
              </span>
              <span
                className={`text-3xl font-black tracking-tighter ${saldoPendiente > 0 ? "text-rose-600" : "text-emerald-600"}`}
              >
                ${saldoPendiente.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones del Footer */}

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
          {/* USAMOS EL NUEVO COMPONENTE AQUÍ */}
          <ModalPagoCheckout reservaId={reserva.id} saldo={saldoPendiente} />

          <BotonFinalizar
            reservaId={reserva.id}
            habitacionId={reserva.habitacion.id}
            habilitado={puedeFinalizar}
          />
        </div>
      </div>
      <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
        * El checkout solo podrá realizarse con saldo igual a $0
      </p>
    </div>
  );
}
