import { ArrowRight, Check, MapPin, MessageCircle, MonitorPlay, Route, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const formats = [
  {
    icon: Route,
    eyebrow: 'OOH',
    title: 'Vía pública',
    description: 'Soportes tradicionales ubicados en puntos estratégicos para construir presencia y alcance.',
  },
  {
    icon: MonitorPlay,
    eyebrow: 'DOOH',
    title: 'Pantallas LED',
    description: 'Formatos digitales para campañas dinámicas, flexibles y de alto impacto visual.',
  },
  {
    icon: Sparkles,
    eyebrow: 'Móvil',
    title: 'LED Móvil',
    description: 'Circuitos móviles pensados para llevar tu campaña a donde está la audiencia.',
  },
];

const steps = [
  ['01', 'Definimos el objetivo', 'Entendemos qué querés comunicar, a quién y dónde necesitás ganar visibilidad.'],
  ['02', 'Elegimos los espacios', 'Exploramos formatos y ubicaciones para construir una propuesta alineada a tu campaña.'],
  ['03', 'Recibís tu Media Kit', 'Consolidamos la selección para que puedas evaluar y avanzar con tu equipo.'],
];

export default function Home() {
  return (
    <div className="min-h-full bg-[#F7F7F4] text-gray-950">
      <section className="relative overflow-hidden bg-[#0B3035] text-white">
        <div className="absolute inset-0">
          <img
            src="/images/home.webp"
            alt=""
            className="h-full w-full object-cover opacity-30"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B3035] via-[#0B3035]/95 to-[#0B3035]/65" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4BE0B2]" />
                Nueva plataforma · Próximamente
              </div>

              <h1 className="mt-7 max-w-2xl text-[clamp(2.65rem,6vw,5.35rem)] font-semibold leading-[0.94] tracking-[-0.045em]">
                Hacé que tu marca sea parte del paisaje.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                Inventario OOH y DOOH para campañas que necesitan visibilidad real.
                Explorá ubicaciones, elegí soportes y convertí tu selección en una propuesta comercial.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/contacto?origen=coming-soon"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#0B3035] transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[#0B3035]"
                >
                  Quiero una propuesta
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href="https://wa.me/542615830208"
                  target="_blank"
                  aria-label="Hablar con Grupo Comunicarte por WhatsApp"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Hablar por WhatsApp
                </a>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-white/60">
                <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#4BE0B2]" /> Mendoza</span>
                <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#4BE0B2]" /> Buenos Aires</span>
                <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#4BE0B2]" /> OOH + DOOH</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur-sm">
                <img
                  src="/images/home.webp"
                  alt="Espacio publicitario en vía pública"
                  className="aspect-[4/5] w-full rounded-[1.15rem] object-cover"
                />
                <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/20 bg-[#0B3035]/90 p-4 backdrop-blur-md sm:inset-x-7 sm:bottom-7 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Propuesta comercial</p>
                      <p className="mt-1 text-sm font-semibold text-white">Del objetivo al soporte indicado.</p>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4BE0B2] text-[#0B3035]">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-3 hidden rounded-xl border border-white/20 bg-white px-4 py-3 text-[#0B3035] shadow-xl sm:block lg:-left-8">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-400">Cobertura</p>
                <p className="mt-0.5 text-sm font-bold">Mendoza · Buenos Aires</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-px bg-gray-200 sm:grid-cols-3">
          {[
            ['Inventario', 'OOH y DOOH en un solo lugar.'],
            ['Selección', 'Elegí ubicaciones según tu objetivo.'],
            ['Media Kit', 'Llevá tu selección a una propuesta.'],
          ].map(([title, description]) => (
            <div key={title} className="bg-white px-5 py-6 sm:px-7">
              <p className="text-sm font-bold text-gray-950">{title}</p>
              <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">Qué hacemos</p>
            <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              Presencia que empieza antes de contratar.
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-gray-600">
              La nueva experiencia de Grupo Comunicarte está pensada para que pasar de una necesidad de comunicación a una selección concreta sea simple.
            </p>
          </div>

          <div className="grid gap-3">
            {formats.map(({ icon: Icon, eyebrow, title, description }) => (
              <article key={title} className="group rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg sm:p-6">
                <div className="flex gap-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E9F5F1] text-[#0B5C5C]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">{eyebrow}</p>
                    <h3 className="mt-1 text-lg font-semibold text-gray-950">{title}</h3>
                    <p className="mt-1.5 max-w-xl text-sm leading-6 text-gray-600">{description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-[#F0F3F1]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">Una experiencia comercial más simple</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Tres pasos. Una decisión más clara.</h2>
          </div>

          <div className="mt-10 grid gap-0 border-y border-gray-300 md:grid-cols-3">
            {steps.map(([number, title, description]) => (
              <article key={number} className="border-b border-gray-300 py-7 last:border-b-0 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
                <span className="text-xs font-bold tracking-[0.14em] text-[#0B5C5C]">{number}</span>
                <h3 className="mt-3 text-lg font-semibold text-gray-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[1.5rem] bg-[#0B3035] px-6 py-12 text-white shadow-xl sm:px-10 md:px-14 md:py-14">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8EDCC7]">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                Mendoza · Buenos Aires
              </div>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                La plataforma está llegando. Tu próxima campaña puede empezar hoy.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/65">
                Dejanos tu necesidad comercial y nuestro equipo puede ayudarte a definir el próximo paso.
              </p>
            </div>

            <Link
              to="/contacto?origen=coming-soon"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#0B3035] transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[#0B3035]"
            >
              Hablemos de tu campaña
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
