"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuracionRouter = void 0;
const express_1 = require("express");
const database_1 = require("../../config/database");
exports.configuracionRouter = (0, express_1.Router)();
// GET /api/configuracion -> Retorna datos del salón actual (nombre, horarios, banner, contacto)
exports.configuracionRouter.get('/', async (req, res) => {
    try {
        const empresa = req.empresa;
        if (!empresa) {
            // Fallback a Belle Slot si no hay contexto
            const fallback = await database_1.prisma.empresa.findUnique({ where: { slug: 'belle-slot' } });
            if (!fallback)
                return res.status(404).json({ error: 'Configuración no encontrada' });
            return res.json({
                id: fallback.id,
                nombreNegocio: fallback.nombre,
                slug: fallback.slug,
                logoUrl: fallback.logoUrl,
                direccion: fallback.direccion,
                telefonoWhatsapp: fallback.telefonoWhatsapp,
                emailContacto: fallback.emailContacto,
                horarioApertura: fallback.horarioApertura,
                horarioCierre: fallback.horarioCierre,
                diasAtencion: fallback.diasAtencion,
                duracionBloqueMinutos: fallback.duracionBloqueMinutos,
                horasAnticipacionCancelacion: fallback.horasAnticipacionCancelacion,
                textoBannerPrecio: fallback.textoBannerPrecio,
            });
        }
        res.json({
            id: empresa.id,
            nombreNegocio: empresa.nombre,
            slug: empresa.slug,
            logoUrl: empresa.logoUrl,
            direccion: empresa.direccion,
            telefonoWhatsapp: empresa.telefonoWhatsapp,
            emailContacto: empresa.emailContacto,
            horarioApertura: empresa.horarioApertura,
            horarioCierre: empresa.horarioCierre,
            diasAtencion: empresa.diasAtencion,
            duracionBloqueMinutos: empresa.duracionBloqueMinutos,
            horasAnticipacionCancelacion: empresa.horasAnticipacionCancelacion,
            textoBannerPrecio: empresa.textoBannerPrecio,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PATCH /api/configuracion o /api/admin/configuracion
exports.configuracionRouter.patch('/', async (req, res) => {
    try {
        const empresaId = req.empresa?.id;
        if (!empresaId)
            return res.status(404).json({ error: 'Salón no especificado' });
        const { nombreNegocio, direccion, telefonoWhatsapp, emailContacto, horarioApertura, horarioCierre, diasAtencion, duracionBloqueMinutos, horasAnticipacionCancelacion, textoBannerPrecio, } = req.body;
        const dataToUpdate = {};
        if (nombreNegocio !== undefined)
            dataToUpdate.nombre = nombreNegocio;
        if (direccion !== undefined)
            dataToUpdate.direccion = direccion;
        if (telefonoWhatsapp !== undefined)
            dataToUpdate.telefonoWhatsapp = telefonoWhatsapp;
        if (emailContacto !== undefined)
            dataToUpdate.emailContacto = emailContacto;
        if (horarioApertura !== undefined)
            dataToUpdate.horarioApertura = horarioApertura;
        if (horarioCierre !== undefined)
            dataToUpdate.horarioCierre = horarioCierre;
        if (diasAtencion !== undefined)
            dataToUpdate.diasAtencion = diasAtencion;
        if (duracionBloqueMinutos !== undefined)
            dataToUpdate.duracionBloqueMinutos = Number(duracionBloqueMinutos);
        if (horasAnticipacionCancelacion !== undefined)
            dataToUpdate.horasAnticipacionCancelacion = Number(horasAnticipacionCancelacion);
        if (textoBannerPrecio !== undefined)
            dataToUpdate.textoBannerPrecio = textoBannerPrecio;
        const actualizado = await database_1.prisma.empresa.update({
            where: { id: empresaId },
            data: dataToUpdate,
        });
        res.json({
            id: actualizado.id,
            nombreNegocio: actualizado.nombre,
            slug: actualizado.slug,
            logoUrl: actualizado.logoUrl,
            direccion: actualizado.direccion,
            telefonoWhatsapp: actualizado.telefonoWhatsapp,
            emailContacto: actualizado.emailContacto,
            horarioApertura: actualizado.horarioApertura,
            horarioCierre: actualizado.horarioCierre,
            diasAtencion: actualizado.diasAtencion,
            duracionBloqueMinutos: actualizado.duracionBloqueMinutos,
            horasAnticipacionCancelacion: actualizado.horasAnticipacionCancelacion,
            textoBannerPrecio: actualizado.textoBannerPrecio,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
