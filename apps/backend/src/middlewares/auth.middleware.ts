import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

/**
 * Middleware simple de autenticación para el panel de administración.
 * MVP: valida un JWT emitido manualmente al dueño del negocio.
 */
export function requiereAutenticacion(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No autenticado' });

  const token = header.replace('Bearer ', '');
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}
