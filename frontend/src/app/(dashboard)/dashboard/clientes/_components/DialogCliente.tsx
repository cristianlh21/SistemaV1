// src/app/(dashboard)/dashboard/clientes/_components/DialogCliente.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClienteForm } from "./ClienteForm";

export function DialogCliente() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 px-6 font-bold gap-2 shadow-lg shadow-primary/20 uppercase tracking-tighter hover:scale-105 transition-transform">
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">Registro de Huésped</DialogTitle>
          <DialogDescription>
            Completa los datos para dar de alta al cliente en el sistema.
          </DialogDescription>
        </DialogHeader>
        <ClienteForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}