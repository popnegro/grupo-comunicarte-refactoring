import { Link, useNavigate } from 'react-router-dom';
import { Button, buttonStyles } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ArrowRight, MapPin, MonitorPlay, MoveRight, Search } from 'lucide-react';
import { fixedLocations, mobileRoutes } from '../data/inventory';
import { InventoryItem, getDisponibilidad } from '../types';
import { cn } from '../lib/utils';

export default function Home() {
  const navigate = useNavigate();

  const allItems: InventoryItem[] = [...fixedLocations, ...mobileRoutes];
  const featuredItems = allItems.filter(item => item.isFeatured || (item as any).IsFeatured).slice(0, 9);

  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION: viewport height minus the 5rem navbar. */}
      <section className="relative h-[calc(100vh-5rem)] min-h-0 w-full overflow-hidden border-b border-gray-100 flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="/images/home.webp" alt="Vía Pública" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/35" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-28 md:pt-16 md:pb-32">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center px-2.5 py-1 mb-5 rounded-full bg-white border border-gray-200">
              <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-800">
                Espacios Publicitarios Premium
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.02] mb-5 max-w-3xl mx-auto">
              Tu marca, en los lugares que todos ven.
            </h1>

            <p className="mx-auto max-w-xl text-base md:text-lg text-white/90 leading-relaxed">
              Espacios publicitarios estratégicos en Mendoza y Buenos Aires.
            </p>
          </div>

          <div className="absolute left-4 right-4 bottom-16 md:bottom-[68px] md:left-1/2 md:right-auto md:-translate-x-1/2 w-auto md:w-[min(760px,calc(100%-3rem))]">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const query = new FormData(event.currentTarget).get('q')?.toString().trim();
                navigate(query ? `/inventario?q=${encodeURIComponent(query)}` : '/inventario');
              }}
              className="rounded-xl bg-white border border-gray-200 shadow-lg p-1.5"
            >
              <div className="flex gap-1.5 items-stretch">
                <label className="flex min-h-12 flex-1 items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3.5 focus-within:border-black focus-within:ring-1 focus-within:ring-black/10">
                  <Search className="w-4 h-4 shrink-0 text-gray-500" aria-hidden="true" />
                  <span className="sr-only">Buscar soportes</span>
                  <input
                    name="q"
                    type="search"
                    autoComplete="off"
                    placeholder="Buscá por ubicación, soporte o ciudad"
                    className="min-w-0 w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                  />
                </label>
                <Button type="submit" size="lg" className="min-h-12 rounded-lg px-5 text-sm whitespace-nowrap">
                  Buscar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <h2 className="text-[11px] sm:text-xs font-semibold tracking-[0.14em] uppercase text-gray-700 text-center">
              Vía pública que conecta marcas con audiencias
            </h2>
          </div>
        </div>
      </section>

      {/* PLAZAS SECTION: inspired by Shadcn Space CTA 11, adapted to the site's neutral visual system. */}
      <section id="plazas" className="bg-white px-4 sm:px-6 lg:px-8 py-14 md:py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="grid md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="relative min-h-[280px] md:min-h-[420px] bg-gray-100 overflow-hidden">
                <img
                  src="/images/soportes-tradicionales-mendoza.webp"
                  alt="Soportes publicitarios en Mendoza"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-800">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  Cobertura nacional
                </div>
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-10 md:p-12 lg:p-14">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-800">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Plazas disponibles</span>
                </div>

                <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-gray-950 md:text-4xl">
                  Elegí dónde querés estar
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg">
                  Explorá nuestra cobertura y encontrá soportes estratégicos según la ciudad y el alcance de tu campaña.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                  <button
                    onClick={() => navigate('/inventario?plaza=mendoza')}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-4 text-left transition-colors hover:border-gray-900 hover:bg-gray-50"
                  >
                    <span>
                      <span className="block text-base font-semibold text-gray-950">Mendoza</span>
                      <span className="mt-1 block text-xs leading-relaxed text-gray-500">18 soportes estratégicos</span>
                    </span>
                    <MoveRight className="h-4 w-4 shrink-0 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-gray-950" aria-hidden="true" />
                  </button>

                  <button
                    onClick={() => navigate('/inventario?plaza=buenos-aires')}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-4 text-left transition-colors hover:border-gray-900 hover:bg-gray-50"
                  >
                    <span>
                      <span className="block text-base font-semibold text-gray-950">Buenos Aires</span>
                      <span className="mt-1 block text-xs leading-relaxed text-gray-500">10 soportes estratégicos</span>
                    </span>
                    <MoveRight className="h-4 w-4 shrink-0 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-gray-950" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DESTACADOS SECTION */}
      {featuredItems.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-gray-100">
          <div className="mb-12 flex justify-between items-end">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Soportes destacados</h2>
              <p className="text-gray-600 text-lg">Descubrí las ubicaciones premium con mayor impacto visual.</p>
            </div>
            <Link to="/inventario" className="hidden md:flex items-center text-sm font-semibold tracking-wide uppercase gap-2 hover:gap-3 transition-all">Ver inventario completo <MoveRight className="w-4 h-4" /></Link>
          </div>
          <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 snap-x snap-mandatory scrollbar-hide gap-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {featuredItems.map(item => {
              const isReservado = getDisponibilidad(item) === 'reservado';
              return (
                <div key={item.canonical_id} className="w-[85vw] sm:w-[45vw] md:w-[30vw] flex-shrink-0 snap-start group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  {item.imageUrls && item.imageUrls.length > 0 ? (
                    <div className="w-full h-48 bg-gray-100 overflow-hidden relative"><img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /><div className="absolute inset-0 border-b border-black/5 mix-blend-multiply"></div></div>
                  ) : (
                    <div className="w-full h-48 bg-gray-50 flex items-center justify-center border-b border-gray-100"><MapPin className="w-8 h-8 text-gray-300" /></div>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-3"><Badge variant={item.tipo_soporte === 'tradicional' ? 'neutral' : item.tipo_soporte === 'led' ? 'red' : 'dark'} className="uppercase text-[10px]">{item.tipo_soporte.replace('_', ' ')}</Badge><Badge variant={isReservado ? 'outline' : 'green'} className="uppercase text-[10px]">{isReservado ? 'Reservado' : 'Disponible'}</Badge></div>
                    <h3 className="text-xl font-bold mb-2 line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{'address' in item ? item.address : item.description}</p>
                    {isReservado && item.availableFrom && <p className="mt-auto mb-4 text-xs text-gray-500 font-medium">Disponible desde <span className="text-gray-900">{item.availableFrom}</span></p>}
                    <Button onClick={() => navigate(`/inventario?plaza=${item.ciudad}&tipo=${item.tipo_soporte}&soporte=${item.canonical_id}`)} variant="outline" className={cn("w-full", (!isReservado || !item.availableFrom) ? "mt-auto" : "")}>{isReservado ? 'Consultar disponibilidad' : 'Ver detalle'}</Button>
                  </div>
                </div>
              )
            })}
          </div>
          <Link to="/inventario" className="mt-8 md:hidden flex justify-center items-center text-sm font-semibold tracking-wide uppercase gap-2 hover:gap-3 transition-all">Ver inventario completo <MoveRight className="w-4 h-4" /></Link>
        </section>
      )}

      {/* LED MÓVIL SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-black text-white rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/10 border border-white/20"><MonitorPlay className="w-4 h-4" /><span className="text-xs font-semibold tracking-widest uppercase">Innovación Dinámica</span></div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">Tu mensaje también puede moverse.</h2>
            <div className="space-y-4 mb-10 text-gray-300"><p className="flex items-center gap-3"><span className="font-semibold text-white">LED Móvil Mendoza</span></p><p className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>Lunes a Viernes</p><p className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>09:00–20:00</p><p className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>Duración del recorrido: 4 horas</p></div>
            <Button onClick={() => navigate('/inventario?tipo=led_movil')} variant="secondary" className="bg-white text-black hover:bg-gray-100">Ver recorrido <ArrowRight className="w-4 h-4" /></Button>
          </div>
          <div className="w-full md:w-1/3 aspect-square bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center relative"><div className="absolute inset-0 flex items-center justify-center opacity-20"><svg viewBox="0 0 100 100" className="w-full h-full stroke-white fill-none" strokeWidth="1" strokeDasharray="4 4"><path d="M10,90 Q30,10 50,50 T90,10" /></svg></div><MonitorPlay className="w-24 h-24 text-white/50" /></div>
        </div>
      </section>

      {/* FINAL CTA: inspired by Shadcn Space CTA 01, adapted to the site's neutral visual system. */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-20 md:pt-12 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden min-h-[320px] md:min-h-[360px] flex items-center justify-center px-6 py-12 md:px-12 md:py-16 rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto text-center">
              <div className="flex flex-col items-center gap-3">
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight text-gray-950">
                  Encontrá el soporte adecuado para tu marca
                </h2>
                <p className="max-w-xl mx-auto text-base md:text-lg leading-relaxed text-gray-600">
                  Explorá nuestra cobertura y descubrí dónde están los soportes que mejor encajan con tu campaña.
                </p>
              </div>
              <Link
                to="/inventario"
                className={cn(
                  buttonStyles({ size: 'lg' }),
                  'group relative h-12 w-fit overflow-hidden rounded-full pl-6 pr-14 text-sm font-medium transition-all duration-300 hover:pl-14 hover:pr-6'
                )}
              >
                <span className="relative z-10 transition-all duration-300">Explorar inventario</span>
                <span className="absolute right-1 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-950 transition-all duration-300 group-hover:right-[calc(100%-44px)] group-hover:rotate-45">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
