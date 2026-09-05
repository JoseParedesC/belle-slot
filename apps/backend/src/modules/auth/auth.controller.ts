import { Router } from 'express';
import jwt from 'jsonwebtoken';

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

  const token = jwt.sign({ usuario }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});
