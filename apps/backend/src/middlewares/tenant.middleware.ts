import { Request, Response, NextFunction } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

type Empresa = Prisma.EmpresaGetPayload<{}>;

declare global {
  namespace Express {
    interface Request {
      empresa?: Empresa;
    }
  }
}

const DEFAULT_SLUG = 'belle-slot';

/**
 * Resuelve la empresa asociada a la petición HTTP.
 * Prioridad de resolución:
 * 1. Header `x-tenant-slug` (usado por frontend Axios client)
 * 2. Parámetro de ruta `:slug` o `:empresaSlug`
 * 3. Query param `?empresa_slug=` o `?tenant=`
 * 4. Fallback por compatibilidad: 'belle-slot'
 */
export async function resolverTenant(req: Request, res: Response, next: NextFunction) {
  try {
    const slugHeaderValue = req.headers['x-tenant-slug'];
    const slugHeader = Array.isArray(slugHeaderValue) ? slugHeaderValue[0] : slugHeaderValue;
    const slugParam = (req.params.slug || req.params.empresaSlug)?.trim();
    const slugQueryValue = req.query.empresa_slug ?? req.query.tenant;
    const slugQuery = Array.isArray(slugQueryValue) ? slugQueryValue[0] : slugQueryValue;

    let slug = (slugHeader || slugParam || slugQuery || DEFAULT_SLUG)?.toString().trim();
    if (slug.toLowerCase() === 'jd-nails') {
      slug = 'jc-nails';
    }

    const empresa = await prisma.empresa.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    if (!empresa) {
      return res.status(404).json({
        error: `El salón o empresa con identificador "${slug}" no fue encontrado.`,
      });
    }

    if (!empresa.activo) {
      return res.status(403).json({
        error: `El servicio para "${empresa.nombre}" se encuentra inactivo.`,
      });
    }

    req.empresa = empresa;
    next();
  } catch (error: any) {
    console.error('Error en resolverTenant:', error);
    res.status(500).json({ error: 'Error al identificar el salón o empresa' });
  }
}

