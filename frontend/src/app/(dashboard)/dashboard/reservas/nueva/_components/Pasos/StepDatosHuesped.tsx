"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  UserPlus, 
  UserCheck, 
  User, 
  Loader2, 
  X 
} from "lucide-react";
import { buscarClientes } from "@/lib/actions/clientes";
import { ReservaWizardData, ClienteData } from "../../../types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Cliente } from "@prisma/client";
import { ClienteForm } from "@/app/(dashboard)/dashboard/clientes/_components/ClienteForm";

interface Props {
  formData: ReservaWizardData;
  updateFormData: (newData: Partial<ReservaWizardData>) => void;
}

export default function StepDatosHuesped({ formData, updateFormData }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<ClienteData[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 1. Buscador con "Debounce" (espera a que el usuario deje de escribir)
  useEffect(() => {
  const delayDebounceFn = setTimeout(async () => {
    if (busqueda.length >= 2) {
      setBuscando(true);
      try {
        // 1. Aquí recibimos directamente el array de clientes
        const res = await buscarClientes(busqueda);
        
        // 2. Lo guardamos directamente (usamos ClienteData[] para que TypeScript esté feliz)
        setResultados(res as unknown as ClienteData[]);
      } catch (error) {
        console.error("Error buscando clientes", error);
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    } else {
      setResultados([]);
    }
  }, 300);

  return () => clearTimeout(delayDebounceFn);
}, [busqueda]);

  // 2. Función clave: Qué pasa cuando creamos un cliente nuevo
  const handleClienteCreado = (nuevoCliente: Cliente) => {
    const clienteFormateado = nuevoCliente as unknown as ClienteData;
    
    // Lo seleccionamos en el estado global
    updateFormData({ 
      titularId: clienteFormateado.id, 
      titularSeleccionado: clienteFormateado 
    });

    // Lo inyectamos en la lista de resultados para que aparezca la Card azul
    setResultados([clienteFormateado]);
    setBusqueda(clienteFormateado.documento); // Ponemos su DNI en el buscador
    setIsDialogOpen(false); // Cerramos el modal
  };

  // 3. Función para deseleccionar o limpiar
  const limpiarSeleccion = () => {
    updateFormData({ titularId: undefined, titularSeleccionado: undefined });
    setBusqueda("");
    setResultados([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <User className="w-5 h-5 text-primary" /> 
          Identificar Huésped Titular
        </h2>
        <p className="text-sm text-muted-foreground">
          Busca al cliente existente o registra uno nuevo para la reserva.
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-4">
        {/* BUSCADOR PRINCIPAL */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="DNI, Nombre o Apellido..."
            className="pl-10 h-12 text-lg shadow-sm border-slate-200 focus-visible:ring-primary"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button 
              onClick={limpiarSeleccion}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* LISTADO DE RESULTADOS */}
        <div className="space-y-3 min-h-37.5">
          {buscando && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {/* Tarjetas de resultados */}
          {resultados.map((cliente) => (
            <Card
              key={cliente.id}
              className={`p-4 cursor-pointer hover:shadow-md transition-all border-2 ${
                formData.titularId === cliente.id 
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                  : "border-slate-100 bg-white dark:bg-slate-950"
              }`}
              onClick={() => updateFormData({ 
                titularId: cliente.id, 
                titularSeleccionado: cliente 
              })}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    formData.titularId === cliente.id ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                      {cliente.nombre} {cliente.apellido}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      DOCUMENTO: <span className="text-slate-700 dark:text-slate-300">{cliente.documento}</span>
                    </p>
                  </div>
                </div>
                {formData.titularId === cliente.id && (
                  <div className="bg-primary text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                    Titular
                  </div>
                )}
              </div>
            </Card>
          ))}

          {/* CASO: No hay resultados -> Botón para crear */}
          {!buscando && busqueda.length >= 2 && resultados.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center">
              <p className="text-sm text-slate-500 mb-4 font-medium">
                No se encontró ningún huésped con {busqueda}
              </p>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 shadow-lg shadow-primary/20">
                    <UserPlus className="w-4 h-4" /> Registrar Nuevo Huésped
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-125">
                  <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <UserPlus className="w-6 h-6 text-primary" />
                      Nuevo Registro de Cliente
                    </DialogTitle>
                  </DialogHeader>
                  
                  {/* Formulario de cliente que ya tienes hecho */}
                  <div className="mt-4">
                    <ClienteForm
                      onSuccess={handleClienteCreado}
                      submitLabel="Guardar y Seleccionar" 
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}