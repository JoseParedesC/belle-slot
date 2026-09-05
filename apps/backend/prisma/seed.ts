import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed multi-tenant...');

  // 1. Crear o actualizar Tenant 1: Belle Slot Studio
  const belleSlot = await prisma.empresa.upsert({
    where: { slug: 'belle-slot' },
    update: {
      nombre: 'Belle Slot Studio',
      direccion: 'Centro Comercial Plaza Belle, Local 204',
      telefonoWhatsapp: '+57 300 123 4567',
      emailContacto: 'contacto@belleslot.com',
      horarioApertura: '09:00',
      horarioCierre: '18:00',
      diasAtencion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      duracionBloqueMinutos: 30,
      horasAnticipacionCancelacion: 12,
      textoBannerPrecio:
        'El valor mostrado es el precio base del servicio. El costo final puede incrementar según el diseño que elijas.',
    },
    create: {
      id: 'empresa-belle-slot',
      nombre: 'Belle Slot Studio',
      slug: 'belle-slot',
      direccion: 'Centro Comercial Plaza Belle, Local 204',
      telefonoWhatsapp: '+57 300 123 4567',
      emailContacto: 'contacto@belleslot.com',
      horarioApertura: '09:00',
      horarioCierre: '18:00',
      diasAtencion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      duracionBloqueMinutos: 30,
      horasAnticipacionCancelacion: 12,
      textoBannerPrecio:
        'El valor mostrado es el precio base del servicio. El costo final puede incrementar según el diseño que elijas.',
      plan: 'pro',
      activo: true,
    },
  });

  // 2. Crear o actualizar Tenant 2: Glamour Nails Spa
  const glamourNails = await prisma.empresa.upsert({
    where: { slug: 'glamour-nails' },
    update: {
      nombre: 'Glamour Nails Spa',
      direccion: 'Avenida Principal #45-12, Zona Rosa',
      telefonoWhatsapp: '+57 315 999 8877',
      emailContacto: 'hola@glamournails.com',
      horarioApertura: '10:00',
      horarioCierre: '19:00',
      diasAtencion: ['Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      duracionBloqueMinutos: 45,
      horasAnticipacionCancelacion: 24,
      textoBannerPrecio:
        'Todos nuestros servicios en Glamour Spa incluyen exfoliación aromática de cortesía.',
    },
    create: {
      id: 'empresa-glamour-nails',
      nombre: 'Glamour Nails Spa',
      slug: 'glamour-nails',
      direccion: 'Avenida Principal #45-12, Zona Rosa',
      telefonoWhatsapp: '+57 315 999 8877',
      emailContacto: 'hola@glamournails.com',
      horarioApertura: '10:00',
      horarioCierre: '19:00',
      diasAtencion: ['Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      duracionBloqueMinutos: 45,
      horasAnticipacionCancelacion: 24,
      textoBannerPrecio:
        'Todos nuestros servicios en Glamour Spa incluyen exfoliación aromática de cortesía.',
      plan: 'pro',
      activo: true,
    },
  });

  // 3. Asociar registros huérfanos a Belle Slot
  await prisma.servicio.updateMany({
    where: { empresaId: null },
    data: { empresaId: belleSlot.id },
  });
  await prisma.empleada.updateMany({
    where: { empresaId: null },
    data: { empresaId: belleSlot.id },
  });
  await prisma.cliente.updateMany({
    where: { empresaId: null },
    data: { empresaId: belleSlot.id },
  });
  await prisma.reserva.updateMany({
    where: { empresaId: null },
    data: { empresaId: belleSlot.id },
  });

  // 4. Estilistas para Belle Slot
  const estilistasBelle = [
    {
      nombre: 'Valentina Gómez',
      email: 'valentina.estilista@gmail.com',
      telefono: '+57 300 456 7890',
      empresaId: belleSlot.id,
      activo: true,
    },
    {
      nombre: 'Sofía Mendoza',
      email: 'sofia.estilista@gmail.com',
      telefono: '+57 300 987 6543',
      empresaId: belleSlot.id,
      activo: true,
    },
    {
      nombre: 'Camila Rivas',
      email: 'camila.estilista@gmail.com',
      telefono: '+57 311 234 5678',
      empresaId: belleSlot.id,
      activo: true,
    },
  ];

  for (const est of estilistasBelle) {
    await prisma.empleada.upsert({
      where: { email: est.email },
      update: { nombre: est.nombre, telefono: est.telefono, activo: est.activo, empresaId: est.empresaId },
      create: est,
    });
  }

  // 5. Estilistas para Glamour Nails
  const estilistasGlamour = [
    {
      nombre: 'Lucía Torres',
      email: 'lucia.glamour@gmail.com',
      telefono: '+57 315 111 2233',
      empresaId: glamourNails.id,
      activo: true,
    },
    {
      nombre: 'Daniela Castro',
      email: 'daniela.glamour@gmail.com',
      telefono: '+57 315 444 5566',
      empresaId: glamourNails.id,
      activo: true,
    },
  ];

  for (const est of estilistasGlamour) {
    await prisma.empleada.upsert({
      where: { email: est.email },
      update: { nombre: est.nombre, telefono: est.telefono, activo: est.activo, empresaId: est.empresaId },
      create: est,
    });
  }

  // 6. Servicios para Belle Slot
  let manicureBelle = await prisma.servicio.findFirst({
    where: { nombre: 'Manicure semipermanente', empresaId: belleSlot.id },
  });

  if (!manicureBelle) {
    manicureBelle = await prisma.servicio.create({
      data: {
        empresaId: belleSlot.id,
        nombre: 'Manicure semipermanente',
        descripcion: 'Esmaltado semipermanente clásico con cuidado de cutícula',
        duracionMinutos: 60,
        precioBase: 25000,
      },
    });

    await prisma.diseno.createMany({
      data: [
        { nombre: 'Diseño simple', incrementoPrecio: 0, servicioId: manicureBelle.id },
        { nombre: 'Nail art', incrementoPrecio: 8000, servicioId: manicureBelle.id },
        { nombre: 'Decoración 3D', incrementoPrecio: 15000, servicioId: manicureBelle.id },
      ],
    });
  }

  // 7. Servicios para Glamour Nails
  let pedicureGlamour = await prisma.servicio.findFirst({
    where: { nombre: 'Pedicure Spa Deluxe', empresaId: glamourNails.id },
  });

  if (!pedicureGlamour) {
    pedicureGlamour = await prisma.servicio.create({
      data: {
        empresaId: glamourNails.id,
        nombre: 'Pedicure Spa Deluxe',
        descripcion: 'Tratamiento completo con exfoliación, parafina y esmaltado en gel',
        duracionMinutos: 60,
        precioBase: 45000,
      },
    });

    await prisma.diseno.createMany({
      data: [
        { nombre: 'Esmaltado Francés', incrementoPrecio: 5000, servicioId: pedicureGlamour.id },
        { nombre: 'Glitter & Pedrería', incrementoPrecio: 12000, servicioId: pedicureGlamour.id },
      ],
    });
  }

  // 8. Usuarios Administrativos
  await prisma.usuario.upsert({
    where: { email: 'superadmin@belleslot.com' },
    update: { rol: 'superadmin' },
    create: {
      email: 'superadmin@belleslot.com',
      nombre: 'Super Administrador SaaS',
      rol: 'superadmin',
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'admin@belleslot.com' },
    update: { rol: 'admin_empresa', empresaId: belleSlot.id },
    create: {
      email: 'admin@belleslot.com',
      nombre: 'Administradora Belle Slot',
      rol: 'admin_empresa',
      empresaId: belleSlot.id,
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'admin@glamournails.com' },
    update: { rol: 'admin_empresa', empresaId: glamourNails.id },
    create: {
      email: 'admin@glamournails.com',
      nombre: 'Administradora Glamour Nails',
      rol: 'admin_empresa',
      empresaId: glamourNails.id,
    },
  });

  console.log('Seed multi-tenant completado con éxito.');
  console.log(`- Empresa 1: ${belleSlot.nombre} (slug: /${belleSlot.slug})`);
  console.log(`- Empresa 2: ${glamourNails.nombre} (slug: /${glamourNails.slug})`);
}

main().finally(() => prisma.$disconnect());
