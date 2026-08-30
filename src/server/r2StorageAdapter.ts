import crypto from 'crypto';

const DEFAULT_REGION = 'auto';
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface StorageUploadInput {
  key: string;
  body: Buffer | Uint8Array | NodeJS.ReadableStream;
  contentType: string;
  contentLength?: number;
}

export interface StorageAdapter {
  upload(input: StorageUploadInput): Promise<{ key: string; url: string }>;
  delete(key: string): Promise<void>;
  replace(input: StorageUploadInput, previousKey?: string): Promise<{ key: string; url: string }>;
  getAssetUrl(key: string): string;
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Falta la variable de entorno ${name}.`);
  return value;
}

function sha256(value: string | Buffer): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function hmac(key: Buffer | string, value: string): Buffer {
  return crypto.createHmac('sha256', key).update(value).digest();
}

function encodePath(key: string): string {
  return key.split('/').map((part) => encodeURIComponent(part)).join('/');
}

async function bodyToBuffer(body: StorageUploadInput['body']): Promise<Buffer> {
  if (Buffer.isBuffer(body)) return body;
  if (body instanceof Uint8Array) return Buffer.from(body);
  const chunks: Buffer[] = [];
  for await (const chunk of body as AsyncIterable<Buffer | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    const size = chunks.reduce((total, chunkBuffer) => total + chunkBuffer.length, 0);
    if (size > MAX_UPLOAD_BYTES) throw new Error('El archivo excede el límite máximo permitido.');
  }
  return Buffer.concat(chunks);
}

class CloudflareR2StorageAdapter implements StorageAdapter {
  private readonly endpoint: string;
  private readonly bucket: string;
  private readonly region: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly publicUrl: string;

  constructor() {
    this.endpoint = requiredEnv('STORAGE_ENDPOINT').replace(/\/$/, '');
    this.bucket = requiredEnv('STORAGE_BUCKET');
    this.region = process.env.STORAGE_REGION?.trim() || DEFAULT_REGION;
    this.accessKey = requiredEnv('STORAGE_ACCESS_KEY');
    this.secretKey = requiredEnv('STORAGE_SECRET_KEY');
    this.publicUrl = requiredEnv('STORAGE_PUBLIC_URL').replace(/\/$/, '');
  }

  getAssetUrl(key: string): string {
    return `${this.publicUrl}/${encodePath(key)}`;
  }

  private async request(method: 'PUT' | 'DELETE', key: string, body?: Buffer, contentType?: string) {
    const url = `${this.endpoint}/${encodePath(this.bucket)}/${encodePath(key)}`;
    const parsed = new URL(url);
    const host = parsed.host;
    const payloadHash = body ? sha256(body) : sha256('');
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const headers: Record<string, string> = {
      host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    };
    if (contentType) headers['content-type'] = contentType;
    const signedHeaders = Object.keys(headers).sort();
    const canonicalHeaders = signedHeaders.map((name) => `${name}:${headers[name].trim()}\n`).join('');
    const canonicalRequest = [method, parsed.pathname, parsed.search.slice(1), canonicalHeaders, signedHeaders.join(';'), payloadHash].join('\n');
    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;
    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, sha256(canonicalRequest)].join('\n');
    const kDate = hmac(`AWS4${this.secretKey}`, dateStamp);
    const kRegion = hmac(kDate, this.region);
    const kService = hmac(kRegion, 's3');
    const kSigning = hmac(kService, 'aws4_request');
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
    headers.authorization = `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders.join(';')}, Signature=${signature}`;
    const response = await fetch(url, { method, headers, body });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`R2 ${method} falló (${response.status}): ${detail.slice(0, 500)}`);
    }
  }

  async upload(input: StorageUploadInput): Promise<{ key: string; url: string }> {
    if (!IMAGE_MIME_TYPES.has(input.contentType)) throw new Error(`MIME de imagen no permitido: ${input.contentType}.`);
    const body = await bodyToBuffer(input.body);
    if (body.length === 0) throw new Error('El archivo está vacío.');
    if (body.length > MAX_UPLOAD_BYTES) throw new Error('El archivo excede el límite máximo permitido.');
    await this.request('PUT', input.key, body, input.contentType);
    return { key: input.key, url: this.getAssetUrl(input.key) };
  }

  async delete(key: string): Promise<void> { await this.request('DELETE', key); }

  async replace(input: StorageUploadInput, previousKey?: string): Promise<{ key: string; url: string }> {
    const uploaded = await this.upload(input);
    if (previousKey && previousKey !== input.key) {
      try { await this.delete(previousKey); } catch (error) { console.error('R2 replace: no se pudo eliminar el asset anterior:', error); }
    }
    return uploaded;
  }
}

let adapter: CloudflareR2StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (!adapter) adapter = new CloudflareR2StorageAdapter();
  return adapter;
}

export function createAssetKey(canonicalId: string, mimeType: string): string {
  const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/png' ? 'png' : 'webp';
  const safeId = canonicalId.replace(/[^a-zA-Z0-9_-]/g, '-');
  return `soporte/${safeId}/cover/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extension}`;
}
