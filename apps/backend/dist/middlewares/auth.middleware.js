"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiereAutenticacion = requiereAutenticacion;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
/**
 * Middleware simple de autenticación para el panel de administración.
 * MVP: valida un JWT emitido manualmente al dueño del negocio.
 */
function requiereAutenticacion(req, res, next) {
    const header = req.headers.authorization;
    if (!header)
        return res.status(401).json({ error: 'No autenticado' });
    const token = header.replace('Bearer ', '');
    try {
        jsonwebtoken_1.default.verify(token, JWT_SECRET);
        next();
    }
    catch {
        res.status(401).json({ error: 'Token inválido' });
    }
}
