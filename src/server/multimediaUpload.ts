import type { Request, Response } from 'express';
import { addSupportMediaByAdmin, getSupportMediaByAdmin } from './adminService';
import { createAssetKey, getStorageAdapter, IMAGE_MIME_TYPES } from './r2StorageAdapter';

export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

interface MultipartImage {
  filename: string;
  contentType: string;
  data: Buffer;
}

function parseContentDisposition(value: string): { name?: string; filename?: string } {
  const result: { name?: string; filename?: string } = {};
  const nameMatch = /(?:^|;)\s*name="([^"]*)"/i.exec(value);
  const filenameMatch = /(?:^|;)\s*filename="([^"]*)"/i.exec(value);
  if (nameMatch) result.name = nameMatch[1];
  if (filenameMatch) result.filename = filenameMatch[1];
  return result;
}

function parseMultipartImage(body: Buffer, contentTypeHeader: string): MultipartImage {
  const boundaryMatch = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentTypeHeader);
  if (!boundaryMatch) throw new Error('Multipart inválido: falta boundary.');
  const boundary = Buffer.from(`--${boundaryMatch[1] || boundaryMatch[2]}`);
  const separator = Buffer.from('\r\n\r\n');
  let cursor = 0;

  while (cursor < body.length) {
    const start = body.indexOf(boundary, cursor);
    if (start === -1) break;
    const partStart = start + boundary.length;
    if (body.slice(partStart, partStart + 2).equals(Buffer.from('--'))) break;
    const headerStart = body.slice(partStart, partStart + 2).equals(Buffer.from('\r\n')) ? partStart + 2 : partStart;
    const headerEnd = body.indexOf(separator, headerStart);
    if (headerEnd === -1) throw new Error('Multipart inválido: headers incompletos.');

    const headers = body.slice(headerStart, headerEnd).toString('utf8').split('\r\n');
    const headerMap = new Map<string, string>();
    for (const line of headers) {
      const colon = line.indexOf(':');
      if (colon > 0) headerMap.set(line.slice(0, colon).trim().toLowerCase(), line.slice(colon + 1).trim());
    }

    const disposition = parseContentDisposition(headerMap.get('content-disposition') || '');
    const dataStart = headerEnd + separator.length;
    const nextBoundary = body.indexOf(boundary, dataStart);
    if (nextBoundary === -1) throw new Error('Multipart inválido: boundary final ausente.');
    const dataEnd = nextBoundary >= 2 && body.slice(nextBoundary - 2, nextBoundary).equals(Buffer.from('\r\n'))
      ? nextBoundary - 2
      : nextBoundary;

    if (disposition.filename && disposition.name && ['file', 'image'].includes(disposition.name)) {
      return {
        filename: disposition.filename,
        contentType: headerMap.get('content-type') || 'application/octet-stream',
        data: body.slice(dataStart, dataEnd),
      };
    }
    cursor = nextBoundary;
  }

  throw new Error('No se encontró una imagen en el campo multipart file/image.');
}

export async function handleImageUpload(req: Request, res: Response) {
  try {
    const canonicalId = req.params.id?.trim();
    if (!canonicalId) return res.status(400).json({ status: 'error', message: 'canonical_id requerido.' });

    const contentTypeHeader = req.headers['content-type'];
    if (!contentTypeHeader || !contentTypeHeader.toLowerCase().startsWith('multipart/form-data')) {
      return res.status(415).json({ status: 'error', message: 'Se requiere multipart/form-data.' });
    }

    const body = Buffer.isBuffer(req.body) ? req.body : null;
    if (!body || body.length === 0) return res.status(400).json({ status: 'error', message: 'El upload está vacío.' });
    if (body.length > MAX_IMAGE_UPLOAD_BYTES + 4096) {
      return res.status(413).json({ status: 'error', message: 'El archivo excede el límite máximo permitido.' });
    }

    const image = parseMultipartImage(body, contentTypeHeader);
    if (!IMAGE_MIME_TYPES.has(image.contentType.toLowerCase())) {
      return res.status(415).json({ status: 'error', message: `MIME de imagen no permitido: ${image.contentType}.` });
    }
    if (image.data.length === 0) return res.status(400).json({ status: 'error', message: 'El archivo está vacío.' });
    if (image.data.length > MAX_IMAGE_UPLOAD_BYTES) {
      return res.status(413).json({ status: 'error', message: 'El archivo excede el límite máximo permitido.' });
    }

    const existing = await getSupportMediaByAdmin(canonicalId);
    const sortOrder = existing.reduce((max: number, item: any) => Math.max(max, Number(item.sort_order ?? item.sortOrder ?? 0)), -1) + 1;
    const key = createAssetKey(canonicalId, image.contentType.toLowerCase());
    const uploaded = await getStorageAdapter().upload({
      key,
      body: image.data,
      contentType: image.contentType.toLowerCase(),
      contentLength: image.data.length,
    });

    try {
      const media = await addSupportMediaByAdmin(canonicalId, {
        media_type: 'image',
        url: uploaded.url,
        mime_type: image.contentType.toLowerCase(),
        sort_order: sortOrder,
        title: image.filename.replace(/\.[^.]+$/, ''),
        alt: image.filename.replace(/\.[^.]+$/, ''),
        metadata: { storage_key: uploaded.key, original_filename: image.filename },
        active: true,
      });
      return res.status(201).json({ status: 'success', data: media });
    } catch (dbError) {
      try { await getStorageAdapter().delete(uploaded.key); } catch (cleanupError) {
        console.error('R2 cleanup after support_media failure failed:', cleanupError);
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error('Error uploading support image:', error);
    const message = error?.message || 'Error interno al subir la imagen.';
    const status = /no encontrado/i.test(message) ? 404 : /MIME|Multipart|archivo|canonical_id/i.test(message) ? 400 : 500;
    return res.status(status).json({ status: 'error', message });
  }
}
