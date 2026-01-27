// src/app/(dashboard)/dashboard/reservas/page.tsx
import { getReservas } from "./_actions";
import { ReservaHeader } from "./_components/ReservaHeader";
import { ReservaList } from "./_components/ReservaList";

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;

  // Pasamos el query al action para filtrar
  const res = await getReservas(query);
  const reservas = res.data || [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Cabecera modular con el buscador multi-parámetro */}
      <ReservaHeader />

      {/* Listado de Reservas filtrado */}
      <ReservaList reservasIniciales={reservas} />
    </div>
  );
}
