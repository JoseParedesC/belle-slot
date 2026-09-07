import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed multi-tenant...');

  // 1. DAHOOD24
  const dahood24 = await prisma.empresa.upsert({
    where: { slug: 'dahood24' },
    update: {
      nombre: 'DAHOOD24',
      direccion: 'Por configurar',
      telefonoWhatsapp: 'Por configurar',
      emailContacto: 'Por configurar',
      horarioApertura: '09:00',
      horarioCierre: '18:00',
      diasAtencion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      duracionBloqueMinutos: 30,
      horasAnticipacionCancelacion: 12,
      textoBannerPrecio:
        'Los precios mostrados corresponden al servicio seleccionado. Consulta las condiciones de cada servicio antes de reservar.',
      colorPrimario: '#0A0A0A',
      colorSecundario: '#141414',
      colorAcento: '#B6FF00',
      colorFondo: '#0A0A0A',
    },
    create: {
      id: 'empresa-dahood24',
      nombre: 'DAHOOD24',
      slug: 'dahood24',
      direccion: 'Por configurar',
      telefonoWhatsapp: 'Por configurar',
      emailContacto: 'Por configurar',
      horarioApertura: '09:00',
      horarioCierre: '18:00',
      diasAtencion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      duracionBloqueMinutos: 30,
      horasAnticipacionCancelacion: 12,
      textoBannerPrecio:
        'Los precios mostrados corresponden al servicio seleccionado. Consulta las condiciones de cada servicio antes de reservar.',
      colorPrimario: '#0A0A0A',
      colorSecundario: '#141414',
      colorAcento: '#B6FF00',
      colorFondo: '#0A0A0A',
      plan: 'pro',
      activo: true,
    },
  });

  // 2. JC Nails
  // Se conserva para JC Nails la paleta que tenía Belle Slot Studio.
  const jcNails = await prisma.empresa.upsert({
    where: { slug: 'jc-nails' },
    update: {
      nombre: 'JC Nails',
      direccion: 'Por configurar',
      telefonoWhatsapp: 'Por configurar',
      emailContacto: 'Por configurar',
      horarioApertura: '09:00',
      horarioCierre: '18:00',
      diasAtencion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      duracionBloqueMinutos: 30,
      horasAnticipacionCancelacion: 12,
      textoBannerPrecio:
        'El valor mostrado es el precio base del servicio. El costo final puede variar según el diseño seleccionado.',
      colorPrimario: '#d94676',
      colorSecundario: '#8c1e40',
      colorAcento: '#c29057',
      colorFondo: '#faf6f8',
    },
    create: {
      id: 'empresa-jc-nails',
      nombre: 'JC Nails',
      slug: 'jc-nails',
      direccion: 'Por configurar',
      telefonoWhatsapp: 'Por configurar',
      emailContacto: 'Por configurar',
      horarioApertura: '09:00',
      horarioCierre: '18:00',
      diasAtencion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      duracionBloqueMinutos: 30,
      horasAnticipacionCancelacion: 12,
      textoBannerPrecio:
        'El valor mostrado es el precio base del servicio. El costo final puede variar según el diseño seleccionado.',
      colorPrimario: '#d94676',
      colorSecundario: '#8c1e40',
      colorAcento: '#c29057',
      colorFondo: '#faf6f8',
      plan: 'pro',
      activo: true,
    },
  });

  // 3. Asociar registros huérfanos existentes a DAHOOD24
  await prisma.servicio.updateMany({
    where: { empresaId: null },
    data: { empresaId: dahood24.id },
  });
  await prisma.empleada.updateMany({
    where: { empresaId: null },
    data: { empresaId: dahood24.id },
  });
  await prisma.cliente.updateMany({
    where: { empresaId: null },
    data: { empresaId: dahood24.id },
  });
  await prisma.reserva.updateMany({
    where: { empresaId: null },
    data: { empresaId: dahood24.id },
  });

  // 4. Personal DAHOOD24
  const estilistasDahood24 = [
    {
      nombre: 'Mariana López',
      email: 'mariana.dahood24@seed.local',
      telefono: 'Por configurar',
      empresaId: dahood24.id,
      activo: true,
    },
    {
      nombre: 'Andrea Martínez',
      email: 'andrea.dahood24@seed.local',
      telefono: 'Por configurar',
      empresaId: dahood24.id,
      activo: true,
    },
  ];

  for (const est of estilistasDahood24) {
    await prisma.empleada.upsert({
      where: { email: est.email },
      update: {
        nombre: est.nombre,
        telefono: est.telefono,
        activo: est.activo,
        empresaId: est.empresaId,
      },
      create: est,
    });
  }

  // 5. Personal JC Nails
  const estilistasJcNails = [
    {
      nombre: 'Valeria Rodríguez',
      email: 'valeria.jcnails@seed.local',
      telefono: 'Por configurar',
      empresaId: jcNails.id,
      activo: true,
    },
    {
      nombre: 'Camila Herrera',
      email: 'camila.jcnails@seed.local',
      telefono: 'Por configurar',
      empresaId: jcNails.id,
      activo: true,
    },
  ];

  for (const est of estilistasJcNails) {
    await prisma.empleada.upsert({
      where: { email: est.email },
      update: {
        nombre: est.nombre,
        telefono: est.telefono,
        activo: est.activo,
        empresaId: est.empresaId,
      },
      create: est,
    });
  }

  // 6. Servicios DAHOOD24
  const serviciosDahood24 = [
    {
      nombre: 'Asesoría de estilo',
      descripcion: 'Asesoría personalizada para selección y combinación de prendas.',
      duracionMinutos: 60,
      precioBase: 0,
    },
    {
      nombre: 'Personal Shopping',
      descripcion: 'Sesión personalizada para selección de productos y armado de looks.',
      duracionMinutos: 90,
      precioBase: 0,
    },
  ];

  for (const servicio of serviciosDahood24) {
    const existente = await prisma.servicio.findFirst({
      where: { nombre: servicio.nombre, empresaId: dahood24.id },
    });

    if (!existente) {
      await prisma.servicio.create({
        data: { empresaId: dahood24.id, ...servicio },
      });
    }
  }

  // 7. Servicios JC Nails
  const serviciosJcNails = [
    {
      nombre: 'Manicure semipermanente',
      descripcion:
        'Manicure con preparación de uñas, cuidado de cutícula y esmaltado semipermanente.',
      duracionMinutos: 60,
      precioBase: 25000,
    },
    {
      nombre: 'Pedicure semipermanente',
      descripcion:
        'Pedicure con cuidado de cutícula, limado y esmaltado semipermanente.',
      duracionMinutos: 60,
      precioBase: 35000,
    },
    {
      nombre: 'Nail Art',
      descripcion: 'Diseño personalizado para complementar el servicio de manicure.',
      duracionMinutos: 30,
      precioBase: 10000,
    },
  ];

  for (const servicio of serviciosJcNails) {
    const existente = await prisma.servicio.findFirst({
      where: { nombre: servicio.nombre, empresaId: jcNails.id },
    });

    if (!existente) {
      await prisma.servicio.create({
        data: { empresaId: jcNails.id, ...servicio },
      });
    }
  }

  // 8. Usuarios administrativos
  await prisma.usuario.upsert({
    where: { email: 'superadmin@saas.local' },
    update: { rol: 'superadmin' },
    create: {
      email: 'superadmin@saas.local',
      nombre: 'Super Administrador SaaS',
      rol: 'superadmin',
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'admin@dahood24.local' },
    update: { rol: 'admin_empresa', empresaId: dahood24.id },
    create: {
      email: 'admin@dahood24.local',
      nombre: 'Administrador DAHOOD24',
      rol: 'admin_empresa',
      empresaId: dahood24.id,
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'admin@jcnails.local' },
    update: { rol: 'admin_empresa', empresaId: jcNails.id },
    create: {
      email: 'admin@jcnails.local',
      nombre: 'Administradora JC Nails',
      rol: 'admin_empresa',
      empresaId: jcNails.id,
    },
  });

  console.log('Seed multi-tenant completado con éxito.');
  console.log(`- Empresa 1: ${dahood24.nombre} (slug: /${dahood24.slug})`);
  console.log(`- Empresa 2: ${jcNails.nombre} (slug: /${jcNails.slug})`);
}

main().finally(() => prisma.$disconnect());
