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
      {/* HERO SECTION */}
      <section className="relative min-h-[600px] md:min-h-[680px] w-full overflow-hidden border-b border-gray-100 flex items-center">
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

          {/* Search: compact discovery action inspired by the Hero 31 composition. */}
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

        {/* Plain semantic footer: no blur, gradient or decorative effect. */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <h2 className="text-[11px] sm:text-xs font-semibold tracking-[0.14em] uppercase text-gray-700 text-center">
              Vía pública que conecta marcas con audiencias
            </h2>
          </div>
        </div>
      </section>

      {/* PLAZAS SECTION */}
      <section id="plazas" className="bg-gray-50 py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Elegí dónde querés estar</h2>
            <p className="text-gray-600 text-lg">Explorá nuestra cobertura geográfica en puntos clave del país.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <button onClick={() => navigate('/inventario?plaza=mendoza')} className="group flex flex-col items-start text-left bg-white p-10 rounded-2xl border border-gray-200 hover:border-black transition-colors shadow-sm hover:shadow-md">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors"><MapPin className="w-6 h-6" /></div>
              <h3 className="text-2xl font-bold mb-2">Mendoza</h3>
              <p className="text-gray-500 mb-8">18 soportes estratégicos incluyendo tradicionales y LED.</p>
              <span className="flex items-center text-sm font-semibold tracking-wide uppercase mt-auto gap-2 group-hover:gap-3 transition-all">Ver plaza <MoveRight className="w-4 h-4" /></span>
            </button>
            <button onClick={() => navigate('/inventario?plaza=buenos-aires')} className="group flex flex-col items-start text-left bg-white p-10 rounded-2xl border border-gray-200 hover:border-black transition-colors shadow-sm hover:shadow-md">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors"><MapPin className="w-6 h-6" /></div>
              <h3 className="text-2xl font-bold mb-2">Buenos Aires</h3>
              <p className="text-gray-500 mb-8">10 soportes en ubicaciones de alto tránsito vehicular y peatonal.</p>
              <span className="flex items-center text-sm font-semibold tracking-wide uppercase mt-auto gap-2 group-hover:gap-3 transition-all">Ver plaza <MoveRight className="w-4 h-4" /></span>
            </button>
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-100 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Encontrá el soporte adecuado para tu marca</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Explorá nuestra cobertura geográfica y descubrí dónde están nuestros soportes.</p>
        <Link to="/inventario" className={buttonStyles({ size: "lg", className: "text-lg inline-flex" })}>Explorar mapa</Link>
      </section>
    </div>
  );
}
