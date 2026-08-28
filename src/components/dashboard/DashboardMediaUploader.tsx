import { useEffect, useState } from 'react';
import { ImagePlus, Upload } from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface SupportOption {
  canonical_id: string;
  name: string;
}

export function DashboardMediaUploader() {
  const [supports, setSupports] = useState<SupportOption[]>([]);
  const [supportId, setSupportId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    let active = true;
    async function loadSupports() {
      if (!token) return;
      try {
        const res = await apiFetch('/api/admin/supports', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok || json.status !== 'success') throw new Error(json.message || 'No se pudo cargar el inventario.');
        if (active) setSupports(Array.isArray(json.data) ? json.data : []);
      } catch (err: any) {
        if (active) {
          setError(true);
          setMessage(err.message || 'No se pudo cargar el inventario.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadSupports();
    return () => { active = false; };
  }, [token]);

  async function upload() {
    if (!supportId || !file || !token) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError(true);
      setMessage('Formato no permitido. Usá JPG, PNG o WebP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(true);
      setMessage('La imagen supera el límite de 10 MB.');
      return;
    }

    setUploading(true);
    setError(false);
    setMessage('Subiendo imagen a Storage…');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiFetch(`/api/admin/supports/${supportId}/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || json.status !== 'success') throw new Error(json.message || 'No se pudo subir la imagen.');
      setMessage('Imagen subida correctamente a Storage y registrada en support_media.');
      setFile(null);
    } catch (err: any) {
      setError(true);
      setMessage(err.message || 'Error al subir la imagen.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-emerald-100 text-emerald-700">
          <ImagePlus className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-xs font-extrabold text-gray-950">Multimedia real</h2>
          <p className="mt-0.5 text-[11px] leading-4 text-gray-500">Carga una imagen directamente a Cloudflare R2 y la registra en support_media.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <select
          value={supportId}
          onChange={(event) => setSupportId(event.target.value)}
          disabled={loading || uploading}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700"
        >
          <option value="">Seleccionar soporte…</option>
          {supports.map((support) => (
            <option key={support.canonical_id} value={support.canonical_id}>
              {support.name} · {support.canonical_id}
            </option>
          ))}
        </select>

        <label className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold ${uploading || !supportId ? 'cursor-not-allowed bg-gray-200 text-gray-500' : 'cursor-pointer bg-gray-950 text-white hover:bg-gray-800'}`}>
          <Upload className="h-3.5 w-3.5" />
          {uploading ? 'Subiendo…' : file ? 'Cambiar imagen' : 'Adjuntar imagen'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading || !supportId}
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </label>
      </div>

      {file && (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-white border border-gray-200 px-3 py-2 text-[11px]">
          <span className="truncate font-semibold text-gray-700">{file.name}</span>
          <button type="button" onClick={() => setFile(null)} className="font-bold text-gray-500 hover:text-gray-900">Quitar</button>
        </div>
      )}

      <button
        type="button"
        onClick={() => void upload()}
        disabled={!supportId || !file || uploading}
        className="w-full h-10 rounded-lg bg-emerald-700 text-white text-xs font-extrabold disabled:cursor-not-allowed disabled:opacity-40 hover:bg-emerald-800 transition"
      >
        {uploading ? 'Subiendo a R2…' : 'Subir imagen'}
      </button>

      {message && <p className={`text-[11px] font-semibold ${error ? 'text-red-700' : 'text-emerald-800'}`}>{message}</p>}
    </section>
  );
}
