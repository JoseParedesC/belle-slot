import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.configuracionNegocio.upsert({
    where: { id: 'config-unica' },
    update: {},
    create: {
      id: 'config-unica',
      horarioApertura: '09:00',
      horarioCierre: '18:00',
      diasAtencion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      duracionBloqueMinutos: 30,
      horasAnticipacionCancelacion: 12,
      textoBannerPrecio:
        'El valor mostrado es el precio base del servicio. El costo final puede incrementar según el diseño que elijas.',
    },
  });

  const manicure = await prisma.servicio.create({
    data: {
      nombre: 'Manicure semipermanente',
      descripcion: 'Esmaltado semipermanente clásico',
      duracionMinutos: 60,
      precioBase: 25000,
    },
  });

  await prisma.diseno.createMany({
    data: [
      { nombre: 'Diseño simple', incrementoPrecio: 0, servicioId: manicure.id },
      { nombre: 'Nail art', incrementoPrecio: 8000, servicioId: manicure.id },
      { nombre: 'Decoración 3D', incrementoPrecio: 15000, servicioId: manicure.id },
    ],
  });

  console.log('Seed completado');
}

main().finally(() => prisma.$disconnect());
