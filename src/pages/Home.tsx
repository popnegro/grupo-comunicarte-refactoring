import { Link, useNavigate } from 'react-router-dom';
import { buttonStyles } from '../components/ui/Button';
import { ArrowRight, MapPin, MoveRight, Sparkles, Target, Zap, ShieldCheck } from 'lucide-react';
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
      {/* Hero Section */}
      <section className="relative min-h-[700px] md:min-h-[820px] w-full flex items-center overflow-hidden bg-gray-950">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/home.webp"
            alt="Publicidad exterior en vía pública de alto impacto"
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-28 md:py-36">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase">Espacios Publicitarios Premium</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-extrabold tracking-[-0.04em] text-white max-w-4xl leading-[0.96] mb-8">
              Tu marca en los lugares correctos
            </h1>

            <p className="text-lg sm:text-xl text-white/85 max-w-2xl mb-11 leading-relaxed font-normal">
              Circuito estratégico de cartelería tradicional, pantallas LED de alta definición y móviles en Mendoza y Buenos Aires para generar máxima presencia, alcance y recordación.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to="/contacto"
                className={buttonStyles({
                  size: 'lg',
                  className: 'text-base font-semibold rounded-full px-8 bg-white text-gray-950 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all'
                })}
              >
                Hablar con el equipo <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
              <Link
                to="/inventario"
                className={buttonStyles({
                  variant: 'outline',
                  size: 'lg',
                  className: 'text-base font-semibold rounded-full px-8 border-white/35 text-white hover:bg-white/15 hover:text-white bg-white/5 backdrop-blur-sm transition-all'
                })}
              >
                Explorar inventario
              </Link>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-white/10 flex flex-wrap items-center gap-x-8 gap-y-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Mendoza</span>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Buenos Aires</span>
            <span className="text-white/30">•</span>
            <span>Vía Pública Tradicional (OOH)</span>
            <span className="text-white/30">•</span>
            <span>Pantallas Digitales (DOOH)</span>
          </div>
        </div>
      </section >

      {/* Plazas Section */}
      < section id="plazas" className="bg-[#F9F9F9] py-24 sm:py-28 px-4 sm:px-6 lg:px-8" >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <p className="text-eyebrow mb-3">Presencia estratégica</p>
              <h2 className="text-section-title text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950">Elegí dónde querés estar</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                city: 'Mendoza',
                tag: 'Cobertura Integral',
                detail: 'Cartelería espectacular en accesos clave, pantallas LED de alta resolución en nudos comerciales y circuito de camión LED móvil.',
                features: ['Formatos Tradicionales', 'Pantallas LED P4/P6', 'Circuito LED Móvil'],
                query: 'mendoza',
                color: 'group-hover:bg-red-600'
              },
              {
                city: 'Buenos Aires',
                tag: 'Puntos Neurálgicos',
                detail: 'Ubicaciones de alto tránsito en accesos principales y avenidas neurálgicas para lograr impacto masivo y recordación sostenida.',
                features: ['Gran Formato', 'Nudos Viales Clave', 'Iluminación Frontlight'],
                query: 'buenos-aires',
                color: 'group-hover:bg-gray-900'
              }
            ].map((plaza) => (
              <button
                key={plaza.city}
                type="button"
                onClick={() => navigate(`/inventario?plaza=${plaza.query}`)}
                className="group relative text-left bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 hover:border-gray-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-6">
                    <div className={`w-13 h-13 bg-gray-950 text-white rounded-2xl flex items-center justify-center shrink-0 ${plaza.color} transition-colors shadow-sm`}>
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-950 transition-colors">
                      <span>Ver soportes</span>
                      <MoveRight className="w-4 h-4 text-gray-400 group-hover:text-gray-950 group-hover:translate-x-1.5 transition-all" />
                    </div>
                  </div>

                  <div className="mt-10">
                    <span className="inline-block text-xs font-bold uppercase tracking-[0.16em] text-red-600 mb-2">
                      {plaza.tag}
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-950 mb-3">{plaza.city}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{plaza.detail}</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
                  {plaza.features.map((feat) => (
                    <span key={feat} className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200/80 px-3 py-1.5 rounded-xl">
                      {feat}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section >

      {/* Featured Supports Section */}
      {
        (inventoryLoading || featuredItems.length > 0) && (
          <section className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <div className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-5">
              <div>
                <p className="text-eyebrow mb-3">Selección premium</p>
                <h2 className="text-section-title text-3xl sm:text-4xl font-extrabold text-gray-950 mb-3">Soportes destacados</h2>
                <p className="text-gray-600 text-base">Ubicaciones con alto potencial de impacto visual y métricas de circulación.</p>
              </div>
              <Link
                to="/inventario"
                className="hidden md:inline-flex items-center text-sm font-bold uppercase tracking-wider gap-2 text-gray-900 hover:text-red-600 hover:gap-3 transition-all"
              >
                Ver inventario completo <MoveRight className="w-4 h-4" />
              </Link>
            </div>

            {inventoryLoading ? (
              <div className="py-20 text-center text-gray-500 font-medium animate-pulse">
                Cargando soportes destacados…
              </div>
            ) : (
              <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 snap-x snap-mandatory scrollbar-hide gap-6">
                {featuredItems.map((item) => (
                  <div key={item.canonical_id} className="w-[85vw] sm:w-[46vw] md:w-[32vw] lg:w-[31%] flex-shrink-0 snap-start">
                    <SupportCard item={item} variant="showcase" />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 md:hidden flex justify-center">
              <Link
                to="/inventario"
                className={buttonStyles({ variant: 'outline', className: 'w-full rounded-full justify-center' })}
              >
                Ver inventario completo <MoveRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </section>
        )
      }


      {/* Value Pillars Section */}
      <section className="bg-[#F9F9F9] py-24 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-eyebrow mb-3">Diferenciales</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 tracking-tight mb-4">
              Grupo Comunicarte
            </h2>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Más de una década conectando marcas líderes con audiencias en movimiento mediante soportes de alto impacto y servicio comercial integral.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-gray-200 bg-[#F9F9F9] p-8 sm:p-10 flex flex-col justify-between hover:border-gray-300 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gray-950 text-white flex items-center justify-center mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-950 mb-3">Ubicaciones Estratégicas</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Espacios seleccionados minuciosamente en nudos viales y accesos de alta densidad para asegurar máxima visibilidad y frecuencia.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-[#F9F9F9] p-8 sm:p-10 flex flex-col justify-between hover:border-gray-300 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gray-950 text-white flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-950 mb-3">Tecnología DOOH de Vanguardia</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Pantallas LED de alta resolución con gestión de contenidos dinámica, rotación programada y óptima visualización diurna y nocturna.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-[#F9F9F9] p-8 sm:p-10 flex flex-col justify-between hover:border-gray-300 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gray-950 text-white flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-950 mb-3">Atención B2B y Media Kits</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Generá presupuestos y Media Kits consolidados con fichas técnicas, mapas interactivos y cotizaciones directas para tu agencia o marca.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA Banner */}
      <section className="bg-white px-4 py-24 sm:py-28 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full bg-gray-100 border border-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-red-600" /> Elegí el formato para tu pauta
          </div>
          <h2 className="mb-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-950">
            Encontrá el soporte adecuado para tu pauta
          </h2>
          <p className="mx-auto mb-10 max-w-2xl leading-relaxed text-gray-600 text-base sm:text-lg">
            Explorá nuestra cobertura interactiva, seleccioná los espacios que te interesan y solicitá tu propuesta comercial en minutos.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/soporte"
              className={buttonStyles({
                size: 'lg',
                className: 'inline-flex rounded-full px-8 font-semibold shadow-md'
              })}
            >
              Ver soportes <ArrowRight className="h-5 w-5 ml-1" />
            </Link>
            <Link
              to="/contacto"
              className={buttonStyles({
                variant: 'outline',
                size: 'lg',
                className: 'inline-flex rounded-full px-8 font-semibold'
              })}
            >
              Hablar con Ventas
            </Link>
          </div>
        </div>
      </section>
    </div >
  );
}
