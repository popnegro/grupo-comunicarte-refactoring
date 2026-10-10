import { ArrowUpRight, Mail, MapPin } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/5492616706710';
const CONTACT_EMAIL = 'ventas@grupocomunicarte.com.ar';

export default function ComingSoon() {
  return (
    <main
      className="relative flex min-h-screen flex-col overflow-hidden bg-neutral-950 text-white"
      aria-labelledby="coming-soon-title"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-40 h-[32rem] w-[32rem] rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -bottom-48 -left-32 h-[30rem] w-[30rem] rounded-full bg-white/[0.04] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-7 sm:px-10 lg:px-12">
        <a href="/" aria-label="Grupo Comunicarte, inicio" className="inline-flex items-center">
          <img
            src="/brand/brand-light.svg"
            alt="Grupo Comunicarte"
            className="h-auto w-44 sm:w-52"
          />
        </a>
        <span className="hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/55 sm:inline-flex">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Estamos preparando algo nuevo
        </span>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pb-20 pt-12 sm:px-10 lg:px-12">
        <div className="max-w-4xl">
          <p className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300 sm:text-sm">
            <span className="h-px w-10 bg-emerald-300" />
            Grupo Comunicarte · Publicidad exterior
          </p>

          <h1
            id="coming-soon-title"
            className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-7xl lg:text-8xl"
          >
            Tu marca,
            <br />
            <span className="text-white/45">en movimiento.</span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-white/65 sm:text-xl">
            Estamos renovando nuestro sitio para mostrarte nuevas formas de conectar
            marcas con personas en Mendoza, Buenos Aires y más allá.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-white px-7 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            >
              Hablemos de tu campaña
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/20 px-7 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            >
              <Mail aria-hidden="true" className="h-4 w-4" />
              Escribinos por email
            </a>
          </div>
        </div>

        <div className="mt-20 grid gap-6 border-t border-white/15 pt-7 sm:grid-cols-2 sm:items-end">
          <div className="flex items-start gap-3 text-sm leading-6 text-white/55">
            <MapPin aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
            <span>9 de Julio 891 · Godoy Cruz, Mendoza, Argentina</span>
          </div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 text-sm text-white/65 transition hover:text-white sm:justify-self-end"
          >
            {CONTACT_EMAIL}
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-5 sm:px-10 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Grupo Comunicarte</span>
          <span>Publicidad en vía pública · Soportes tradicionales y digitales</span>
        </div>
      </footer>
    </main>
  );
}
