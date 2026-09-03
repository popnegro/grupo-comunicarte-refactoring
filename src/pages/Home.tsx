import { Link, useNavigate } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';
import { ArrowRight, MapPin, MoveRight, Target, Zap, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { InventoryItem } from '../types';
import { useInventory } from '../hooks/useInventory';
import { SupportCard } from '../components/inventory/SupportCard';
import { useRef } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const { items: inventoryItems, loading: inventoryLoading } = useInventory();
  const allItems: InventoryItem[] = inventoryItems;
  const featuredItems = allItems.filter((item) => item.isFeatured).slice(0, 9);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const amount = carouselRef.current.clientWidth * 0.35;
    carouselRef.current.scrollTo({
      left: carouselRef.current.scrollLeft + (direction === 'left' ? -amount : amount),
      behavior: 'smooth',
    });
  };

  return (
    <div className="flex w-full flex-col bg-white">
      <section className="relative min-h-[620px] w-full overflow-hidden bg-gray-950 md:min-h-[700px]">
        <div className="absolute inset-0">
          <img
            src="/images/home.webp"
            alt="Publicidad exterior en vía pública de alto impacto"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[620px] w-full max-w-7xl items-end px-4 py-16 sm:px-6 md:min-h-[700px] md:py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Publicidad exterior · Mendoza y Buenos Aires</p>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
              Sé visible donde se toman decisiones de compra.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              Tu marca en los lugares estratégicos donde se mueve tu cliente, con soportes tradicionales, pantallas digitales y circuitos móviles.
            </p>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row">
              <Link to="/inventario" className={buttonStyles({ size: 'lg', className: 'rounded-lg px-6 bg-white text-gray-950 hover:bg-gray-100' })}>
                Ver disponibilidad <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contacto" className={buttonStyles({ variant: 'outline', size: 'lg', className: 'rounded-lg border-white/40 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white' })}>
                Solicitar propuesta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="plazas" className="bg-[#F9F9F9] px-4 py-12 sm:px-6 lg:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-2 border-b border-gray-200 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Cobertura</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 md:text-3xl">Elegí dónde querés estar</h2>
            </div>
            <Link to="/inventario" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-950">
              Ver inventario <MoveRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { city: 'Mendoza', detail: 'Accesos, nudos comerciales y circuitos móviles para cobertura urbana.', query: 'mendoza' },
              { city: 'Buenos Aires', detail: 'Accesos y avenidas de alto tránsito para impacto y recordación.', query: 'buenos-aires' },
            ].map((plaza) => (
              <button
                key={plaza.city}
                type="button"
                onClick={() => navigate(`/inventario?plaza=${plaza.query}`)}
                className="group flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-5 text-left transition-colors hover:border-gray-400"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-950 text-white group-hover:bg-brand-emerald">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-950">{plaza.city}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{plaza.detail}</p>
                </div>
                <MoveRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-gray-950" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {(inventoryLoading || featuredItems.length > 0) && (
        <section className="px-4 py-12 sm:px-6 lg:px-8 md:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Inventario destacado</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 md:text-3xl">Soportes destacados</h2>
                <p className="mt-2 text-sm text-gray-500">Ubicaciones con alto potencial de impacto visual y circulación.</p>
              </div>
              {!inventoryLoading && (
                <div className="flex gap-1">
                  <button type="button" onClick={() => scroll('left')} className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-950" aria-label="Soporte anterior">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => scroll('right')} className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-950" aria-label="Siguiente soporte">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {inventoryLoading ? (
              <div role="status" aria-live="polite" className="py-12 text-sm font-medium text-gray-500">Cargando soportes destacados…</div>
            ) : (
              <div ref={carouselRef} className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
                {featuredItems.map((item) => (
                  <div key={item.canonical_id} className="w-[85vw] shrink-0 snap-start sm:w-[46vw] md:w-[32vw] lg:w-[calc((100%-40px)/3)]">
                    <SupportCard item={item} variant="showcase" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="border-t border-gray-200 bg-[#F9F9F9] px-4 py-12 sm:px-6 lg:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Por qué nos eligen</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 md:text-3xl">Un mix de medios orientado al resultado</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Target, title: 'Ubicaciones verificadas', text: 'Puntos estratégicos de máxima visibilidad en accesos y avenidas transitadas.' },
              { icon: Zap, title: 'Tecnología DOOH', text: 'Pantallas LED de alta definición para contenidos dinámicos y actualizables.' },
              { icon: ShieldCheck, title: 'Flexibilidad de pauta', text: 'Formatos tradicionales, digitales y móviles adaptados a tu campaña.' },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title} className="border border-gray-200 bg-white p-6">
                <Icon className="h-5 w-5 text-gray-900" />
                <h3 className="mt-5 text-base font-bold text-gray-950">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
