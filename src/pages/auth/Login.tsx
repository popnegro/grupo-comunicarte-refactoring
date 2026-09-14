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
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Credenciales inválidas. Verifique usuario y contraseña.');
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
    <div className="relative flex min-h-screen items-center justify-center bg-[#F9F9F9] px-4 py-10">
      <button
        type="button"
        onClick={() => navigate('/')}
        aria-label="Volver al sitio público"
        className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-950 sm:left-8 sm:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Sitio público</span>
      </button>

      <div className="relative w-full max-w-md">
        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Portal administrativo</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Grupo Comunicarte</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">Centro de operaciones para inventario, disponibilidad y solicitudes comerciales.</p>
        </div>

        <div className="border border-gray-200 bg-white p-6 sm:p-7">
          <div className="mb-5 border-b border-gray-100 pb-4">
            <p className="text-sm font-bold text-gray-950">Iniciar sesión</p>
            <p className="mt-1 text-xs text-gray-500">Ingrese sus credenciales autorizadas.</p>
          </div>

          {error && (
            <div id="login-error-alert" role="alert" aria-live="assertive" className="mb-5 flex items-start gap-3 border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="username" className="mb-1.5 block text-xs font-bold text-gray-700">Usuario / Correo Electrónico</label>
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
                className={`h-10 w-full rounded-lg border px-3 text-sm font-medium text-gray-950 outline-none transition focus:bg-white focus:ring-2 ${error ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 bg-gray-50/50 focus:border-gray-900 focus:ring-gray-900/10'}`}
                placeholder="admin"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-gray-700">Contraseña</label>
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
                  className={`h-10 w-full rounded-lg border pl-3 pr-10 text-sm font-medium text-gray-950 outline-none transition focus:bg-white focus:ring-2 ${error ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 bg-gray-50/50 focus:border-gray-900 focus:ring-gray-900/10'}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} aria-busy={loading} className={buttonStyles({ size: 'lg', className: 'mt-2 h-10 w-full justify-center rounded-lg bg-gray-950 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60' })}>
              {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Validando acceso...</span> : <span className="inline-flex items-center gap-2"><LogIn className="h-4 w-4" />Iniciar sesión</span>}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs font-medium text-gray-500">© {new Date().getFullYear()} Grupo Comunicarte · Centro de Operaciones</p>
      </div>
    </div>
  );
}
