import { Link, useNavigate } from 'react-router-dom';
import { Button, buttonStyles } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ArrowRight, MapPin, MonitorPlay, MoveRight } from 'lucide-react';
import { fixedLocations, mobileRoutes } from '../data/inventory';
import { InventoryItem, getDisponibilidad } from '../types';
import { cn } from '../lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const allItems: InventoryItem[] = [...fixedLocations, ...mobileRoutes];
  const featuredItems = allItems.filter(item => item.isFeatured || (item as any).IsFeatured).slice(0, 9);

  return (
    <div className="flex flex-col w-full bg-white">
      <section className="relative min-h-[680px] md:min-h-[760px] w-full flex items-center overflow-hidden bg-gray-950">
        <div className="absolute inset-0 z-0">
          <img src="/images/home.webp" alt="Publicidad exterior en vía pública" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-28">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-7 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase">Espacios Publicitarios Premium</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-bold tracking-[-0.04em] text-white max-w-4xl leading-[0.98] mb-8">
              Tu marca, en los lugares <span className="text-white/65">que todos ven.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed">
              Espacios publicitarios estratégicos en Mendoza y Buenos Aires para generar presencia, alcance y recordación.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link to="/contacto" className={buttonStyles({ size: 'lg', className: 'text-base rounded-full px-7 bg-white text-gray-950 hover:bg-gray-100' })}>
                Hablar con el equipo <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/inventario" className={buttonStyles({ variant: 'outline', size: 'lg', className: 'text-base rounded-full px-7 border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent' })}>
                Explorar inventario
              </Link>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap gap-x-8 gap-y-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            <span>Mendoza</span><span className="text-white/25">•</span><span>Buenos Aires</span><span className="text-white/25">•</span><span>OOH + DOOH</span>
          </div>
        </div>
      </section>

      <section id="plazas" className="bg-[#F9F9F9] py-24 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div><p className="text-eyebrow mb-3">Presencia estratégica</p><h2 className="text-section-title text-3xl md:text-4xl">Elegí dónde querés estar</h2></div>
            <p className="text-gray-500 text-base md:max-w-md md:text-right leading-relaxed">Cobertura en puntos de alto tránsito para construir presencia donde importa.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[{ city: 'Mendoza', count: 'Soportes disponibles', detail: 'Tradicionales, LED y circuitos móviles.', query: 'mendoza' }, { city: 'Buenos Aires', count: 'Soportes disponibles', detail: 'Ubicaciones de alto tránsito vehicular y peatonal.', query: 'buenos-aires' }].map((plaza) => (
              <button key={plaza.city} onClick={() => navigate(`/inventario?plaza=${plaza.query}`)} className="group relative text-left bg-white p-8 md:p-10 rounded-3xl border border-gray-200 hover:border-gray-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between gap-6"><div className="w-12 h-12 bg-gray-950 text-white rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors"><MapPin className="w-5 h-5" /></div><MoveRight className="w-5 h-5 text-gray-300 group-hover:text-gray-950 group-hover:translate-x-1 transition-all" /></div>
                <div className="mt-14"><p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600 mb-2">{plaza.count}</p><h3 className="text-3xl font-bold tracking-tight mb-3">{plaza.city}</h3><p className="text-gray-500 leading-relaxed">{plaza.detail}</p></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {featuredItems.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-5">
            <div><p className="text-eyebrow mb-3">Selección premium</p><h2 className="text-section-title text-3xl md:text-4xl mb-3">Soportes destacados</h2><p className="text-gray-500 text-base">Ubicaciones con alto potencial de impacto visual.</p></div>
            <Link to="/inventario" className="hidden md:flex items-center text-sm font-bold uppercase tracking-wider gap-2 hover:gap-3 transition-all">Ver inventario completo <MoveRight className="w-4 h-4" /></Link>
          </div>
          <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 snap-x snap-mandatory scrollbar-hide gap-5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {featuredItems.map(item => {
              const isReservado = getDisponibilidad(item) === 'reservado';
              return <div key={item.canonical_id} className="w-[84vw] sm:w-[44vw] md:w-[31vw] lg:w-[30%] flex-shrink-0 snap-start group bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                {item.imageUrls?.length ? <div className="w-full h-52 bg-gray-100 overflow-hidden relative"><img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /><div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" /></div> : <div className="w-full h-52 bg-gray-50 flex items-center justify-center border-b border-gray-100"><MapPin className="w-8 h-8 text-gray-300" /></div>}
                <div className="p-6 flex flex-col flex-grow"><div className="flex items-center gap-2 mb-4"><Badge variant={item.tipo_soporte === 'tradicional' ? 'neutral' : item.tipo_soporte === 'led' ? 'red' : 'dark'} className="uppercase text-[10px]">{item.tipo_soporte.replace('_', ' ')}</Badge><Badge variant={isReservado ? 'outline' : 'green'} className="uppercase text-[10px]">{isReservado ? 'Reservado' : 'Disponible'}</Badge></div><h3 className="text-xl font-bold mb-2 line-clamp-1">{item.name}</h3><p className="text-sm text-gray-500 mb-5 line-clamp-2 leading-relaxed">{'address' in item ? item.address : item.description}</p>{isReservado && item.availableFrom && <p className="mt-auto mb-4 text-xs text-gray-500 font-medium">Disponible desde <span className="text-gray-900">{item.availableFrom}</span></p>}<Button onClick={() => navigate(`/inventario?plaza=${item.ciudad}&tipo=${item.tipo_soporte}&soporte=${item.canonical_id}`)} variant="outline" className={cn('w-full rounded-xl', (!isReservado || !item.availableFrom) ? 'mt-auto' : '')}>{isReservado ? 'Consultar disponibilidad' : 'Ver detalle'}</Button></div>
              </div>;
            })}
          </div>
          <Link to="/inventario" className="mt-6 md:hidden flex justify-center items-center text-sm font-bold uppercase tracking-wider gap-2">Ver inventario completo <MoveRight className="w-4 h-4" /></Link>
        </section>
      )}

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-white/10 border border-white/10"><MonitorPlay className="w-4 h-4" /><span className="text-[11px] font-bold tracking-[0.16em] uppercase">Innovación dinámica</span></div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.05]">Tu mensaje también puede moverse.</h2>
            <div className="space-y-3 mb-9 text-gray-300 text-sm md:text-base"><p className="font-semibold text-white">LED Móvil Mendoza</p><p>Lunes a Viernes · 09:00–20:00</p><p>Duración del recorrido: 4 horas</p></div>
            <Button onClick={() => navigate('/inventario?tipo=led_movil')} variant="secondary" className="bg-white text-black hover:bg-gray-100 rounded-full px-6">Ver recorrido <ArrowRight className="w-4 h-4" /></Button>
          </div>
          <div className="w-full md:w-[420px] aspect-[4/3] rounded-3xl border border-white/10 overflow-hidden bg-black/20 shrink-0">
            <img src="/images/led-movil-feature.webp" alt="Camión LED Móvil de Grupo Comunicarte" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 text-center bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto"><p className="text-eyebrow mb-4">El próximo punto de contacto</p><h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">Encontrá el soporte adecuado para tu marca</h2><p className="text-gray-500 mb-9 max-w-2xl mx-auto leading-relaxed">Explorá nuestra cobertura y descubrí dónde tu próxima campaña puede generar mayor impacto.</p><Link to="/inventario" className={buttonStyles({ size: 'lg', className: 'text-base rounded-full px-7 inline-flex' })}>Explorar mapa</Link></div>
      </section>
    </div>
  );
}
