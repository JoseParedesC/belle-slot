import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// MVP: un solo usuario administrador definido por variables de entorno.
// Preparado para reemplazar por una tabla de usuarios más adelante si hay más de un local o de un rol.
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// POST /api/auth/login
authRouter.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  if (usuario !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = jwt.sign({ usuario, rol: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, usuario: { nombre: 'Administradora', email: 'admin@belleslot.com', rol: 'admin' } });
});

// POST /api/auth/google
authRouter.post('/google', async (req, res) => {
  try {
    const { credential, rol = 'estilista', email: inputEmail, nombre: inputNombre, foto: inputFoto } = req.body;

    let email = inputEmail;
    let nombre = inputNombre;
    let foto = inputFoto;

    // Si viene la credencial de Google (JWT codificado)
    if (credential) {
      try {
        const payloadDecoded = jwt.decode(credential) as any;
        if (payloadDecoded) {
          email = email || payloadDecoded.email;
          nombre = nombre || payloadDecoded.name || payloadDecoded.given_name;
          foto = foto || payloadDecoded.picture;
        }
      } catch (e) {
        console.warn('No se pudo decodificar el token de Google:', e);
      }
    }

    if (!nombre) {
      nombre = rol === 'estilista' ? 'Estilista Belle Slot' : 'Clienta Belle Slot';
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

      // Buscar estilista autorizada en tabla Empleada por correo electrónico
      const empleada = await prisma.empleada.findFirst({
        where: {
          email: { equals: emailLimpio, mode: 'insensitive' },
        },
      });

      // RECHAZAR acceso si no está pre-registrada por la administración
      if (!empleada) {
        return res.status(403).json({
          error: `Acceso restringido: El correo "${emailLimpio}" no está registrado como estilista autorizada en Belle Slot. Si formas parte del equipo, solicita a la administración que autorice tu cuenta.`,
        });
      }

      if (!empleada.activo) {
        return res.status(403).json({
          error: `La cuenta de estilista para "${empleada.nombre}" se encuentra inactiva. Comunícate con la administración.`,
        });
      }

      const token = jwt.sign(
        { id: empleada.id, usuario: empleada.nombre, email: empleada.email, rol: 'estilista', foto },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        usuario: {
          id: empleada.id,
          nombre: empleada.nombre,
          email: empleada.email,
          telefono: empleada.telefono,
          rol: 'estilista',
          foto: foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        },
      });
    } else {
      // Rol cliente: los clientes sí pueden auto-registrarse al agendar citas
      let cliente = await prisma.cliente.findFirst({
        where: { email },
      });

      if (!cliente) {
        cliente = await prisma.cliente.create({
          data: {
            nombre,
            email,
            telefono: req.body.telefono || '',
          },
        });
      }

      const token = jwt.sign(
        { id: cliente.id, usuario: cliente.nombre, email: cliente.email, rol: 'cliente', foto },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        usuario: {
          id: cliente.id,
          nombre: cliente.nombre,
          email: cliente.email,
          telefono: cliente.telefono,
          rol: 'cliente',
          foto,
        },
      });
    }
  } catch (error: any) {
    console.error('Error en autenticación de Google:', error);
    res.status(500).json({ error: error.message || 'Error al autenticar con Google' });
  }
});

// GET /api/auth/estilistas (Lista pública de estilistas activas para selector de citas)
authRouter.get('/estilistas', async (_req, res) => {
  try {
    const estilistas = await prisma.empleada.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, email: true },
      orderBy: { nombre: 'asc' },
    });
    res.json(estilistas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---- Router para Administración de Estilistas (/api/admin/estilistas) ----
export const adminEstilistasRouter = Router();

// GET /api/admin/estilistas (Lista completa con estados para panel admin)
adminEstilistasRouter.get('/', async (_req, res) => {
  try {
    const estilistas = await prisma.empleada.findMany({
      orderBy: { nombre: 'asc' },
    });
    res.json(estilistas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/estilistas (Registrar nueva estilista autorizada)
adminEstilistasRouter.post('/', async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;
    if (!nombre || !email) {
      return res.status(400).json({ error: 'El nombre y correo electrónico son requeridos' });
    }
    const emailLimpio = email.toLowerCase().trim();
    const existe = await prisma.empleada.findUnique({ where: { email: emailLimpio } });
    if (existe) {
      return res.status(409).json({ error: 'Ya existe una estilista registrada con este correo' });
    }

    const nueva = await prisma.empleada.create({
      data: {
        nombre: nombre.trim(),
        email: emailLimpio,
        telefono: telefono ? telefono.trim() : null,
        activo: true,
      },
    });
    res.status(201).json(nueva);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/estilistas/:id/estado (Activar o desactivar estilista)
adminEstilistasRouter.patch('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;
    const actualizada = await prisma.empleada.update({
      where: { id },
      data: { activo: Boolean(activo) },
    });
    res.json(actualizada);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

