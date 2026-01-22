// src/app/(dashboard)/dashboard/habitaciones/_components/HabitacionCardContent.tsx
interface Props {
  tipoActual: string;
  tipoBase: string;
  nombreHuesped?: string | null;
}

export function HabitacionCardContent({ tipoActual, tipoBase, nombreHuesped }: Props) {
  const isDowngraded = tipoActual !== tipoBase;

  return (
    <div className="px-4 py-3 text-center border-t border-b border-slate-50">
      <div className="flex flex-col items-center">
        <p className="text-xs font-bold text-slate-700 uppercase">{tipoActual}</p>
        {isDowngraded && (
          <p className="text-[9px] text-muted-foreground italic">
            Base: {tipoBase}
          </p>
        )}
      </div>

      {/* Nombre del Huésped (Placeholder para futura lógica de reservas) */}
      {nombreHuesped ? (
        <div className="mt-3 bg-blue-50/50 border border-blue-100 rounded-md py-1 px-2">
          <p className="text-[10px] font-medium text-blue-800 truncate uppercase">
             {nombreHuesped}
          </p>
        </div>
      ) : (
        <div className="mt-3 opacity-0">—</div> // Espaciador para mantener simetría
      )}
    </div>
  );
}