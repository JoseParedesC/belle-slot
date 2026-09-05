"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saasRouter = void 0;
const express_1 = require("express");
const database_1 = require("../../config/database");
exports.saasRouter = (0, express_1.Router)();
// GET /api/saas/empresas -> Lista de salones/empresas activos para directorio o selector
exports.saasRouter.get('/empresas', async (_req, res) => {
    try {
        const empresas = await database_1.prisma.empresa.findMany({
            where: { activo: true },
            select: {
                id: true,
                nombre: true,
                slug: true,
                logoUrl: true,
                direccion: true,
                telefonoWhatsapp: true,
                emailContacto: true,
                horarioApertura: true,
                horarioCierre: true,
                diasAtencion: true,
                textoBannerPrecio: true,
                colorPrimario: true,
                colorSecundario: true,
                colorAcento: true,
                colorFondo: true,
                personalizacion: true,
                plan: true,
                _count: {
                    select: {
                        servicios: { where: { activo: true } },
                        empleadas: { where: { activo: true } },
                        reservas: true,
                    },
                },
            },
            orderBy: { fechaCreacion: 'asc' },
        });
        res.json(empresas);
    }
    catch (error) {
        console.error('Error al listar empresas SaaS:', error);
        res.status(500).json({ error: error.message || 'Error al obtener salones' });
    }
});
// GET /api/saas/empresas/:slug -> Perfil público de un salón
exports.saasRouter.get('/empresas/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const empresa = await database_1.prisma.empresa.findUnique({
            where: { slug: slug.toLowerCase() },
            include: {
                servicios: {
                    where: { activo: true },
                    include: { disenos: true },
                },
                empleadas: {
                    where: { activo: true },
                    select: { id: true, nombre: true, email: true },
                },
            },
        });
        if (!empresa) {
            return res.status(404).json({ error: `Salón con slug "${slug}" no encontrado` });
        }
        res.json(empresa);
    }
    catch (error) {
        console.error('Error al consultar empresa:', error);
        res.status(500).json({ error: error.message });
    }
});
// POST /api/saas/empresas -> On-boarding / Registro de un nuevo salón
exports.saasRouter.post('/empresas', async (req, res) => {
    try {
        const { nombre, slug: inputSlug, direccion, telefonoWhatsapp, emailContacto, horarioApertura = '09:00', horarioCierre = '18:00', diasAtencion = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'], duracionBloqueMinutos = 30, horasAnticipacionCancelacion = 12, textoBannerPrecio, colorPrimario = '#d94676', colorSecundario = '#8c1e40', colorAcento = '#c29057', colorFondo = '#faf6f8', personalizacion, adminNombre, adminEmail, } = req.body;
        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ error: 'El nombre del salón es obligatorio' });
        }
        // Generar o limpiar slug
        let slug = inputSlug
            ? inputSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
            : nombre.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
        // Quitar guiones al inicio o fin
        slug = slug.replace(/^-+|-+$/g, '');
        if (!slug) {
            return res.status(400).json({ error: 'Slug inválido generado para el salón' });
        }
        // Verificar unicidad de slug
        const existente = await database_1.prisma.empresa.findUnique({ where: { slug } });
        if (existente) {
            return res.status(409).json({
                error: `El identificador web "${slug}" ya está en uso. Por favor elige otro nombre o slug.`,
            });
        }
        // Crear empresa con servicios base y estilista/admin en transacción
        const nuevaEmpresa = await database_1.prisma.$transaction(async (tx) => {
            const empresa = await tx.empresa.create({
                data: {
                    nombre: nombre.trim(),
                    slug,
                    direccion: direccion?.trim() || null,
                    telefonoWhatsapp: telefonoWhatsapp?.trim() || null,
                    emailContacto: emailContacto?.trim() || adminEmail?.trim() || null,
                    horarioApertura,
                    horarioCierre,
                    diasAtencion,
                    duracionBloqueMinutos: Number(duracionBloqueMinutos) || 30,
                    horasAnticipacionCancelacion: Number(horasAnticipacionCancelacion) || 12,
                    textoBannerPrecio: textoBannerPrecio ||
                        'Precios base del salón. El costo final puede variar según personalizaciones o diseños.',
                    colorPrimario,
                    colorSecundario,
                    colorAcento,
                    colorFondo,
                    personalizacion: personalizacion || undefined,
                    plan: 'pro',
                    activo: true,
                },
            });
            // Servicios iniciales por defecto para que el salón pueda agendar de inmediato
            const servicioBase1 = await tx.servicio.create({
                data: {
                    empresaId: empresa.id,
                    nombre: 'Manicura Semipermanente',
                    descripcion: 'Limpieza profunda, exfoliación, limado y esmaltado semipermanente de alta duración.',
                    duracionMinutos: 60,
                    precioBase: 45000,
                    activo: true,
                },
            });
            await tx.servicio.create({
                data: {
                    empresaId: empresa.id,
                    nombre: 'Pedicura Spa',
                    descripcion: 'Cuidado completo de pies con hidratación profunda y esmaltado profesional.',
                    duracionMinutos: 60,
                    precioBase: 50000,
                    activo: true,
                },
            });
            // Diseños muestra asociados al primer servicio
            await tx.diseno.createMany({
                data: [
                    {
                        nombre: 'Diseño Francés Clásico',
                        incrementoPrecio: 10000,
                        servicioId: servicioBase1.id,
                        imagenReferenciaUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&auto=format&fit=crop&q=80',
                    },
                    {
                        nombre: 'Nail Art Mano Alzada (2 uñas)',
                        incrementoPrecio: 15000,
                        servicioId: servicioBase1.id,
                        imagenReferenciaUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&auto=format&fit=crop&q=80',
                    },
                ],
            });
            // Si se proveyó administradora / estilista inicial
            if (adminEmail && adminEmail.trim()) {
                const emailLimpio = adminEmail.toLowerCase().trim();
                const nombreAdmin = adminNombre?.trim() || 'Administradora';
                // Crear registro en empleada para que pueda atender citas si lo desea
                await tx.empleada.create({
                    data: {
                        empresaId: empresa.id,
                        nombre: nombreAdmin,
                        email: emailLimpio,
                        telefono: telefonoWhatsapp?.trim() || null,
                        activo: true,
                    },
                });
                // Crear o actualizar usuario admin
                await tx.usuario.upsert({
                    where: { email: emailLimpio },
                    update: {
                        empresaId: empresa.id,
                        rol: 'admin_empresa',
                    },
                    create: {
                        email: emailLimpio,
                        nombre: nombreAdmin,
                        rol: 'admin_empresa',
                        empresaId: empresa.id,
                        activo: true,
                    },
                });
            }
            return empresa;
        });
        res.status(201).json({
            mensaje: 'Salón registrado con éxito',
            empresa: nuevaEmpresa,
            url: `/${nuevaEmpresa.slug}`,
        });
    }
    catch (error) {
        console.error('Error al registrar salón en SaaS:', error);
        res.status(500).json({ error: error.message || 'Error al registrar salón' });
    }
});
