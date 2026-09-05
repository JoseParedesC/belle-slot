import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.configuracionNegocio.upsert({
    where: { id: 'config-unica' },
    update: {
      nombreNegocio: 'Belle Slot Studio',
      direccion: 'Centro Comercial Plaza Belle, Local 204',
      telefonoWhatsapp: '+57 300 123 4567',
    },
    create: {
      id: 'config-unica',
      nombreNegocio: 'Belle Slot Studio',
      direccion: 'Centro Comercial Plaza Belle, Local 204',
      telefonoWhatsapp: '+57 300 123 4567',
      horarioApertura: '09:00',
      horarioCierre: '18:00',
      diasAtencion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      duracionBloqueMinutos: 30,
      horasAnticipacionCancelacion: 12,
      textoBannerPrecio:
        'El valor mostrado es el precio base del servicio. El costo final puede incrementar según el diseño que elijas.',
    },
  });

  // Estilistas autorizadas del salón
  const estilistasAutorizadas = [
    {
      nombre: 'Valentina Gómez',
      email: 'valentina.estilista@gmail.com',
      telefono: '+57 300 456 7890',
      activo: true,
    },
    {
      nombre: 'Sofía Mendoza',
      email: 'sofia.estilista@gmail.com',
      telefono: '+57 300 987 6543',
      activo: true,
    },
    {
      nombre: 'Camila Rivas',
      email: 'camila.estilista@gmail.com',
      telefono: '+57 311 234 5678',
      activo: true,
    },
  ];

  for (const est of estilistasAutorizadas) {
    await prisma.empleada.upsert({
      where: { email: est.email },
      update: { nombre: est.nombre, telefono: est.telefono, activo: est.activo },
      create: est,
    });
  }

  // Servicio base
  let manicure = await prisma.servicio.findFirst({
    where: { nombre: 'Manicure semipermanente' },
  });

  if (!manicure) {
    manicure = await prisma.servicio.create({
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
  }

  console.log('Seed completado con estilistas autorizadas');
}

main().finally(() => prisma.$disconnect());
