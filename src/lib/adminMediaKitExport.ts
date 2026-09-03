export interface ExportSupport {
  canonical_id: string;
  name: string;
  ciudad: string;
  tipo_soporte: string;
  address?: string;
  description?: string;
  characteristics?: string;
  approvedPriceWithTax?: number;
  imageUrl?: string;
  image_url?: string;
  imageUrls?: string[];
  media?: Array<{ url?: string; media_type?: string; active?: boolean }>;
}

export interface ExportLead { name: string; email: string; company?: string; phone?: string; }

const clean = (v?: string) => (v || '').replace(/\r?\n/g, ' ').trim();
const esc = (v?: string) => clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
const html = (v?: string) => clean(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
const money = (v?: number) => Number(v) > 0 ? `ARS ${Number(v).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '';
const wrap = (v: string, max = 54) => { const out: string[] = []; let line = ''; for (const w of esc(v).split(/\s+/).filter(Boolean)) { const n = line ? `${line} ${w}` : w; if (n.length > max && line) { out.push(line); line = w; } else line = n; } if (line) out.push(line); return out; };
const text = (l: string[], value: string, x: number, y: number, size: number, bold = false) => l.push('BT', `/${bold ? 'F2' : 'F1'} ${size} Tf`, `${x} ${y} Td`, `(${esc(value)}) Tj`, 'ET');
const box = (l: string[], x: number, y: number, w: number, h: number, fill: string, stroke?: string) => { l.push(`${fill} rg`, `${x} ${y} ${w} ${h} re f`); if (stroke) l.push(`${stroke} RG`, `${x} ${y} ${w} ${h} re S`); };
const imageUrl = (s: ExportSupport) => { const media = (s.media || []).find((m) => m.active !== false && m.media_type !== 'video' && m.url); return media?.url || s.imageUrl || s.image_url || s.imageUrls?.find(Boolean) || ''; };

type Raster = { width: number; height: number; jpeg: Uint8Array; dataUri: string };

async function fetchRaster(url: string, maxWidth = 1200): Promise<Raster | null> {
  if (!url || typeof window === 'undefined') return null;
  try {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) return null;
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = objectUrl; });
      const scale = Math.min(1, maxWidth / Math.max(1, img.naturalWidth));
      const width = Math.max(1, Math.round(img.naturalWidth * scale));
      const height = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d'); if (!ctx) return null;
      ctx.drawImage(img, 0, 0, width, height);
      const dataUri = canvas.toDataURL('image/jpeg', 0.86);
      const b64 = dataUri.split(',')[1]; const bin = atob(b64); const jpeg = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) jpeg[i] = bin.charCodeAt(i);
      return { width, height, jpeg, dataUri };
    } finally { URL.revokeObjectURL(objectUrl); }
  } catch { return null; }
}

async function loadAssets(supports: ExportSupport[]) { const logo = await fetchRaster('/brand/brand-dark.webp', 900); const supportRasters = await Promise.all(supports.map((s) => fetchRaster(imageUrl(s), 900))); return { logo, supportRasters }; }

type PdfObj = { body: string; stream?: Uint8Array };
function buildPdf(objects: PdfObj[]) {
  const enc = new TextEncoder(); const chunks: Uint8Array[] = []; const offsets: number[] = [0]; let total = 0;
  const push = (s: string | Uint8Array) => { const b = typeof s === 'string' ? enc.encode(s) : s; chunks.push(b); total += b.length; };
  push('%PDF-1.4\n');
  objects.forEach((obj, i) => { offsets[i + 1] = total; push(`${i + 1} 0 obj\n${obj.body}\n`); if (obj.stream) { push('stream\n'); push(obj.stream); push('\nendstream\n'); } push('endobj\n'); });
  const xref = total; push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`); for (let i = 1; i <= objects.length; i++) push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`); push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  const out = new Uint8Array(total); let p = 0; chunks.forEach((c) => { out.set(c, p); p += c.length; }); return new Blob([out], { type: 'application/pdf' });
}

async function makePdf(lead: ExportLead, supports: ExportSupport[], requestId: string) {
  const { logo, supportRasters } = await loadAssets(supports);
  const objects: PdfObj[] = [];
  objects.push({ body: '<< /Type /Catalog /Pages 2 0 R >>' });
  objects.push({ body: 'PAGES' });
  objects.push({ body: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>' });
  objects.push({ body: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>' });
  const logoObj = logo ? objects.push({ body: `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.jpeg.length} >>`, stream: logo.jpeg }) - 1 : -1;
  const imageObjs = supportRasters.map((r) => r ? objects.push({ body: `<< /Type /XObject /Subtype /Image /Width ${r.width} /Height ${r.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${r.jpeg.length} >>`, stream: r.jpeg }) - 1 : -1);
  const pageRefs: number[] = [];
  const groups: ExportSupport[][] = []; for (let i = 0; i < supports.length; i += 2) groups.push(supports.slice(i, i + 2)); if (!groups.length) groups.push([]);
  const total = supports.reduce((a, s) => a + (Number(s.approvedPriceWithTax) || 0), 0);
  groups.forEach((group, pi) => {
    const lines: string[] = []; box(lines, 0, 0, 595, 842, '0.98 0.98 0.96'); box(lines, 0, 792, 595, 50, '0.025 0.263 0.29');
    if (logoObj >= 0) lines.push('q 150 0 0 30 40 802 cm /Logo Do Q'); else text(lines, 'GRUPO COMUNICARTE', 40, 815, 16, true);
    text(lines, 'MEDIA KIT', 470, 814, 9, true); text(lines, `Solicitud ${requestId}`, 40, 770, 9); text(lines, `Cliente: ${lead.name}`, 40, 750, 11, true); if (lead.company) text(lines, `Empresa: ${lead.company}`, 40, 733, 9); text(lines, `Soportes: ${supports.length}`, 440, 750, 9);
    const cardW = 250, cardH = 330, cardXs = [40, 305], cardY = 390;
    group.forEach((s, gi) => { const x = cardXs[gi]; box(lines, x, cardY, cardW, cardH, '1 1 1', '0.86 0.88 0.87'); box(lines, x, cardY + cardH - 7, cardW, 7, '0.03 0.75 0.54'); const idx = pi * 2 + gi; const raster = supportRasters[idx]; if (raster) { const iw = 228, ih = 130, ratio = Math.min(iw / raster.width, ih / raster.height); const dw = raster.width * ratio, dh = raster.height * ratio; const ix = x + 11 + (iw - dw) / 2, iy = cardY + cardH - 152 + (ih - dh) / 2; lines.push(`q ${dw} 0 0 ${dh} ${ix} ${iy} cm /Im${idx + 1} Do Q`); } else { box(lines, x + 11, cardY + cardH - 141, 228, 130, '0.94 0.96 0.95'); text(lines, 'FOTOGRAFIA NO DISPONIBLE', x + 43, cardY + cardH - 78, 7, true); }
      text(lines, `${idx + 1}. ${s.name}`, x + 12, cardY + cardH - 174, 11, true); text(lines, `${s.ciudad} - ${s.tipo_soporte}`, x + 12, cardY + cardH - 192, 8); if (s.approvedPriceWithTax) text(lines, money(s.approvedPriceWithTax), x + 12, cardY + cardH - 215, 11, true); if (s.address) text(lines, `Direccion: ${s.address}`, x + 12, cardY + cardH - 234, 7); let dy = cardY + 74; wrap(`Descripcion: ${s.description || 'Sin descripcion'}`, 42).slice(0, 3).forEach(v => { text(lines, v, x + 12, dy, 7); dy -= 10; }); wrap(`Caracteristicas: ${s.characteristics || 'Sin detalle'}`, 42).slice(0, 2).forEach(v => { text(lines, v, x + 12, dy, 7); dy -= 10; }); });
    if (pi === groups.length - 1) { box(lines, 40, 45, 515, 68, '0.93 0.98 0.96'); text(lines, 'RESUMEN DE LA SOLICITUD', 56, 91, 8, true); text(lines, `Soportes seleccionados: ${supports.length}`, 56, 72, 8); text(lines, total > 0 ? `Inversion estimada: ${money(total)}` : 'Inversion sujeta a cotizacion', 315, 72, 9, true); }
    text(lines, `Grupo Comunicarte - Media Kit - Pagina ${pi + 1}/${groups.length}`, 40, 23, 7);
    const content = new TextEncoder().encode(lines.join('\n')); const contentObj = objects.push({ body: `<< /Length ${content.length} >>`, stream: content }) - 1;
    const xobjects = [`/Font << /F1 3 0 R /F2 4 0 R >>`]; if (logoObj >= 0) xobjects.push(`/Logo ${logoObj + 1} 0 R`); imageObjs.forEach((ref, idx) => { if (ref >= 0 && group.includes(supports[idx])) xobjects.push(`/Im${idx + 1} ${ref + 1} 0 R`); });
    const pageObj = objects.push({ body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << ${xobjects.join(' ')} >> /Contents ${contentObj + 1} 0 R >>` }) - 1; pageRefs.push(pageObj + 1);
  });
  objects[1] = { body: `<< /Type /Pages /Kids [${pageRefs.map(r => `${r} 0 R`).join(' ')}] /Count ${pageRefs.length} >>` };
  return buildPdf(objects);
}

