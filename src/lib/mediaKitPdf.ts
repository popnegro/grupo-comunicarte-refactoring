export interface MediaKitSupport {
  canonical_id: string;
  name: string;
  ciudad: string;
  tipo_soporte: string;
  address?: string;
  description?: string;
  characteristics?: string;
}

export interface MediaKitLead {
  name: string;
  email: string;
  company?: string;
  phone?: string;
}

function pdfEscape(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapText(value: string, maxChars = 82): string[] {
  const words = pdfEscape(value || '').split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function contentStream(lead: MediaKitLead, supports: MediaKitSupport[], requestId: string, pageSupports: MediaKitSupport[], pageIndex: number, totalPages: number): string {
  const lines: string[] = [];
  lines.push('BT', '/F1 20 Tf', '50 770 Td', `(Grupo Comunicarte - Media Kit) Tj`);
  lines.push('/F1 10 Tf', '0 -24 Td', `(Solicitud: ${pdfEscape(requestId)}) Tj`);
  lines.push('0 -16 Td', `(Fecha: ${pdfEscape(new Date().toLocaleDateString('es-AR'))}) Tj`);
  lines.push('0 -18 Td', `(Cliente: ${pdfEscape(lead.name)}) Tj`);
  if (lead.company) lines.push('0 -14 Td', `(Empresa: ${pdfEscape(lead.company)}) Tj`);
  lines.push('0 -14 Td', `(Email: ${pdfEscape(lead.email)}) Tj`);
  if (lead.phone) lines.push('0 -14 Td', `(Telefono: ${pdfEscape(lead.phone)}) Tj`);
  lines.push('0 -24 Td', '/F1 13 Tf', `(Soportes seleccionados - pagina ${pageIndex} de ${totalPages}) Tj`);
  lines.push('/F1 10 Tf');

  pageSupports.forEach((support, index) => {
    lines.push('0 -20 Td', `/F1 12 Tf`, `(${index + 1}. ${pdfEscape(support.name)}) Tj`, '/F1 9 Tf');
    lines.push('0 -13 Td', `(Ubicacion: ${pdfEscape(support.ciudad)}) Tj`);
    lines.push('0 -13 Td', `(Tipo: ${pdfEscape(support.tipo_soporte)}) Tj`);
    if (support.address) lines.push('0 -13 Td', `(Direccion: ${pdfEscape(support.address)}) Tj`);
    if (support.description) {
      wrapText(`Descripcion: ${support.description}`, 88).slice(0, 2).forEach((line) => lines.push('0 -13 Td', `(${line}) Tj`));
    }
    if (support.characteristics) {
      wrapText(`Caracteristicas: ${support.characteristics}`, 88).slice(0, 2).forEach((line) => lines.push('0 -13 Td', `(${line}) Tj`));
    }
  });

  lines.push('0 -26 Td', '/F1 8 Tf', `(Documento comercial informativo. Disponibilidad sujeta a confirmacion.) Tj`, 'ET');
  return lines.join('\n');
}

function createPdfBytes(lead: MediaKitLead, supports: MediaKitSupport[], requestId: string): Uint8Array {
  const pageSize = 6;
  const pages: MediaKitSupport[][] = [];
  for (let i = 0; i < supports.length; i += pageSize) pages.push(supports.slice(i, i + pageSize));
  if (pages.length === 0) pages.push([]);

  const objects: string[] = [];
  const pageIds: number[] = [];
  const fontId = 3;
  let nextId = 4;

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = 'PAGES_PLACEHOLDER';
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  for (let i = 0; i < pages.length; i += 1) {
    const contentId = nextId++;
    const pageId = nextId++;
    const stream = contentStream(lead, supports, requestId, pages[i], i + 1, pages.length);
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`;
    pageIds.push(pageId);
  }

  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (let id = 1; id < objects.length; id += 1) {
    if (!objects[id]) continue;
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) {
    pdf += `${String(offsets[id] || 0).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

export function downloadMediaKitPdf(lead: MediaKitLead, supports: MediaKitSupport[], requestId: string): void {
  const bytes = createPdfBytes(lead, supports, requestId);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `media-kit-${requestId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
