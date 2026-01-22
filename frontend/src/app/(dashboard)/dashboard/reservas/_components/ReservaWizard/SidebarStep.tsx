// src/app/(dashboard)/dashboard/reservas/_components/reservaWizard/SidebarStep.tsx
"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, LucideIcon } from "lucide-react";

interface StepItem {
  id: number;
  name: string;
  description: string;
  icon: LucideIcon;
}

interface SidebarStepProps {
  step: StepItem;
  currentStep: number;
  isLast?: boolean;
}

export function SidebarStep({ step, currentStep, isLast = false }: SidebarStepProps) {
  const Icon = step.icon;
  const isCompleted = currentStep > step.id;
  const isCurrent = currentStep === step.id;

  return (
    <div className="relative flex items-center gap-4 py-4">
      {/* LÍNEA VERTICAL ANIMADA */}
      {!isLast && (
        <div className="absolute left-6 top-10 h-full w-0.5 bg-slate-100">
          <motion.div
            className="h-full w-full bg-primary"
            initial={{ height: "0%" }}
            animate={{ height: isCompleted ? "100%" : "0%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* BURBUJA DEL ICONO */}
      <motion.div
        className={cn(
          "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
          isCompleted
            ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
            : isCurrent
              ? "border-primary bg-white text-primary shadow-[0_0_0_4px_rgba(var(--primary),0.1)]"
              : "border-slate-200 bg-slate-50 text-slate-400"
        )}
        whileHover={{ scale: isCurrent ? 1 : 1.05 }}
      >
        {isCompleted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Check className="h-6 w-6" strokeWidth={3} />
          </motion.div>
        ) : (
          <Icon className="h-5 w-5" strokeWidth={isCurrent ? 2.5 : 2} />
        )}
      </motion.div>

      {/* TEXTO INFORMATIVO */}
      <div className="flex flex-col">
        <span
          className={cn(
            "text-sm font-black uppercase tracking-tight transition-colors duration-300",
            isCurrent || isCompleted ? "text-slate-900" : "text-slate-400"
          )}
        >
          {step.name}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400/80">
          {step.description}
        </span>
      </div>
    </div>
  );
}