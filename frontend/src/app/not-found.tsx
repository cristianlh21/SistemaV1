// src/app/not-found.tsx
"use client"; // Agregamos esto para evitar cualquier conflicto de servidor

import Link from "next/link";
import { BedDouble, ArrowLeft, Search } from "lucide-react";

// IMPORTANTE: Sin 'async' y con 'default'
export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* ICONO CENTRAL */}
        <div className="relative flex justify-center">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 relative">
            <BedDouble className="w-20 h-20 text-slate-800" strokeWidth={1.5} />
            <div className="absolute -top-2 -right-2 bg-pink-500 text-white p-3 rounded-2xl shadow-lg rotate-12">
              <Search className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* MENSAJE */}
        <div className="space-y-2">
          <h1 className="text-7xl font-black text-slate-200 tracking-tighter">404</h1>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            Habitación no encontrada
          </h2>
          <p className="text-slate-500 font-medium">
            Parece que esta habitación no está en nuestro inventario o el huésped ya hizo su salida.
          </p>
        </div>

        {/* BOTÓN DE RETORNO */}
        <div className="pt-4">
          <Link 
            href="/dashboard/habitaciones"
            className="inline-flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-200 group w-full"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver a Recepción
          </Link>
        </div>
      </div>
    </div>
  );
}