import { Link, useNavigate } from 'react-router-dom';
import { Button, buttonStyles } from '../components/ui/Button';
import { ArrowRight, MapPin, MonitorPlay, MoveRight } from 'lucide-react';
import { InventoryItem } from '../types';
import { useInventory } from '../hooks/useInventory';
import { SupportCard } from '../components/inventory/SupportCard';

export default function Home() {
  const navigate = useNavigate();
  const { items: inventoryItems, loading: inventoryLoading } = useInventory();
  const allItems: InventoryItem[] = inventoryItems;
  const featuredItems = allItems.filter(item => item.isFeatured).slice(0, 9);

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
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-bold tracking-[-0.04em] text-white max-w-4xl leading-[0.98] mb-8">Tu marca, en los lugares <span className="text-white/65">que todos ven.</span></h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed">Espacios publicitarios estratégicos en Mendoza y Buenos Aires para generar presencia, alcance y recordación.</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link to="/contacto" className={buttonStyles({ size: 'lg', className: 'text-base rounded-full px-7 bg-white text-gray-950 hover:bg-gray-100' })}>Hablar con el equipo <ArrowRight className="w-5 h-5" /></Link>
              <Link to="/inventario" className={buttonStyles({ variant: 'outline', size: 'lg', className: 'text-base rounded-full px-7 border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent' })}>Explorar inventario</Link>
            </div>
          </div>
          <div className="mt-16 flex flex-wrap gap-x-8 gap-y-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/60"><span>Mendoza</span><span className="text-white/25">•</span><span>Buenos Aires</span><span className="text-white/25">•</span><span>OOH + DOOH</span></div>
        </div>
      </section>

      <section id="plazas" className="bg-[#F9F9F9] py-24 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14"><div><p className="text-eyebrow mb-3">Presencia estratégica</p><h2 className="text-section-title text-3xl md:text-4xl">Elegí dónde querés estar</h2></div><p className="text-gray-500 text-base md:max-w-md md:text-right leading-relaxed">Cobertura en puntos de alto tránsito para construir presencia donde importa.</p></div>
          <div className="grid md:grid-cols-2 gap-5">{[{ city: 'Mendoza', count: 'Soportes disponibles', detail: 'Tradicionales, LED y circuitos móviles.', query: 'mendoza' }, { city: 'Buenos Aires', count: 'Soportes disponibles', detail: 'Ubicaciones de alto tránsito vehicular y peatonal.', query: 'buenos-aires' }].map((plaza) => (
            <button key={plaza.city} onClick={() => navigate(`/inventario?plaza=${plaza.query}`)} className="group relative text-left bg-white p-8 md:p-10 rounded-3xl border border-gray-200 hover:border-gray-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-start justify-between gap-6"><div className="w-12 h-12 bg-gray-950 text-white rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors"><MapPin className="w-5 h-5" /></div><MoveRight className="w-5 h-5 text-gray-300 group-hover:text-gray-950 group-hover:translate-x-1 transition-all" /></div>
              <div className="mt-14"><p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600 mb-2">{plaza.count}</p><h3 className="text-3xl font-bold tracking-tight mb-3">{plaza.city}</h3><p className="text-gray-500 leading-relaxed">{plaza.detail}</p></div>
            </button>
          ))}</div>
        </div>
      </section>

      {(inventoryLoading || featuredItems.length > 0) && <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-5"><div><p className="text-eyebrow mb-3">Selección premium</p><h2 className="text-section-title text-3xl md:text-4xl mb-3">Soportes destacados</h2><p className="text-gray-500 text-base">Ubicaciones con alto potencial de impacto visual.</p></div><Link to="/inventario" className="hidden md:flex items-center text-sm font-bold uppercase tracking-wider gap-2 hover:gap-3 transition-all">Ver inventario completo <MoveRight className="w-4 h-4" /></Link></div>
        {inventoryLoading ? <div className="py-16 text-center text-gray-600">Cargando soportes destacados…</div> : <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 snap-x snap-mandatory scrollbar-hide gap-5">{featuredItems.map(item => <div key={item.canonical_id} className="w-[84vw] sm:w-[44vw] md:w-[31vw] lg:w-[30%] flex-shrink-0 snap-start"><SupportCard item={item} variant="showcase" /></div>)}</div>}
        <Link to="/inventario" className="mt-6 md:hidden flex justify-center items-center text-sm font-bold uppercase tracking-wider gap-2">Ver inventario completo <MoveRight className="w-4 h-4" /></Link>
      </section>}

      <section className="relative overflow-hidden bg-gray-950 px-4 py-24 text-white sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 md:grid-cols-[1fr_0.8fr] md:p-12">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5"><MonitorPlay className="h-4 w-4" /><span className="text-[11px] font-bold tracking-[0.16em] uppercase">Innovación dinámica</span></div>
            <h2 className="mb-6 text-3xl font-bold leading-[1.05] tracking-tight md:text-5xl">Tu mensaje también puede moverse.</h2>
            <div className="mb-9 space-y-3 text-sm text-gray-300 md:text-base"><p className="font-semibold text-white">LED Móvil Mendoza</p><p>Lunes a Viernes · 09:00–20:00</p><p>Duración del recorrido: 4 horas</p></div>
            <Button onClick={() => navigate('/inventario?tipo=led_movil')} variant="secondary" className="rounded-full bg-white px-6 text-black hover:bg-gray-100">Ver recorrido <ArrowRight className="h-4 w-4" /></Button>
          </div>
          <div className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 shadow-2xl aspect-[4/3] md:aspect-[5/4]"><img src="/images/led-movil-feature.webp" alt="Camión LED Móvil de Grupo Comunicarte" className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.02]" /></div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white px-4 py-24 text-center sm:px-6 lg:px-8"><div className="mx-auto max-w-3xl"><p className="text-eyebrow mb-4">Soportes</p><h2 className="mb-5 text-3xl font-bold tracking-tight md:text-5xl">Encontrá el soporte adecuado para tu marca</h2><p className="mx-auto mb-9 max-w-2xl leading-relaxed text-gray-500">Explorá nuestra cobertura y descubrí dónde tu próxima campaña puede generar mayor impacto.</p><Link to="/soportes" className={buttonStyles({ size: 'lg', className: 'inline-flex rounded-full px-7' })}>Explorar soportes <ArrowRight className="h-5 w-5" /></Link></div></section>
    </div>
  );
}
