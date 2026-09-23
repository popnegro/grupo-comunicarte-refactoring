export function hasValidMagicNumber(data: Buffer, mimeType: string): boolean {
  const startsWith = (...bytes: number[]) => data.length >= bytes.length && bytes.every((value, index) => data[index] === value);
  if (mimeType === 'image/jpeg') return startsWith(0xff, 0xd8, 0xff);
  if (mimeType === 'image/png') return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  if (mimeType === 'image/webp') return data.length >= 12 && data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP';
  if (mimeType === 'video/mp4') return data.length >= 12 && data.toString('ascii', 4, 8) === 'ftyp';
  if (mimeType === 'video/webm') return startsWith(0x1a, 0x45, 0xdf, 0xa3);
  if (mimeType === 'video/quicktime') return data.length >= 12 && data.toString('ascii', 4, 8) === 'ftyp';
  return false;
}
