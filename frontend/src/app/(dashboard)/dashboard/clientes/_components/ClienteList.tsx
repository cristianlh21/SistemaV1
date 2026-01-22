// src/app/(dashboard)/dashboard/clientes/_components/ClienteList.tsx
"use client";

import { Cliente } from "@prisma/client";
import { ClienteCard } from "./ClienteCard";

interface Props {
  clientesIniciales: Cliente[];
}

export function ClienteList({ clientesIniciales }: Props) {
  if (clientesIniciales.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed">
        <p className="text-slate-400 font-medium">No hay clientes registrados con esos criterios.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {clientesIniciales.map((cliente) => (
        <ClienteCard key={cliente.id} cliente={cliente} />
      ))}
    </div>
  );
}