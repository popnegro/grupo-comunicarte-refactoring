import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { buttonStyles } from '../../components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Fake login
    setTimeout(() => {
      navigate('/dashboard');
    }, 800);
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
            Ingresa a tu cuenta para gestionar el inventario.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-medium outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                placeholder="admin@grupocomunicarte.com"
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