async function makePpt(lead: ExportLead, supports: ExportSupport[], requestId: string) {
  const { logo, supportRasters } = await loadAssets(supports);
  const logoSrc = logo?.dataUri || '/brand/brand-dark.webp';
  const cover = `<section style="page-break-after:always;width:960px;height:540px;padding:52px;background:#06434A;color:#FAF9F5;font-family:Inter,Arial,sans-serif;box-sizing:border-box"><img src="${logoSrc}" style="width:190px;height:auto;object-fit:contain;display:block"/><div style="margin-top:88px;font-size:44px;font-weight:800">MEDIA KIT</div><div style="margin-top:16px;font-size:18px;opacity:.88">Solicitud ${html(requestId)}</div><div style="margin-top:82px;font-size:15px">${html(lead.name)}${lead.company ? ` - ${html(lead.company)}` : ''}</div></section>`;
  const slides = supports.map((s, i) => { const src = supportRasters[i]?.dataUri || imageUrl(s); const img = src ? `<img src="${src}" style="width:100%;height:220px;object-fit:cover;border-radius:10px;display:block"/>` : `<div style="height:220px;border-radius:10px;background:#edf2f0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#60706d">FOTOGRAFIA NO DISPONIBLE</div>`; return `<section style="page-break-after:always;width:960px;height:540px;padding:42px;background:#FAF9F5;color:#172120;font-family:Inter,Arial,sans-serif;box-sizing:border-box"><div style="display:flex;align-items:center;justify-content:space-between"><img src="${logoSrc}" style="width:150px;height:auto;object-fit:contain"/><div style="font-size:11px;color:#60706d">Solicitud ${html(requestId)} - ${i + 1}/${supports.length}</div></div><div style="margin-top:22px;padding:20px;background:#fff;border:1px solid #dfe5e3;border-top:6px solid #07BE8A;border-radius:10px"><div style="display:flex;justify-content:space-between;gap:22px"><div><h1 style="font-size:28px;margin:0 0 7px">${html(s.name)}</h1><div style="font-size:14px;color:#53615f">${html(s.ciudad)} - ${html(s.tipo_soporte)}</div></div>${s.approvedPriceWithTax ? `<div style="font-size:21px;font-weight:800;color:#06434A;white-space:nowrap">${html(money(s.approvedPriceWithTax))}</div>` : ''}</div><div style="margin-top:18px">${img}</div><div style="margin-top:14px;font-size:13px"><b>Direccion:</b> ${html(s.address || 'No informada')}</div><div style="margin-top:9px;font-size:13px;line-height:1.35"><b>Descripcion:</b> ${html(s.description || 'Sin descripcion')}</div><div style="margin-top:7px;font-size:13px;line-height:1.35"><b>Caracteristicas:</b> ${html(s.characteristics || 'Sin detalle')}</div></div></section>`; }).join('');
  const total = supports.reduce((a, s) => a + (Number(s.approvedPriceWithTax) || 0), 0);
  const summary = `<section style="width:960px;height:540px;padding:52px;background:#06434A;color:#FAF9F5;font-family:Inter,Arial,sans-serif;box-sizing:border-box"><img src="${logoSrc}" style="width:190px;height:auto;object-fit:contain"/><div style="margin-top:64px;font-size:12px;font-weight:800;letter-spacing:.08em;opacity:.8">RESUMEN COMERCIAL</div><h1 style="font-size:38px;margin:18px 0">${supports.length} soportes seleccionados</h1><div style="font-size:20px;opacity:.92">${total > 0 ? `Inversion estimada: <b>${html(money(total))}</b>` : 'Inversion sujeta a cotizacion'}</div><div style="margin-top:150px;font-size:12px;opacity:.72">Disponibilidad sujeta a confirmacion comercial.</div></section>`;
  return new Blob([`<html><head><meta charset="utf-8"></head><body style="margin:0">${cover}${slides}${summary}</body></html>`], { type: 'application/vnd.ms-powerpoint' });
}

