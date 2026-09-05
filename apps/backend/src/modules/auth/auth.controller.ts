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
      // Buscar o registrar estilista en tabla Empleada
      let empleada = await prisma.empleada.findFirst({
        where: { nombre: { equals: nombre, mode: 'insensitive' } },
      });

      if (!empleada) {
        empleada = await prisma.empleada.create({
          data: {
            nombre,
            activo: true,
          },
        });
      }

      const token = jwt.sign(
        { id: empleada.id, usuario: empleada.nombre, email, rol: 'estilista', foto },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        usuario: {
          id: empleada.id,
          nombre: empleada.nombre,
          email,
          rol: 'estilista',
          foto: foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        },
      });
    } else {
      // Rol cliente
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
        { id: cliente.id, usuario: cliente.nombre, email, rol: 'cliente', foto },
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

// GET /api/auth/estilistas
authRouter.get('/estilistas', async (_req, res) => {
  try {
    const estilistas = await prisma.empleada.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
    });
    res.json(estilistas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

