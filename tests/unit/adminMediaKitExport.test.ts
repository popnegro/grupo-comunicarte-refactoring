import test from 'node:test';
import assert from 'node:assert/strict';
import { inflateRawSync } from 'node:zlib';
import { generateMediaKitPdf, generateMediaKitPptx, type ExportLead, type ExportSupport } from '../../src/lib/adminMediaKitExport';

const lead: ExportLead = { name: 'Cliente QA', email: 'qa@example.test', company: 'Empresa QA' };
const supports: ExportSupport[] = [
  { canonical_id: 'qa-1', name: 'Soporte Norte', ciudad: 'Mendoza', tipo_soporte: 'Tradicional', approvedPriceWithTax: 125000 },
  { canonical_id: 'qa-2', name: 'Soporte Sur', ciudad: 'Maipú', tipo_soporte: 'Pantalla LED', approvedPriceWithTax: 250000 },
  { canonical_id: 'qa-3', name: 'Soporte Centro', ciudad: 'Godoy Cruz', tipo_soporte: 'LED móvil', approvedPriceWithTax: 50000 },
];

function zipEntries(bytes: Uint8Array): Map<string, Uint8Array> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  assert.notEqual(eocd, -1, 'PPTX must contain a ZIP end-of-central-directory record');
  const count = view.getUint16(eocd + 10, true);
  let cursor = view.getUint32(eocd + 16, true);
  const entries = new Map<string, Uint8Array>();
  for (let i = 0; i < count; i++) {
    assert.equal(view.getUint32(cursor, true), 0x02014b50, 'valid ZIP central directory entry');
    const method = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const name = new TextDecoder().decode(bytes.slice(cursor + 46, cursor + 46 + nameLength));
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.slice(dataStart, dataStart + compressedSize);
    const content = method === 8 ? inflateRawSync(compressed) : compressed;
    entries.set(name, content);
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

test('Media Kit PDF is a structurally valid multi-page PDF with request content', async () => {
  const blob = await generateMediaKitPdf(lead, supports, 'QA-77');
  assert.equal(blob.type, 'application/pdf');
  assert.ok(blob.size > 500, 'PDF must not be empty');
  const pdf = new TextDecoder().decode(await blob.arrayBuffer());
  assert.ok(pdf.startsWith('%PDF-1.4'));
  assert.ok(pdf.endsWith('%%EOF'));
  assert.match(pdf, /\/Type \/Pages[\s\S]*\/Count 2\b/);
  assert.match(pdf, /Soporte Norte/);
  assert.match(pdf, /Soporte Centro/);
  assert.match(pdf, /Inversion estimada/);
});

test('Media Kit PPTX is a valid editable Office package with slide text', async () => {
  const blob = await generateMediaKitPptx(lead, supports, 'QA-77');
  assert.equal(blob.type, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  assert.ok(blob.size > 1000, 'PPTX must not be empty');
  const bytes = new Uint8Array(await blob.arrayBuffer());
  assert.equal(new DataView(bytes.buffer).getUint32(0, true), 0x04034b50, 'PPTX must start with ZIP signature');
  const entries = zipEntries(bytes);
  assert.ok(entries.has('[Content_Types].xml'));
  assert.ok(entries.has('ppt/presentation.xml'));
  const slides = [...entries.keys()].filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name));
  assert.equal(slides.length, 5, 'cover + 3 support slides + summary slide');
  const slideXml = slides.map((name) => new TextDecoder().decode(entries.get(name)!)).join('\n');
  assert.match(slideXml, /Soporte Norte/);
  assert.match(slideXml, /Soporte Centro/);
  assert.match(slideXml, /Cliente QA/);
  assert.match(slideXml, /<p:sp>/, 'text and shapes must be native editable PowerPoint objects');
});
