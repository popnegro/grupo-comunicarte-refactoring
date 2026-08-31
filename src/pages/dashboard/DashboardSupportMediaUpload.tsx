import { useRef, useState } from 'react';
import { CheckCircle2, ImagePlus, Loader2, Upload, X } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime';

type UploadedMedia = { id?: number; url?: string; media_type?: string; title?: string };

export default function DashboardSupportMediaUpload({ canonicalId }: { canonicalId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploaded, setUploaded] = useState<UploadedMedia[]>([]);

  const chooseFiles = (selected: FileList | null) => {
    setError('');
    const next = Array.from(selected || []);
    const invalid = next.find((file) => !ACCEPT.split(',').includes(file.type) || file.size > MAX_BYTES || file.size === 0);
    if (invalid) {
      setError(`${invalid.name}: formato no permitido o supera el límite de 10 MB.`);
      return;
    }
    setFiles(next);
  };

  const upload = async () => {
    if (!canonicalId || files.length === 0) return;
    setError('');
    setUploading(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) throw new Error('Sesión administrativa expirada. Volvé a iniciar sesión.');
      const results: UploadedMedia[] = [];
      for (const file of files) {
        const body = new FormData();
        body.append('file', file, file.name);
        const response = await apiFetch(`/api/admin/supports/${encodeURIComponent(canonicalId)}/media/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body,
        });
        const json = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error('Sesión administrativa expirada. Volvé a iniciar sesión.');
        if (!response.ok || json.status !== 'success') throw new Error(json.message || `No se pudo subir ${file.name}.`);
        results.push(json.data || {});
      }
      setUploaded((current) => [...current, ...results]);
      setFiles([]);
      if (inputRef.current) inputRef.current.value = '';
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo completar la carga.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-eyebrow text-gray-500">MULTIMEDIA · R2</div>
          <h2 className="mt-1 text-lg font-bold text-gray-900">Imágenes y videos</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Cargá archivos directamente desde tu equipo. La primera carga queda como portada y las siguientes se agregan a la galería.</p>
        </div>
        <ImagePlus className="h-5 w-5 shrink-0 text-emerald-700" />
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
        <input ref={inputRef} className="sr-only" type="file" accept={ACCEPT} multiple onChange={(event) => chooseFiles(event.target.files)} />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-800 disabled:opacity-50">
          <Upload className="h-4 w-4" /> Seleccionar archivos
        </button>
        <span className="ml-3 text-xs text-gray-500">JPG, PNG, WebP, MP4, WebM o MOV · máximo 10 MB por archivo</span>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file) => (
              <div key={`${file.name}-${file.size}`} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs">
                <span className="truncate font-semibold text-gray-800">{file.name}</span>
                <span className="ml-3 shrink-0 text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            ))}
            <button type="button" onClick={upload} disabled={uploading} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? 'Subiendo…' : `Subir ${files.length} archivo${files.length === 1 ? '' : 's'}`}
            </button>
          </div>
        )}
      </div>

      {error && <div role="alert" className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      {uploaded.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploaded.map((media, index) => (
            <div key={`${media.id || media.url || index}`} className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
              <span className="min-w-0 flex-1 truncate text-xs font-semibold text-emerald-900">{media.title || media.url || 'Archivo cargado correctamente'}</span>
              <button type="button" aria-label="Ocultar resultado" onClick={() => setUploaded((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="text-emerald-700"><X className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
