"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminEstilistasRouter = exports.authRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../../config/database");
exports.authRouter = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
// MVP: usuario administrador fallback por variables de entorno
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
// POST /api/auth/login
exports.authRouter.post('/login', async (req, res) => {
    const { usuario, password } = req.body;
    const empresa = req.empresa;
    // 1. Verificar si coincide con admin de variables de entorno
    if (usuario === ADMIN_USER && password === ADMIN_PASSWORD) {
        const token = jsonwebtoken_1.default.sign({ usuario, rol: 'admin', empresaId: empresa?.id }, JWT_SECRET, { expiresIn: '12h' });
        return res.json({
            token,
            usuario: {
                nombre: 'Administradora General',
                email: 'admin@belleslot.com',
                rol: 'admin',
                empresaId: empresa?.id,
            },
        });
    }
    // 2. Verificar en tabla Usuario por email y empresa
    const usuarioDB = await database_1.prisma.usuario.findFirst({
        where: {
            email: usuario,
            ...(empresa?.id ? { empresaId: empresa.id } : {}),
            activo: true,
        },
    });
    if (usuarioDB) {
        const token = jsonwebtoken_1.default.sign({ id: usuarioDB.id, usuario: usuarioDB.nombre, email: usuarioDB.email, rol: usuarioDB.rol, empresaId: usuarioDB.empresaId }, JWT_SECRET, { expiresIn: '12h' });
        return res.json({
            token,
            usuario: {
                id: usuarioDB.id,
                nombre: usuarioDB.nombre,
                email: usuarioDB.email,
                rol: usuarioDB.rol,
                empresaId: usuarioDB.empresaId,
            },
        });
    }
    return res.status(401).json({ error: 'Credenciales inválidas' });
});
// POST /api/auth/google
exports.authRouter.post('/google', async (req, res) => {
    try {
        const { credential, rol = 'estilista', email: inputEmail, nombre: inputNombre, foto: inputFoto } = req.body;
        const empresa = req.empresa;
        let email = inputEmail;
        let nombre = inputNombre;
        let foto = inputFoto;
        // Si viene la credencial de Google (JWT codificado)
        if (credential) {
            try {
                const payloadDecoded = jsonwebtoken_1.default.decode(credential);
                if (payloadDecoded) {
                    email = email || payloadDecoded.email;
                    nombre = nombre || payloadDecoded.name || payloadDecoded.given_name;
                    foto = foto || payloadDecoded.picture;
                }
            }
            catch (e) {
                console.warn('No se pudo decodificar el token de Google:', e);
            }
        }
        const nombreSalon = empresa?.nombre || 'Belle Slot';
        if (!nombre) {
            nombre = rol === 'estilista' ? `Estilista ${nombreSalon}` : `Clienta ${nombreSalon}`;
        }
        if (!email) {
            email = `${nombre.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
        }
        if (rol === 'estilista') {
            const emailLimpio = (email || '').toLowerCase().trim();
            if (!emailLimpio) {
                return res.status(400).json({
                    error: 'Se requiere un correo electrónico válido para verificar la cuenta de estilista',
                });
            }
            // Buscar estilista autorizada en tabla Empleada por correo electrónico y empresa
            const whereEmpleada = {
                email: { equals: emailLimpio, mode: 'insensitive' },
            };
            if (empresa?.id) {
                whereEmpleada.empresaId = empresa.id;
            }
            const empleada = await database_1.prisma.empleada.findFirst({
                where: whereEmpleada,
            });
            // RECHAZAR acceso si no está pre-registrada por la administración del salón
            if (!empleada) {
                return res.status(403).json({
                    error: `Acceso restringido: El correo "${emailLimpio}" no está registrado como estilista autorizada en ${nombreSalon}. Si formas parte del equipo, solicita a la administración que autorice tu cuenta.`,
                });
            }
            if (!empleada.activo) {
                return res.status(403).json({
                    error: `La cuenta de estilista para "${empleada.nombre}" se encuentra inactiva. Comunícate con la administración de ${nombreSalon}.`,
                });
            }
            const token = jsonwebtoken_1.default.sign({ id: empleada.id, usuario: empleada.nombre, email: empleada.email, rol: 'estilista', empresaId: empresa?.id, foto }, JWT_SECRET, { expiresIn: '24h' });
            return res.json({
                token,
                usuario: {
                    id: empleada.id,
                    nombre: empleada.nombre,
                    email: empleada.email,
                    telefono: empleada.telefono,
                    rol: 'estilista',
                    empresaId: empresa?.id,
                    foto: foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                },
            });
        }
        else {
            // Rol cliente: los clientes sí pueden auto-registrarse al agendar citas
            const whereCliente = { email };
            if (empresa?.id) {
                whereCliente.empresaId = empresa.id;
            }
            let cliente = await database_1.prisma.cliente.findFirst({
                where: whereCliente,
            });
            if (!cliente) {
                cliente = await database_1.prisma.cliente.create({
                    data: {
                        nombre,
                        email,
                        telefono: req.body.telefono || '',
                        empresaId: empresa?.id,
                    },
                });
            }
            const token = jsonwebtoken_1.default.sign({ id: cliente.id, usuario: cliente.nombre, email: cliente.email, rol: 'cliente', empresaId: empresa?.id, foto }, JWT_SECRET, { expiresIn: '24h' });
            return res.json({
                token,
                usuario: {
                    id: cliente.id,
                    nombre: cliente.nombre,
                    email: cliente.email,
                    telefono: cliente.telefono,
                    rol: 'cliente',
                    empresaId: empresa?.id,
                    foto,
                },
            });
        }
    }
    catch (error) {
        console.error('Error en autenticación de Google:', error);
        res.status(500).json({ error: error.message || 'Error al autenticar con Google' });
    }
});
// GET /api/auth/estilistas (Lista pública de estilistas activas del salón para selector de citas)
exports.authRouter.get('/estilistas', async (req, res) => {
    try {
        const where = { activo: true };
        if (req.empresa?.id) {
            where.empresaId = req.empresa.id;
        }
        const estilistas = await database_1.prisma.empleada.findMany({
            where,
            select: { id: true, nombre: true, email: true },
            orderBy: { nombre: 'asc' },
        });
        res.json(estilistas);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ---- Router para Administración de Estilistas (/api/admin/estilistas) ----
exports.adminEstilistasRouter = (0, express_1.Router)();
// GET /api/admin/estilistas (Lista completa con estados para panel admin del salón)
exports.adminEstilistasRouter.get('/', async (req, res) => {
    try {
        const where = {};
        if (req.empresa?.id) {
            where.empresaId = req.empresa.id;
        }
        const estilistas = await database_1.prisma.empleada.findMany({
            where,
            orderBy: { nombre: 'asc' },
        });
        res.json(estilistas);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/admin/estilistas (Registrar nueva estilista autorizada para el salón)
exports.adminEstilistasRouter.post('/', async (req, res) => {
    try {
        const { nombre, email, telefono } = req.body;
        const empresaId = req.empresa?.id;
        if (!nombre || !email) {
            return res.status(400).json({ error: 'El nombre y correo electrónico son requeridos' });
        }
        const emailLimpio = email.toLowerCase().trim();
        const whereExiste = { email: emailLimpio };
        if (empresaId)
            whereExiste.empresaId = empresaId;
        const existe = await database_1.prisma.empleada.findFirst({ where: whereExiste });
        if (existe) {
            return res.status(409).json({ error: 'Ya existe una estilista registrada con este correo en este salón' });
        }
        const nueva = await database_1.prisma.empleada.create({
            data: {
                nombre: nombre.trim(),
                email: emailLimpio,
                telefono: telefono ? telefono.trim() : null,
                empresaId,
                activo: true,
            },
        });
        res.status(201).json(nueva);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PATCH /api/admin/estilistas/:id/estado (Activar o desactivar estilista)
exports.adminEstilistasRouter.patch('/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;
        const actualizada = await database_1.prisma.empleada.update({
            where: { id },
            data: { activo: Boolean(activo) },
        });
        res.json(actualizada);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
