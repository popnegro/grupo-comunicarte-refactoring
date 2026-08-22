import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { buttonStyles } from '../../components/ui/Button';

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
      const res = await fetch('/api/admin/login', {
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
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-600">Portal administrativo</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
            Grupo Comunicarte
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresa a tu cuenta para gestionar el inventario y solicitudes.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Usuario / Correo
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-medium outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                placeholder="admin"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-medium outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={buttonStyles({ size: "lg", className: "mt-4 w-full justify-center bg-primary text-primary-foreground hover:bg-gray-800" })}
            >
              {loading ? 'Ingresando...' : (
                <>
                  <LogIn className="mr-2 w-4 h-4" />
                  Iniciar sesión
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-xs font-medium text-muted-foreground">
          &copy; {new Date().getFullYear()} Grupo Comunicarte.
        </p>
      </div>
    </div>
  );
}
