"use server"

import { prisma } from "@/lib/prisma"

export async function buscarClientes(query: string) {
  if (!query || query.length < 2) return [];

  try {
    const clientes = await prisma.cliente.findMany({
      where: {
        OR: [
          { documento: { contains: query, mode: 'insensitive' } },
          { nombre: { contains: query, mode: 'insensitive' } },
          { apellido: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5, // Solo traemos los primeros 5 para que sea rápido
    });

    return clientes;
  } catch (error) {
    console.error("Error al buscar clientes:", error);
    return [];
  }
}