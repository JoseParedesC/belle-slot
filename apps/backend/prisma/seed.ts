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

  // 2. JC Nails (JC Nail Salon)
  const jcConfig = {
    nombre: 'JC Nail Salon',
    direccion: 'Sede Principal JC Nails',
    telefonoWhatsapp: '+57 305 318 0624',
    emailContacto: 'contacto@jcnails.com',
    horarioApertura: '07:00',
    horarioCierre: '19:00',
    diasAtencion: ['Martes', 'Miércoles', 'Jueves', 'Viernes'],
    duracionBloqueMinutos: 30,
    horasAnticipacionCancelacion: 12,
    textoBannerPrecio:
      'Precios oficiales JC Nail Salon. El costo final puede variar según la técnica de diseño o decoración seleccionada.',
    colorPrimario: '#613d2d',
    colorSecundario: '#3d2314',
    colorAcento: '#c59b6d',
    colorFondo: '#fcf7f4',
    personalizacion: {
      instagram: 'Jc.nails15',
      telefono: '3053180624',
      textoHorario: 'Martes a Viernes: 9am - 12pm | 1pm - 7pm (Nov-Dic desde 7am)',
      pausaAlmuerzo: {
        inicio: '12:00',
        fin: '13:00',
      },
      horarioEstacional: {
        activo: true,
        temporadas: [
          {
            nombre: 'feb-oct',
            meses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            turnos: [
              { inicio: '09:00', fin: '12:00' },
              { inicio: '13:00', fin: '19:00' },
            ],
          },
          {
            nombre: 'nov-dic',
            meses: [11, 12],
            turnos: [
              { inicio: '07:00', fin: '12:00' },
              { inicio: '13:00', fin: '19:00' },
            ],
          },
        ],
      },
    },
  };

  const jcNails = await prisma.empresa.upsert({
    where: { slug: 'jc-nails' },
    update: jcConfig,
    create: {
      id: 'empresa-jc-nails',
      slug: 'jc-nails',
      plan: 'pro',
      activo: true,
      ...jcConfig,
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

  // 7. Servicios JC Nails (catálogo oficial y dipping 55mil)
  const serviciosJcNails = [
    {
      nombre: 'Manicura Tradicional',
      descripcion:
        'Limpieza profunda, cuidado de cutícula, limado y esmaltado tradicional de secado rápido.',
      duracionMinutos: 45,
      precioBase: 20000,
    },
    {
      nombre: 'Manicura Semipermanente',
      descripcion:
        'Preparación meticulosa de uña y cutícula, esmaltado semipermanente de alta duración y brillo.',
      duracionMinutos: 60,
      precioBase: 50000,
    },
    {
      nombre: 'Base Rubber',
      descripcion:
        'Nivelación, refuerzo estructural y esmaltado con base rubber para uñas naturales más fuertes.',
      duracionMinutos: 60,
      precioBase: 55000,
    },
    {
      nombre: 'Dipping',
      descripcion:
        'Técnica de inmersión en polvo acrílico enriquecido, ligera, resistente y duradera sin lámpara UV.',
      duracionMinutos: 60,
      precioBase: 55000,
    },
    {
      nombre: 'Press On',
      descripcion:
        'Aplicación y sellado profesional de sistema de tips press on personalizados con máxima adherencia.',
      duracionMinutos: 75,
      precioBase: 65000,
    },
    {
      nombre: 'Retoque Press On',
      descripcion:
        'Mantenimiento, ajuste, rebalanceo y sellado de sistema press on.',
      duracionMinutos: 60,
      precioBase: 60000,
    },
    {
      nombre: 'Poligel',
      descripcion:
        'Esculpido y extensión con poligel híbrido, logrando uñas ligeras, resistentes y de aspecto natural.',
      duracionMinutos: 90,
      precioBase: 80000,
    },
    {
      nombre: 'Retoque Poligel',
      descripcion:
        'Mantenimiento y relleno de crecimiento para uñas esculpidas en poligel.',
      duracionMinutos: 75,
      precioBase: 65000,
    },
    {
      nombre: 'Pedicura Tradicional',
      descripcion:
        'Cuidado completo de pies con exfoliación, hidratación, corte y esmaltado tradicional.',
      duracionMinutos: 45,
      precioBase: 25000,
    },
    {
      nombre: 'Pedicura Semipermanente',
      descripcion:
        'Pedicura estética completa con esmaltado semipermanente de larga duración.',
      duracionMinutos: 60,
      precioBase: 50000,
    },
  ];

  for (const servicio of serviciosJcNails) {
    const existente = await prisma.servicio.findFirst({
      where: { nombre: servicio.nombre, empresaId: jcNails.id },
    });

    let sId = existente?.id;
    if (!existente) {
      const nuevo = await prisma.servicio.create({
        data: { empresaId: jcNails.id, ...servicio },
      });
      sId = nuevo.id;
    } else {
      await prisma.servicio.update({
        where: { id: existente.id },
        data: servicio,
      });
    }

    if (servicio.nombre === 'Manicura Semipermanente' && sId) {
      const disenos = [
        {
          nombre: 'Diseño Francés Clásico / Microfrench',
          incrementoPrecio: 10000,
          servicioId: sId,
        },
        {
          nombre: 'Nail Art Estrellas & Gemas (Star Nails)',
          incrementoPrecio: 15000,
          servicioId: sId,
        },
        {
          nombre: 'Efecto Glazed / Espejo Aurora',
          incrementoPrecio: 12000,
          servicioId: sId,
        },
        {
          nombre: 'Nail Art Floral a Mano Alzada',
          incrementoPrecio: 15000,
          servicioId: sId,
        },
      ];

      for (const d of disenos) {
        const dExistente = await prisma.diseno.findFirst({
          where: { nombre: d.nombre, servicioId: sId },
        });
        if (!dExistente) {
          await prisma.diseno.create({ data: d });
        }
      }
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
