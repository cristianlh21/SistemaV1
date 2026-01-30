/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { ReservaParaCheckin } from "../types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BedDouble, 
  UserPlus, 
  Trash2, 
  MapPin,
  CheckCircle2,
  UserCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ejecutarCheckin } from "../_actions";
import { useRouter } from "next/navigation";

interface HuespedForm {
  id?: string;
  nombre: string;
  apellido: string;
  documento: string;
  direccion: string;
}

interface Props {
  reserva: ReservaParaCheckin;
}

export function CheckinWizard({ reserva }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // PROBLEMA 1: El checkbox ahora arranca seleccionado
  const [titularSeHospeda, setTitularSeHospeda] = useState(true);
  
  // Inicializamos el estado con los datos del titular ya cargados
  const [huespedes, setHuespedes] = useState<HuespedForm[]>(() => {
    const datosTitular: HuespedForm = {
      nombre: reserva.titular.nombre,
      apellido: reserva.titular.apellido,
      documento: reserva.titular.documento,
      direccion: reserva.titular.direccion || ""
    };
    return [datosTitular];
  });

  const handleTitularAsHuesped = (checked: boolean) => {
    setTitularSeHospeda(checked);
    if (checked) {
      const datosTitular: HuespedForm = {
        nombre: reserva.titular.nombre,
        apellido: reserva.titular.apellido,
        documento: reserva.titular.documento,
        direccion: reserva.titular.direccion || ""
      };
      setHuespedes(prev => [datosTitular, ...prev]);
    } else {
      // Al desmarcar, quitamos al titular por su documento
      setHuespedes(prev => prev.filter(h => h.documento !== reserva.titular.documento));
    }
  };

  const agregarHuesped = () => {
    setHuespedes([...huespedes, { nombre: "", apellido: "", documento: "", direccion: "" }]);
  };

  const eliminarHuesped = (index: number) => {
    setHuespedes(huespedes.filter((_, i) => i !== index));
  };

  const actualizarHuesped = (index: number, campo: keyof HuespedForm, valor: string) => {
    const nuevos = [...huespedes];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    setHuespedes(nuevos);
  };

  const handleFinalizar = async () => {
    if (huespedes.length === 0) return toast.error("Debe haber al menos un huésped");
    const incompletos = huespedes.some(h => !h.nombre || !h.apellido || !h.documento);
    if (incompletos) return toast.error("Completa todos los campos obligatorios");

    try {
      setLoading(true);
      const res = await ejecutarCheckin(reserva.id, { huespedes });

      if (res.success) {
        toast.success("Check-in exitoso");
        router.push(`/dashboard/reservas/${reserva.id}`);
        router.refresh();
      } else {
        toast.error("Error al procesar el ingreso");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const saldo = reserva.total - reserva.movimientos
    .filter(m => m.tipo === "INGRESO")
    .reduce((acc, m) => acc + m.monto, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* SECCIÓN FORMULARIO (ESTÉTICA ORIGINAL) */}
      <div className="lg:col-span-8 space-y-6">
        <Card className="p-8 border-none shadow-sm bg-white rounded-[2.5rem]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-slate-800">Ocupantes</h2>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
               <input 
                type="checkbox" 
                id="checkTitular" 
                className="w-4 h-4 rounded accent-primary cursor-pointer"
                checked={titularSeHospeda}
                onChange={(e) => handleTitularAsHuesped(e.target.checked)}
               />
               <Label htmlFor="checkTitular" className="text-[10px] font-black uppercase text-slate-500 cursor-pointer">
                 El titular se hospeda
               </Label>
            </div>
          </div>

          <div className="space-y-6">
            {huespedes.map((h, index) => (
              <div key={index} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative group transition-all">
                {/* Botón eliminar (Solo si no es el titular marcado) */}
                {index > 0 && (
                  <button 
                    onClick={() => eliminarHuesped(index)}
                    className="absolute -top-2 -right-2 bg-white border-2 border-slate-100 text-rose-500 p-2 rounded-full shadow-sm hover:scale-110 transition-transform"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Nombre</Label>
                    <Input 
                      className="h-12 rounded-xl bg-white border-2 border-slate-100 focus:border-primary transition-all font-bold uppercase text-xs"
                      value={h.nombre}
                      onChange={(e) => actualizarHuesped(index, "nombre", e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Apellido</Label>
                    <Input 
                      className="h-12 rounded-xl bg-white border-2 border-slate-100 focus:border-primary transition-all font-bold uppercase text-xs"
                      value={h.apellido}
                      onChange={(e) => actualizarHuesped(index, "apellido", e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">N° Documento</Label>
                    <Input 
                      className="h-12 rounded-xl bg-white border-2 border-slate-100 focus:border-primary transition-all font-bold uppercase text-xs"
                      value={h.documento}
                      onChange={(e) => actualizarHuesped(index, "documento", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Dirección / Procedencia</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <Input 
                        className="pl-10 h-12 rounded-xl bg-white border-2 border-slate-100 focus:border-primary transition-all font-bold uppercase text-xs"
                        value={h.direccion}
                        onChange={(e) => actualizarHuesped(index, "direccion", e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button 
              type="button" 
              variant="outline" 
              onClick={agregarHuesped}
              className="w-full h-14 rounded-2xl border-dashed border-2 border-slate-200 text-slate-400 hover:text-primary hover:border-primary/50 transition-all font-bold text-xs uppercase"
            >
              <UserPlus className="w-4 h-4 mr-2" /> Añadir otro acompañante
            </Button>
          </div>
        </Card>
      </div>

      {/* SECCIÓN RESUMEN DERECHA */}
      <div className="lg:col-span-4">
        <Card className="p-8 border-none shadow-xl bg-white rounded-[2.5rem] sticky top-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tighter text-slate-800">Confirmación</h3>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Configuración</p>
              <div className="flex items-center gap-3">
                <BedDouble className="w-5 h-5 text-primary" />
                <span className="font-bold text-xs uppercase text-slate-700">
                  {reserva.tipoConfiguracion?.nombre || "Base"}
                </span>
              </div>
            </div>

            <div className="bg-primary p-6 rounded-[2rem] text-center shadow-lg shadow-primary/20">
               <p className="text-[10px] font-black text-primary-foreground/80 uppercase mb-1 tracking-widest">Saldo Pendiente</p>
               <p className="text-4xl font-black text-white tracking-tighter">
                  ${saldo.toLocaleString()}
               </p>
            </div>
          </div>

          <Button 
            onClick={handleFinalizar}
            disabled={loading}
            className="w-full h-16 rounded-2xl font-black uppercase text-xs tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg border-b-4 border-emerald-700 active:border-b-0 transition-all active:scale-95"
          >
            {loading ? "Registrando..." : "Finalizar Check-in"}
          </Button>
        </Card>
      </div>
    </div>
  );
}