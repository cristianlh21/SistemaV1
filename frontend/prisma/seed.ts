import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// 1. CARGA DE VARIABLES
dotenv.config();

// 2. CONFIGURACIÓN DEL ADAPTADOR (A prueba de balas)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🏨 Sembrando datos reales de ShaurdHotel...");

  // 1. LIMPIEZA TOTAL (En orden para respetar claves foráneas)
  console.log("🧹 Limpiando base de datos...");
  await prisma.reserva.deleteMany({});
  await prisma.habitacion.deleteMany({});
  await prisma.tipoHabitacion.deleteMany({});
  await prisma.empleado.deleteMany({});

  // 2. CREACIÓN DE TIPOS DE HABITACIÓN
  console.log("✨ Creando tipos de habitación...");
  const t: Record<string, any> = {};
  const tiposData = [
    { key: "dobMat", nombre: "Doble Matrimonial", cap: 2 },
    { key: "dobTwin", nombre: "Doble Twin", cap: 2 },
    { key: "triMat", nombre: "Triple Matrimonial", cap: 3 },
    { key: "triTwin", nombre: "Triple Twin", cap: 3 },
    { key: "cuaMat", nombre: "Cuádruple Matrimonial", cap: 4 },
    { key: "cuaTwin", nombre: "Cuádruple Twin", cap: 4 },
    { key: "quiMat", nombre: "Quíntuple Matrimonial", cap: 5 },
    { key: "quiTwin", nombre: "Quíntuple Twin", cap: 5 },
  ];

  for (const item of tiposData) {
    t[item.key] = await prisma.tipoHabitacion.create({
      data: { 
        nombre: item.nombre, 
        capacidad: item.cap, 
        precio: 0, 
        descripcion: `Habitación ${item.nombre}`
      }
    });
  }

  // 3. MAPEO DE HABITACIONES POR PISO
  console.log("🏗️ Cargando habitaciones una por una...");
  const hotelMap = [
    // PLANTA BAJA
    { num: "501", piso: "PLANTA_BAJA", tipo: t.triMat.id },
    { num: "502", piso: "PLANTA_BAJA", tipo: t.cuaMat.id },
    { num: "503", piso: "PLANTA_BAJA", tipo: t.quiMat.id },
    { num: "504", piso: "PLANTA_BAJA", tipo: t.dobMat.id },
    { num: "505", piso: "PLANTA_BAJA", tipo: t.cuaMat.id },
    { num: "506", piso: "PLANTA_BAJA", tipo: t.quiMat.id },

    // PRIMER PISO
    { num: "101", piso: "PRIMER_PISO", tipo: t.dobMat.id },
    { num: "102", piso: "PRIMER_PISO", tipo: t.dobMat.id },
    { num: "103", piso: "PRIMER_PISO", tipo: t.dobMat.id },
    { num: "104", piso: "PRIMER_PISO", tipo: t.dobTwin.id },
    { num: "105", piso: "PRIMER_PISO", tipo: t.cuaTwin.id },
    { num: "106", piso: "PRIMER_PISO", tipo: t.quiTwin.id },
    { num: "107", piso: "PRIMER_PISO", tipo: t.triTwin.id },
    { num: "108", piso: "PRIMER_PISO", tipo: t.quiTwin.id },

    // SEGUNDO PISO
    { num: "201", piso: "SEGUNDO_PISO", tipo: t.dobMat.id },
    { num: "202", piso: "SEGUNDO_PISO", tipo: t.dobMat.id },
    { num: "203", piso: "SEGUNDO_PISO", tipo: t.dobMat.id },
    { num: "204", piso: "SEGUNDO_PISO", tipo: t.dobMat.id },
    { num: "205", piso: "SEGUNDO_PISO", tipo: t.dobTwin.id },
    { num: "206", piso: "SEGUNDO_PISO", tipo: t.dobMat.id },
    { num: "207", piso: "SEGUNDO_PISO", tipo: t.dobMat.id },
    { num: "208", piso: "SEGUNDO_PISO", tipo: t.dobMat.id },
    { num: "209", piso: "SEGUNDO_PISO", tipo: t.dobMat.id },
    { num: "210", piso: "SEGUNDO_PISO", tipo: t.triTwin.id },
    { num: "211", piso: "SEGUNDO_PISO", tipo: t.dobMat.id },
    { num: "212", piso: "SEGUNDO_PISO", tipo: t.triMat.id },

    // TERCER PISO
    { num: "301", piso: "TERCER_PISO", tipo: t.dobMat.id },
    { num: "302", piso: "TERCER_PISO", tipo: t.dobTwin.id },
    { num: "303", piso: "TERCER_PISO", tipo: t.dobMat.id },
    { num: "304", piso: "TERCER_PISO", tipo: t.dobTwin.id },
    { num: "305", piso: "TERCER_PISO", tipo: t.dobTwin.id },
    { num: "306", piso: "TERCER_PISO", tipo: t.dobMat.id },
    { num: "307", piso: "TERCER_PISO", tipo: t.dobMat.id },
    { num: "308", piso: "TERCER_PISO", tipo: t.dobTwin.id },
    { num: "309", piso: "TERCER_PISO", tipo: t.dobMat.id },
    { num: "310", piso: "TERCER_PISO", tipo: t.triTwin.id },
    { num: "311", piso: "TERCER_PISO", tipo: t.dobMat.id },
    { num: "312", piso: "TERCER_PISO", tipo: t.triMat.id },

    // CUARTO PISO
    { num: "401", piso: "CUARTO_PISO", tipo: t.dobMat.id },
    { num: "402", piso: "CUARTO_PISO", tipo: t.dobMat.id },
    { num: "403", piso: "CUARTO_PISO", tipo: t.dobMat.id },
    { num: "404", piso: "CUARTO_PISO", tipo: t.dobMat.id },
    { num: "405", piso: "CUARTO_PISO", tipo: t.dobMat.id },
    { num: "406", piso: "CUARTO_PISO", tipo: t.triTwin.id },
    { num: "407", piso: "CUARTO_PISO", tipo: t.dobMat.id },
    { num: "408", piso: "CUARTO_PISO", tipo: t.triMat.id },
    { num: "409", piso: "CUARTO_PISO", tipo: t.cuaTwin.id },
  ];

  for (const h of hotelMap) {
  await prisma.habitacion.create({
    data: {
      numero: h.num,
      piso: h.piso as any,
      // Nuevos campos según el esquema
      estadoOcupacion: "LIBRE",
      estadoLimpieza: "LIMPIA", // Las cargamos limpias la primera vez
      mantenimiento: false,
      tipoBaseId: h.tipo,
      tipoActualId: h.tipo,
    }
  });
}

  // 4. CREACIÓN DEL ADMINISTRADOR
  console.log("👤 Creando empleado administrador...");
  const admin = await prisma.empleado.upsert({
    where: { documento: "12345678" },
    update: {},
    create: {
      nombre: "Administrador",
      documento: "12345678",
      rol: "ADMIN",
    },
  });

  console.log(`✅ ¡Proceso terminado!`);
  console.log(`- Habitaciones: ${hotelMap.length}`);
  console.log(`- Admin: ${admin.nombre}`);
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });