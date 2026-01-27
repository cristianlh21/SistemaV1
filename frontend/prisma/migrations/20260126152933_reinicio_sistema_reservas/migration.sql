-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'RECEPCIONISTA', 'MUCAMA');

-- CreateEnum
CREATE TYPE "Piso" AS ENUM ('PLANTA_BAJA', 'PRIMER_PISO', 'SEGUNDO_PISO', 'TERCER_PISO', 'CUARTO_PISO');

-- CreateEnum
CREATE TYPE "Ocupacion" AS ENUM ('LIBRE', 'OCUPADA');

-- CreateEnum
CREATE TYPE "Limpieza" AS ENUM ('SUCIA', 'LIMPIA');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CHECKIN', 'CHECKOUT', 'CANCELADA', 'NOSHOW', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'TRANSFERENCIA', 'DEPOSITO_BANCARIO', 'BILLETERA_VIRTUAL', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('INGRESO', 'EGRESO', 'CARGO');

-- CreateEnum
CREATE TYPE "CategoriaMovimiento" AS ENUM ('HABITACION', 'BAR_RESTAURANTE', 'LAVANDERIA', 'PROVEEDOR', 'SERVICIOS', 'SUELDOS', 'OTROS');

-- CreateTable
CREATE TABLE "Empleado" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'MUCAMA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoHabitacion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "TipoHabitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Habitacion" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "piso" "Piso" NOT NULL,
    "estadoOcupacion" "Ocupacion" NOT NULL DEFAULT 'LIBRE',
    "estadoLimpieza" "Limpieza" NOT NULL DEFAULT 'LIMPIA',
    "mantenimiento" BOOLEAN NOT NULL DEFAULT false,
    "tipoBaseId" TEXT NOT NULL,
    "tipoActualId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Habitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL,
    "numeroReserva" SERIAL NOT NULL,
    "habitacionId" TEXT NOT NULL,
    "tipoConfiguracionId" TEXT,
    "precioPactado" DOUBLE PRECISION NOT NULL,
    "titularId" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "empleadoId" TEXT,
    "fechaEntrada" TIMESTAMP(3) NOT NULL,
    "fechaSalida" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'PENDIENTE',
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimiento" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT,
    "tipo" "TipoMovimiento" NOT NULL,
    "categoria" "CategoriaMovimiento" NOT NULL DEFAULT 'HABITACION',
    "metodoPago" "MetodoPago",
    "descripcion" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RelacionHuespedes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RelacionHuespedes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empleado_nombre_key" ON "Empleado"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Empleado_documento_key" ON "Empleado"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "TipoHabitacion_nombre_key" ON "TipoHabitacion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Habitacion_numero_key" ON "Habitacion"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_documento_key" ON "Cliente"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_numeroReserva_key" ON "Reserva"("numeroReserva");

-- CreateIndex
CREATE INDEX "_RelacionHuespedes_B_index" ON "_RelacionHuespedes"("B");

-- AddForeignKey
ALTER TABLE "Habitacion" ADD CONSTRAINT "Habitacion_tipoBaseId_fkey" FOREIGN KEY ("tipoBaseId") REFERENCES "TipoHabitacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habitacion" ADD CONSTRAINT "Habitacion_tipoActualId_fkey" FOREIGN KEY ("tipoActualId") REFERENCES "TipoHabitacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_habitacionId_fkey" FOREIGN KEY ("habitacionId") REFERENCES "Habitacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_tipoConfiguracionId_fkey" FOREIGN KEY ("tipoConfiguracionId") REFERENCES "TipoHabitacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_titularId_fkey" FOREIGN KEY ("titularId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelacionHuespedes" ADD CONSTRAINT "_RelacionHuespedes_A_fkey" FOREIGN KEY ("A") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelacionHuespedes" ADD CONSTRAINT "_RelacionHuespedes_B_fkey" FOREIGN KEY ("B") REFERENCES "Reserva"("id") ON DELETE CASCADE ON UPDATE CASCADE;
