import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { buttonStyles } from '../../components/ui/Button';
import { apiFetch } from '../../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

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
        throw new Error(data.message || 'Credenciales inválidas. Verifique usuario y contraseña.');
      }

      localStorage.setItem('admin_token', data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      usernameInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-100/80 px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      <button
        type="button"
        onClick={() => navigate('/')}
        aria-label="Volver al sitio público"
        className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-950 sm:left-8 sm:top-8 focus:outline-none focus:ring-2 focus:ring-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Sitio público</span>
      </button>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950 text-white shadow-lg">
            <span className="text-sm font-extrabold tracking-tight">GC</span>
          </div>
          <span className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-gray-800 shadow-sm">
            Portal Administrativo
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
            Grupo Comunicarte
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-600">
            Centro de operaciones para gestión de inventario, disponibilidad y solicitudes comerciales.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <p className="text-sm font-bold text-gray-950">Acceso Seguro</p>
              <p className="text-xs text-gray-500">Ingrese sus credenciales autorizadas</p>
            </div>
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" title="Sistema Seguro" />
          </div>

          {error && (
            <div
              id="login-error-alert"
              role="alert"
              aria-live="assertive"
              className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 animate-in fade-in"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Usuario / Correo Electrónico
              </label>
              <input
                ref={usernameInputRef}
                id="username"
                type="text"
                required
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'login-error-alert' : undefined}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`h-11 w-full rounded-xl border px-3.5 text-sm font-medium text-gray-950 transition outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 ${
                  error
                    ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-200 bg-gray-50/50 focus:border-gray-900 focus:ring-gray-900/10'
                }`}
                placeholder="admin"
                autoComplete="username"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  aria-required="true"
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? 'login-error-alert' : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-11 w-full rounded-xl border pl-3.5 pr-11 text-sm font-medium text-gray-950 transition outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 ${
                    error
                      ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 bg-gray-50/50 focus:border-gray-900 focus:ring-gray-900/10'
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className={buttonStyles({
                size: 'lg',
                className:
                  'mt-2 h-11 w-full justify-center rounded-xl bg-gray-950 text-white font-semibold shadow-md transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60',
              })}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando acceso...</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Iniciar sesión</span>
                </span>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs font-medium text-gray-500">
          © {new Date().getFullYear()} Grupo Comunicarte · Centro de Operaciones
        </p>
      </div>
    </div>
  );
}
