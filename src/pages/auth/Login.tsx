import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, ArrowLeft } from 'lucide-react';
import { buttonStyles } from '../../components/ui/Button';
import { apiFetch } from '../../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Credenciales inválidas');
      }

      localStorage.setItem('admin_token', data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f5f2] px-4 py-12">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-lime-200/25 blur-3xl" />

      <button
        type="button"
        onClick={() => navigate('/')}
        className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-xs font-bold text-gray-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-gray-950 sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Sitio público
      </button>

      <div className="relative w-full max-w-md">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950 text-white shadow-xl shadow-gray-900/10">
            <span className="text-sm font-black tracking-tight">GC</span>
          </div>
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-800">
            Portal administrativo
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-gray-950 sm:text-4xl">
            Grupo Comunicarte
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
            Accede al centro de operaciones para gestionar inventario, disponibilidad y solicitudes comerciales.
          </p>
        </div>

        <div className="rounded-[28px] border border-black/10 bg-white/95 p-6 shadow-2xl shadow-gray-900/10 backdrop-blur sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <p className="text-xs font-bold text-gray-950">Acceso seguro</p>
              <p className="mt-0.5 text-[11px] text-gray-400">Credenciales de administrador</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.10)]" />
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-gray-500">
                Usuario / Correo
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                placeholder="admin"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-gray-500">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={buttonStyles({ size: 'lg', className: 'mt-2 h-12 w-full justify-center rounded-2xl bg-gray-950 text-white shadow-lg shadow-gray-950/10 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60' })}
            >
              {loading ? 'Ingresando...' : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar sesión
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-gray-400">
          © {new Date().getFullYear()} Grupo Comunicarte · Centro de Operaciones
        </p>
      </div>
    </div>
  );
}
