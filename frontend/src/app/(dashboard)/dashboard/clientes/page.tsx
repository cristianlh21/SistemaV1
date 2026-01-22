// src/app/(dashboard)/dashboard/clientes/page.tsx

import { getClientes } from "./_actions";
import { ClienteHeader } from "./_components/ClienteHeader";
import { ClienteList } from "./_components/ClienteList";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  // Extraemos el término de búsqueda de la URL
  const { query } = await searchParams;
  
  // El motor getClientes ya está preparado para recibir este query
  const res = await getClientes(query);
  const clientes = res.data || [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <ClienteHeader />
      <ClienteList clientesIniciales={clientes} />
    </div>
  );
}