export function downloadBlob(blob: Blob, filename: string) { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
export async function downloadMediaKitPdf(lead: ExportLead, supports: ExportSupport[], requestId: string) { downloadBlob(await makePdf(lead, supports, requestId), `media-kit-${requestId}.pdf`); }
export async function downloadMediaKitPpt(lead: ExportLead, supports: ExportSupport[], requestId: string) { downloadBlob(await makePpt(lead, supports, requestId), `media-kit-${requestId}.ppt`); }
export async function sendMediaKitToLead(lead: ExportLead, supports: ExportSupport[], requestId: string) { const pdf = await makePdf(lead, supports, requestId), ppt = await makePpt(lead, supports, requestId); const files = [new File([pdf], `media-kit-${requestId}.pdf`, { type: 'application/pdf' }), new File([ppt], `media-kit-${requestId}.ppt`, { type: 'application/vnd.ms-powerpoint' })]; if (navigator.share && (!navigator.canShare || navigator.canShare({ files }))) { await navigator.share({ title: `Media Kit ${requestId}`, text: `Media Kit aprobado para ${lead.name}.`, files }); return 'shared'; } window.location.href = `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(`Media Kit ${requestId} - Grupo Comunicarte`)}&body=${encodeURIComponent(`Hola ${lead.name},\n\nAdjuntá el Media Kit aprobado (${requestId}).\n\nSaludos,\nGrupo Comunicarte`)}`; return 'mailto'; }
