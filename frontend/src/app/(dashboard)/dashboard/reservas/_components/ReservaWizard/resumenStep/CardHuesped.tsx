// src/app/(dashboard)/dashboard/reservas/_components/reservaWizard/resumenStep/CardHuesped.tsx
"use client";

import { User, Fingerprint, Phone, Mail, BadgeCheck } from "lucide-react";

interface CardHuespedProps {
  nombre: string;
  apellido: string;
  documento: string;
  telefono?: string;
  email?: string;
}

export function CardHuesped({ nombre, apellido, documento, telefono, email }: CardHuespedProps) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {/* Icono de fondo decorativo */}
      <User className="absolute -right-4 -top-4 h-28 w-28 text-slate-50 opacity-60" />

      <div className="relative z-10 space-y-6">
        {/* Header del Huésped */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <User className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Titular de la Reserva
            </span>
          </div>
          <BadgeCheck className="h-5 w-5 text-emerald-500" />
        </div>

        {/* Información Principal del Nombre */}
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase text-blue-600 tracking-widest">Nombre Completo</p>
          <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800 leading-none">
            {apellido}, {nombre}
          </h3>
        </div>

        {/* Grid de Datos Técnicos */}
        <div className="grid grid-cols-2 gap-4 border-t border-dashed border-slate-100 pt-5">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Fingerprint className="h-3.5 w-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">Documento / DNI</span>
            </div>
            <p className="text-sm font-bold text-slate-700">{documento}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Phone className="h-3.5 w-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">Contacto</span>
            </div>
            <p className="text-sm font-bold text-slate-700">{telefono || "No registrado"}</p>
          </div>
        </div>

        {/* Email - Fila Inferior Opcional */}
        {email && (
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">{email}</span>
          </div>
        )}
      </div>
    </div>
  );
}