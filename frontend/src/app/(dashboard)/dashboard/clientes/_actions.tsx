/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. BUSCAR Y LISTAR CLIENTES
// Esta acción servirá tanto para la carga inicial como para el buscador vivo
export async function getClientes(query?: string) {
  try {
    const clientes = await prisma.cliente.findMany({
      where: query ? {
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { apellido: { contains: query, mode: 'insensitive' } },
          { documento: { contains: query, mode: 'insensitive' } },
        ],
      } : {},
      orderBy: {
        apellido: 'asc', // Ordenar por apellido para que el listado sea lógico
      },
      take: 20, // Paginación inicial (podemos ampliarla luego)
    });
    return { success: true, data: clientes };
  } catch (error) {
    return { success: false, error: "Error al obtener los clientes" };
  }
}

// 2. CREAR NUEVO CLIENTE
export async function crearCliente(data: {
  nombre: string;
  apellido: string;
  documento: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}) {
  try {
    // Verificamos si ya existe el DNI para evitar errores de base de datos
    const existe = await prisma.cliente.findUnique({
      where: { documento: data.documento }
    });

    if (existe) {
      return { success: false, error: "Ya existe un cliente con ese documento" };
    }

    const nuevoCliente = await prisma.cliente.create({ data });
    
    revalidatePath("/dashboard/clientes");
    return { success: true, data: nuevoCliente };
  } catch (error) {
    return { success: false, error: "No se pudo crear el cliente" };
  }
}

// 3. EDITAR CLIENTE EXISTENTE
export async function editarCliente(id: string, data: Partial<{
  nombre: string;
  apellido: string;
  documento: string;
  email: string;
  telefono: string;
  direccion: string;
}>) {
  try {
    const actualizado = await prisma.cliente.update({
      where: { id },
      data,
    });
    
    revalidatePath("/dashboard/clientes");
    return { success: true, data: actualizado };
  } catch (error) {
    return { success: false, error: "Error al actualizar los datos" };
  }
}