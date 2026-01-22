// src/app/(dashboard)/dashboard/reservas/_components/reservaWizard/StepHuesped.tsx
"use client";

import { useState, useEffect } from "react";
import { StepProps } from "./types";
import { ClienteForm } from "../../../clientes/_components/ClienteForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, UserCheck, UserPlus, X, CheckCircle2, Loader2, User } from "lucide-react";
import { getClientes } from "../../../clientes/_actions"; // Usamos tu función existente
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Cliente } from "@prisma/client";

export function StepHuesped({ data, setData }: StepProps) {
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [mostrarFormularioNuevo, setMostrarFormularioNuevo] = useState(false);

  // 1. Lógica de búsqueda (Buscador "vivo")
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (busqueda.length > 2) {
        setLoading(true);
        const res = await getClientes(busqueda);
        if (res.success && res.data) {
          setResultados(res.data);
          // Si no hay resultados, sugerimos crear uno nuevo automáticamente
          setMostrarFormularioNuevo(res.data.length === 0);
        }
        setLoading(false);
      } else {
        setResultados([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [busqueda]);

  // 2. Selección de cliente
  const handleSeleccionar = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setData(prev => ({ 
    ...prev, 
    titularId: cliente.id,
    huespedNombre: cliente.nombre,     // <--- AGREGADO
    huespedApellido: cliente.apellido, // <--- AGREGADO
    huespedDni: cliente.documento,     // <--- AGREGADO
    huespedTelefono: cliente.telefono || "" // <--- AGREGADO (opcional)
  }));
    setMostrarFormularioNuevo(false);
  };

  const limpiarSeleccion = () => {
    setClienteSeleccionado(null);
    setData(prev => ({ ...prev, titularId: "" }));
    setBusqueda("");
  };

  // VISTA: CLIENTE YA SELECCIONADO
  if (data.titularId && (clienteSeleccionado || mostrarFormularioNuevo === false)) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="p-6 rounded-2xl border-2 border-primary bg-primary/5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Titular de la Reserva</p>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 leading-none">
                {clienteSeleccionado?.apellido}, {clienteSeleccionado?.nombre}
              </h3>
              <div className="flex gap-3 mt-2">
                <Badge variant="outline" className="text-[10px] font-bold border-slate-200 bg-white">
                  DNI: {clienteSeleccionado?.documento}
                </Badge>
                {clienteSeleccionado?.email && (
                   <Badge variant="outline" className="text-[10px] font-bold border-slate-200 bg-white">
                    {clienteSeleccionado.email}
                   </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={limpiarSeleccion} className="rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
            <X className="w-4 h-4 mr-2" /> Cambiar
          </Button>
        </div>

        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-xs font-black uppercase tracking-tight">Huésped vinculado correctamente</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* SECCIÓN BUSCADOR */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-400">1. Buscar Huésped (DNI, Nombre o Apellido)</Label>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Ej: Pérez o 32444..." 
            className="pl-12 h-14 text-lg font-bold border-slate-200 rounded-xl focus-visible:ring-primary/20"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* RESULTADOS DE BÚSQUEDA */}
        {resultados.length > 0 && !mostrarFormularioNuevo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-3">
            <p className="text-[10px] font-black uppercase text-slate-400 ml-1">Resultados encontrados</p>
            {resultados.map((cliente) => (
              <button
                key={cliente.id}
                onClick={() => handleSeleccionar(cliente)}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-primary hover:bg-primary/5 transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-sm">{cliente.apellido}, {cliente.nombre}</h4>
                    <p className="text-xs text-slate-500">Documento: {cliente.documento}</p>
                  </div>
                </div>
                <Badge className="opacity-0 group-hover:opacity-100 transition-opacity font-bold">Seleccionar</Badge>
              </button>
            ))}
          </motion.div>
        )}

        {/* BOTÓN PARA FORZAR ALTA NUEVA */}
        {!mostrarFormularioNuevo && busqueda.length > 2 && resultados.length === 0 && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             <Button 
              variant="outline" 
              className="w-full h-20 border-dashed border-2 flex flex-col gap-1 rounded-2xl hover:bg-primary/5 hover:border-primary transition-all"
              onClick={() => setMostrarFormularioNuevo(true)}
            >
              <UserPlus className="w-6 h-6 text-primary" />
              <span className="font-black uppercase text-xs">Registrar nuevo huésped: {busqueda}</span>
            </Button>
          </motion.div>
        )}

        {/* FORMULARIO DE ALTA (Ensamblado del átomo) */}
        {mostrarFormularioNuevo && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">Nuevo Registro</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setMostrarFormularioNuevo(false); setBusqueda(""); }}>
                Cancelar y volver a buscar
              </Button>
            </div>
            
            <div className="p-6 border rounded-3xl bg-slate-50/50 shadow-inner">
              <ClienteForm 
                onSuccess={(nuevoCliente: Cliente) => handleSeleccionar(nuevoCliente)}
                submitLabel="Registrar y Vincular a Reserva"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}