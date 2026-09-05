import { Router } from 'express';
import { prisma } from '../../config/database';

export const configuracionRouter = Router();

// GET /api/configuracion -> Retorna datos del salón actual (nombre, horarios, banner, contacto)
configuracionRouter.get('/', async (req, res) => {
  try {
    const empresa = req.empresa;
    if (!empresa) {
      // Fallback a Belle Slot si no hay contexto
      const fallback = await prisma.empresa.findUnique({ where: { slug: 'belle-slot' } });
      if (!fallback) return res.status(404).json({ error: 'Configuración no encontrada' });
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
        colorPrimario: fallback.colorPrimario,
        colorSecundario: fallback.colorSecundario,
        colorAcento: fallback.colorAcento,
        colorFondo: fallback.colorFondo,
        personalizacion: fallback.personalizacion,
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
      colorPrimario: empresa.colorPrimario,
      colorSecundario: empresa.colorSecundario,
      colorAcento: empresa.colorAcento,
      colorFondo: empresa.colorFondo,
      personalizacion: empresa.personalizacion,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/configuracion o /api/admin/configuracion
configuracionRouter.patch('/', async (req, res) => {
  try {
    const empresaId = req.empresa?.id;
    if (!empresaId) return res.status(404).json({ error: 'Salón no especificado' });

    const {
      nombreNegocio,
      direccion,
      telefonoWhatsapp,
      emailContacto,
      horarioApertura,
      horarioCierre,
      diasAtencion,
      duracionBloqueMinutos,
      horasAnticipacionCancelacion,
      textoBannerPrecio,
      colorPrimario,
      colorSecundario,
      colorAcento,
      colorFondo,
      personalizacion,
    } = req.body;

    const dataToUpdate: any = {};
    if (nombreNegocio !== undefined) dataToUpdate.nombre = nombreNegocio;
    if (direccion !== undefined) dataToUpdate.direccion = direccion;
    if (telefonoWhatsapp !== undefined) dataToUpdate.telefonoWhatsapp = telefonoWhatsapp;
    if (emailContacto !== undefined) dataToUpdate.emailContacto = emailContacto;
    if (horarioApertura !== undefined) dataToUpdate.horarioApertura = horarioApertura;
    if (horarioCierre !== undefined) dataToUpdate.horarioCierre = horarioCierre;
    if (diasAtencion !== undefined) dataToUpdate.diasAtencion = diasAtencion;
    if (duracionBloqueMinutos !== undefined) dataToUpdate.duracionBloqueMinutos = Number(duracionBloqueMinutos);
    if (horasAnticipacionCancelacion !== undefined)
      dataToUpdate.horasAnticipacionCancelacion = Number(horasAnticipacionCancelacion);
    if (textoBannerPrecio !== undefined) dataToUpdate.textoBannerPrecio = textoBannerPrecio;
    if (colorPrimario !== undefined) dataToUpdate.colorPrimario = colorPrimario;
    if (colorSecundario !== undefined) dataToUpdate.colorSecundario = colorSecundario;
    if (colorAcento !== undefined) dataToUpdate.colorAcento = colorAcento;
    if (colorFondo !== undefined) dataToUpdate.colorFondo = colorFondo;
    if (personalizacion !== undefined) dataToUpdate.personalizacion = personalizacion;

    const actualizado = await prisma.empresa.update({
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
      colorPrimario: actualizado.colorPrimario,
      colorSecundario: actualizado.colorSecundario,
      colorAcento: actualizado.colorAcento,
      colorFondo: actualizado.colorFondo,
      personalizacion: actualizado.personalizacion,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
