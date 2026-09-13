import { Link, useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { Button, buttonStyles } from '../components/ui/Button';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, MonitorPlay, MoveRight, Search } from 'lucide-react';
import { fixedLocations, mobileRoutes } from '../data/inventory';
import { InventoryItem } from '../types';
import { cn } from '../lib/utils';
import { SupportCard } from '../components/inventory/SupportCard';

export default function Home() {
  const navigate = useNavigate();
  const featuredCarouselRef = useRef<HTMLDivElement>(null);
  const allItems: InventoryItem[] = [...fixedLocations, ...mobileRoutes];
  const featuredItems = allItems.filter(item => item.isFeatured || (item as any).IsFeatured).slice(0, 9);

  const scrollFeatured = (direction: 'prev' | 'next') => {
    const container = featuredCarouselRef.current;
    if (!container) return;
    const firstCard = container.querySelector<HTMLElement>('[data-featured-card]');
    const amount = firstCard ? firstCard.offsetWidth + 20 : container.clientWidth * 0.82;
    container.scrollBy({ left: direction === 'next' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <div className="flex w-full flex-col">
      <section className="relative flex h-[calc(100vh-5rem)] min-h-0 w-full items-center overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 z-0">
          <img src="/images/home.webp" alt="Vía Pública" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/35" />
        </div>

        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-2xl -translate-y-6 text-center text-white md:-translate-y-8">
            <div className="mb-5 inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-800">Espacios Publicitarios Premium</span>
            </div>
            <h1 className="mx-auto mb-4 max-w-2xl text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl md:text-[3.5rem]">
              Tu marca, en los lugares que todos ven.
            </h1>
            <p className="mx-auto max-w-lg text-base leading-7 text-white/90 md:text-lg md:leading-7">
              Espacios publicitarios estratégicos en Mendoza y Buenos Aires.
            </p>
          </div>

          <div className="absolute bottom-8 left-4 right-4 md:bottom-10 md:left-1/2 md:right-auto md:w-[min(700px,calc(100%-3rem))] md:-translate-x-1/2">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const query = new FormData(event.currentTarget).get('q')?.toString().trim();
                navigate(query ? `/inventario?q=${encodeURIComponent(query)}` : '/inventario');
              }}
              className="rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
            >
              <div className="flex items-stretch gap-1.5">
                <label className="flex min-h-12 flex-1 items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3.5 focus-within:border-black focus-within:ring-1 focus-within:ring-black/10">
                  <Search className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
                  <span className="sr-only">Buscar soportes</span>
                  <input name="q" type="search" autoComplete="off" placeholder="Buscá por ubicación, soporte o ciudad" className="min-w-0 w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400" />
                </label>
                <Button type="submit" size="lg" className="min-h-12 whitespace-nowrap rounded-lg px-5 text-sm">
                  Buscar <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
            <h2 className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-700 sm:text-xs">
              Vía pública que conecta marcas con audiencias
            </h2>
          </div>
        </div>
      </section>

      <section id="plazas" className="border-b border-gray-100 bg-white px-4 py-14 sm:px-6 md:py-18 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="grid md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="relative min-h-[280px] overflow-hidden bg-gray-100 md:min-h-[400px]">
                <img src="/images/soportes-tradicionales-mendoza.webp" alt="Soportes publicitarios en Mendoza" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-800">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  Cobertura nacional
                </div>
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-9 md:p-11 lg:p-12">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-800">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500">Plazas disponibles</span>
                </div>
                <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-gray-950 md:text-4xl">Elegí dónde querés estar</h2>
                <p className="mt-3 max-w-xl text-base leading-7 text-gray-600 md:text-lg md:leading-7">
                  Explorá nuestra cobertura y encontrá soportes estratégicos según la ciudad y el alcance de tu campaña.
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                  <button onClick={() => navigate('/inventario?plaza=mendoza')} className="group flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3.5 text-left transition-colors hover:border-gray-900 hover:bg-gray-50">
                    <span>
                      <span className="block text-base font-semibold text-gray-950">Mendoza</span>
                      <span className="mt-1 block text-xs leading-5 text-gray-500">18 soportes estratégicos</span>
                    </span>
                    <MoveRight className="h-4 w-4 shrink-0 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-gray-950" aria-hidden="true" />
                  </button>
                  <button onClick={() => navigate('/inventario?plaza=buenos-aires')} className="group flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3.5 text-left transition-colors hover:border-gray-900 hover:bg-gray-50">
                    <span>
                      <span className="block text-base font-semibold text-gray-950">Buenos Aires</span>
                      <span className="mt-1 block text-xs leading-5 text-gray-500">10 soportes estratégicos</span>
                    </span>
                    <MoveRight className="h-4 w-4 shrink-0 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-gray-950" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {featuredItems.length > 0 && (
        <section className="border-b border-gray-100 bg-gray-50 py-14 md:py-18">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-px w-8 bg-gray-900" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Inventario seleccionado</span>
                </div>
                <h2 className="text-3xl font-semibold leading-tight tracking-tight text-gray-950 md:text-4xl">Soportes destacados</h2>
                <p className="mt-2.5 max-w-xl text-base leading-7 text-gray-600 md:text-lg md:leading-7">
                  Una selección de ubicaciones con información real de disponibilidad, formato y características.
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 md:shrink-0">
                <Link to="/inventario" className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-gray-700 hover:text-gray-950 sm:inline-flex">
                  Ver inventario completo <MoveRight className="h-4 w-4" />
                </Link>
                <div className="flex items-center gap-2" aria-label="Controles de soportes destacados">
                  <button type="button" onClick={() => scrollFeatured('prev')} aria-label="Soportes anteriores" className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition-colors hover:border-gray-950 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-950/15">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => scrollFeatured('next')} aria-label="Soportes siguientes" className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition-colors hover:border-gray-950 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-950/15">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div ref={featuredCarouselRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ touchAction: 'pan-x' }} aria-label="Carrusel de soportes destacados">
              {featuredItems.map((item) => (
                <div key={item.canonical_id} data-featured-card className="w-[calc(100vw-2rem)] max-w-[390px] flex-none snap-start sm:w-[min(390px,68vw)] lg:w-[380px]">
                  <SupportCard item={item} variant="showcase" />
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-2 flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <p className="text-[11px] font-medium leading-5 text-gray-500">Deslizá horizontalmente para explorar</p>
            <Link to="/inventario" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-700 sm:hidden">
              Ver todo <MoveRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      <section className="w-full bg-white py-14 md:py-18">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-50">
            <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
              <div className="relative min-h-[340px] overflow-hidden lg:min-h-[460px]">
                <img src="/images/led-movil-feature.webp" alt="Camión LED Móvil recorriendo Mendoza" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute left-5 top-5 rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-900">LED Móvil · Mendoza</div>
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="max-w-md rounded-2xl border border-white/20 bg-white/95 p-4 shadow-sm">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">Recorrido predeterminado</div>
                    <div className="mt-1.5 text-sm font-medium leading-6 text-gray-900">Mendoza Plaza Shopping · Nudo Vial · Arístides · Portones · Km Cero · Casa de Gobierno · Chacras · Palmares · Carrodilla</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-9 md:p-11 lg:p-12">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-800">
                    <MonitorPlay className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Innovación dinámica</span>
                </div>
                <h2 className="mt-4 max-w-lg text-3xl font-semibold leading-[1.08] tracking-tight text-gray-950 sm:text-4xl md:text-5xl">LED Móvil Mendoza</h2>
                <p className="mt-3.5 max-w-lg text-base leading-7 text-gray-600 md:text-lg md:leading-7">
                  Llevá tu campaña por los principales puntos del Gran Mendoza con tres pantallas digitales de alta resolución y un recorrido flexible.
                </p>
                <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200">
                  <div className="bg-white p-3.5"><div className="text-2xl font-semibold leading-none tracking-tight text-gray-950">3</div><div className="mt-1.5 text-xs leading-5 text-gray-500">pantallas digitales</div></div>
                  <div className="bg-white p-3.5"><div className="text-2xl font-semibold leading-none tracking-tight text-gray-950">180+</div><div className="mt-1.5 text-xs leading-5 text-gray-500">salidas diarias</div></div>
                  <div className="bg-white p-3.5"><div className="text-2xl font-semibold leading-none tracking-tight text-gray-950">4 h</div><div className="mt-1.5 text-xs leading-5 text-gray-500">por recorrido</div></div>
                  <div className="bg-white p-3.5"><div className="text-2xl font-semibold leading-none tracking-tight text-gray-950">10 s</div><div className="mt-1.5 text-xs leading-5 text-gray-500">duración del spot</div></div>
                </div>
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-200 pt-4 text-xs leading-5 text-gray-500">
                  <span><strong className="font-semibold text-gray-700">Lun–Vie</strong> · 09:00–20:00</span>
                  <span>MP4 · AVI · JPG</span>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3.5">
                  <Button onClick={() => navigate('/inventario?tipo=led_movil')} className={cn(buttonStyles('primary'), 'px-5')}>
                    Ver recorrido <ArrowRight className="h-4 w-4" />
                  </Button>
                  <span className="text-xs leading-5 text-gray-500">Recorridos personalizados disponibles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 pt-6 sm:px-6 md:pb-20 md:pt-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 via-white to-gray-100 px-6 py-10 md:min-h-[330px] md:px-12 md:py-14">
            <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
              <div className="flex flex-col items-center gap-2.5">
                <h2 className="text-3xl font-semibold leading-[1.1] tracking-tight text-gray-950 md:text-5xl">Encontrá el soporte adecuado para tu marca</h2>
                <p className="mx-auto max-w-xl text-base leading-7 text-gray-600 md:text-lg md:leading-7">
                  Explorá nuestra cobertura y descubrí dónde están los soportes que mejor encajan con tu campaña.
                </p>
              </div>
              <Link to="/inventario" className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800">
                Explorar inventario <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
