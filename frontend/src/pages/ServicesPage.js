import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import SchedulingModal from '@/components/SchedulingModal';
import { ArrowRight, Snowflake, Wind, Shirt, Droplets, Cog, AirVent, Server, Thermometer, Fan, ChevronRight, ChevronLeft } from 'lucide-react';

const ICON_MAP = { Snowflake, Cog, Shirt, Droplets, Wind, AirVent, Server, Thermometer, Fan };

const PRODUCT_GALLERY = {
  geladeiras: [
    { brand: "Bertazzoni", image: "/images/geladeiras/bertazzoni.png", logo: "/images/assets/bertazzoni-logo.png" },
    { brand: "Brastemp", image: "/images/geladeiras/brastemp.png", logo: "/images/assets/brastemp-logo.png" },
    { brand: "Consul", image: "/images/geladeiras/consul.png", logo: "/images/assets/consul-logo.png" },
    { brand: "Electrolux", image: "/images/geladeiras/electrolux.png", logo: "/images/assets/electrolux-logo.png" },
    { brand: "Hisense", image: "/images/geladeiras/hisense.png", logo: "/images/assets/hisense-logo.png" },
    { brand: "LG", image: "/images/geladeiras/lg.png", logo: "/images/assets/LG-logo.png" },
    { brand: "Liebherr", image: "/images/geladeiras/liebherr.png", logo: "/images/assets/liebherr-logo.png" },
    { brand: "Panasonic", image: "/images/geladeiras/panasonic.png", logo: "/images/assets/panasonic-logo.png" },
    { brand: "Samsung", image: "/images/geladeiras/samsung.png", logo: "/images/assets/samsung-logo.png" },
    { brand: "Philco", image: "/images/geladeiras/philco.png", logo: "/images/assets/Philco-logo.png" },
  ],
  trituradores: [
    { brand: "Franke", image: "/images/trituradores/franke.png", logo: "/images/assets/franke-logo.png" },
  ],
};

const SERVICES = [
  { slug: "geladeiras", name: "Geladeiras", icon: "Snowflake", image: "/images/geladeiras/samsung.png", desc: "Conserto e manutencao de geladeiras de todas as marcas. Diagnostico preciso, pecas originais e garantia de 90 dias.", problems: ["Nao esta gelando", "Faz barulho excessivo", "Vazamento de agua", "Formacao de gelo excessiva", "Compressor com defeito"] },
  { slug: "ar-condicionado-split", name: "Ar Condicionado Split", icon: "Wind", image: null, desc: "Instalacao, manutencao e conserto de ar condicionado split. Limpeza, troca de filtro e recarga de gas.", problems: ["Nao liga", "Nao resfria", "Vazamento de agua", "Ruido excessivo", "Mau cheiro"] },
  { slug: "lava-e-seca", name: "Lava e Seca", icon: "Shirt", image: null, desc: "Reparo especializado em lava e seca. Problemas eletricos, mecanicos e de programacao.", problems: ["Nao centrifuga", "Nao seca", "Vazamento", "Ruidos estranhos", "Erro no painel"] },
  { slug: "lavadoras", name: "Lavadoras", icon: "Droplets", image: null, desc: "Manutencao e conserto de lavadoras. Atendemos todas as marcas com tecnicos especializados.", problems: ["Nao enche agua", "Nao drena", "Vibra demais", "Nao liga", "Problema na placa"] },
  { slug: "ar-condicionado-portatil", name: "Ar Condicionado Portatil", icon: "AirVent", image: null, desc: "Conserto de ar condicionado portatil de todas as marcas.", problems: ["Nao resfria", "Barulho alto", "Vazamento", "Desliga sozinho"] },
  { slug: "trituradores", name: "Trituradores", icon: "Cog", image: "/images/trituradores/franke.png", desc: "Reparo e instalacao de trituradores de alimentos. Servico rapido e garantido.", problems: ["Nao tritura", "Entupido", "Faz barulho", "Vazamento"] },
  { slug: "vrf-hisense", name: "VRF Hisense", icon: "Server", image: null, desc: "Servico autorizado Hisense para sistemas VRF. Instalacao e manutencao especializada.", problems: ["Falha no sistema", "Nao refrigera", "Erro no controlador", "Vazamento de gas"] },
  { slug: "freezers", name: "Freezers", icon: "Thermometer", image: null, desc: "Conserto de freezers verticais e horizontais. Todas as marcas e capacidades.", problems: ["Nao congela", "Forma gelo excessivo", "Motor nao desliga", "Barulho excessivo"] },
  { slug: "coifas", name: "Coifas", icon: "Fan", image: null, desc: "Manutencao e reparo de coifas e depuradores. Limpeza e troca de filtros.", problems: ["Nao aspira", "Motor com defeito", "Iluminacao nao funciona", "Barulho"] },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
const fadeLeft = { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6 } } };

/* ── Product Carousel for detail pages ── */
function ProductCarousel({ products }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      const amount = 220;
      scrollRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="relative" data-testid="product-carousel">
      {/* Navigation arrows */}
      {products.length > 3 && (
        <>
          <button onClick={() => scroll('left')}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-slate-200 shadow-md flex items-center justify-center hover:border-blue-500 transition-colors"
            data-testid="carousel-prev">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <button onClick={() => scroll('right')}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-slate-200 shadow-md flex items-center justify-center hover:border-blue-500 transition-colors"
            data-testid="carousel-next">
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </>
      )}

      {/* Scrollable container */}
      <div ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 px-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {products.map((p) => (
          <div key={p.brand}
            className="flex-shrink-0 w-[180px] bg-white border border-slate-200 p-4 flex flex-col items-center gap-3 hover:-translate-y-1 hover:shadow-lg hover:border-blue-500/30 transition-all duration-300 snap-start group"
            data-testid={`product-${p.brand.toLowerCase()}`}>
            {/* Product image - standardized size */}
            <div className="w-[140px] h-[160px] flex items-center justify-center">
              <img src={p.image} alt={p.brand} className="max-w-[130px] max-h-[150px] object-contain group-hover:scale-105 transition-transform duration-300" />
            </div>
            {/* Brand logo - standardized size, full color */}
            <div className="w-full h-[36px] flex items-center justify-center border-t border-slate-100 pt-3">
              <img src={p.logo} alt={p.brand} className="max-h-[28px] max-w-[100px] object-contain" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceDetail({ service }) {
  const [modalOpen, setModalOpen] = useState(false);
  const IconComp = ICON_MAP[service.icon];
  const gallery = PRODUCT_GALLERY[service.slug] || [];

  return (
    <div data-testid={`service-detail-${service.slug}`}>
      {/* Hero */}
      <section className="py-12 sm:py-14 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/servicos" className="text-sm text-blue-400 hover:text-blue-300 mb-6 inline-flex items-center gap-1 transition-colors">
            <ChevronRight className="w-3 h-3 rotate-180" /> Todos os Servicos
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-6 items-center">
            <div className="lg:col-span-7">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-400 mb-4 block">Assistencia Especializada</span>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] text-white leading-[1.1] mb-5">{service.name}</h1>
              <p className="text-base text-slate-400 leading-relaxed mb-8 max-w-lg">{service.desc}</p>
              <Button onClick={() => setModalOpen(true)} className="bg-red-600 text-white hover:bg-red-700 px-8 py-3.5 h-auto text-sm font-semibold shadow-lg shadow-red-600/20" data-testid="service-cta">
                Agendar Conserto <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              {service.image ? (
                <img src={service.image} alt={service.name} className="w-[250px] h-[300px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" />
              ) : (
                <div className="w-32 h-32 bg-blue-600/20 flex items-center justify-center">
                  <IconComp className="w-16 h-16 text-blue-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Product gallery carousel */}
      {gallery.length > 0 && (
        <section className="py-10 sm:py-12 bg-slate-50" data-testid="product-gallery-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-10">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-3 block">Marcas Atendidas</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-900">Trabalhamos com as melhores marcas</h2>
            </motion.div>
            <ProductCarousel products={gallery} />
          </div>
        </section>
      )}

      {/* Problems and details */}
      <section className="py-12 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-4 block">Problemas Comuns</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-900 mb-6">Identificou algum desses sintomas?</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">Se o seu equipamento apresenta algum desses problemas, nossos tecnicos podem diagnosticar e resolver com cuidado e rapidez.</p>
              <Button onClick={() => setModalOpen(true)} variant="outline" className="border-slate-200 hover:border-blue-600 hover:text-blue-600 text-sm" data-testid="service-secondary-cta">
                Solicitar Orcamento <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.problems.map((p, i) => (
                  <motion.div key={p} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { delay: i * 0.05 } } }}
                    className="bg-white border border-slate-200 p-5 flex items-start gap-3 hover:border-red-300 hover:shadow-sm transition-all group">
                    <div className="w-2 h-2 bg-red-600 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                    <span className="text-sm text-slate-700">{p}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SchedulingModal open={modalOpen} onClose={() => setModalOpen(false)} equipment={{ id: service.slug, name: service.name, icon: service.icon }} />
    </div>
  );
}

export default function ServicesPage() {
  const { slug } = useParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEq, setSelectedEq] = useState(null);
  const service = slug ? SERVICES.find(s => s.slug === slug) : null;

  if (service) return <ServiceDetail service={service} />;

  return (
    <div data-testid="services-page">
      {/* Hero */}
      <section className="py-12 sm:py-14 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeLeft} className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-400 mb-4 block">Nossos Servicos</span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] text-white leading-[1.1] mb-5">Servicos Especializados</h1>
            <p className="text-base text-slate-400 leading-relaxed">Atendemos todas as marcas e tipos de eletrodomesticos com tecnicos certificados e pecas originais.</p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((s, i) => {
              const IconComp = ICON_MAP[s.icon];
              return (
                <motion.div key={s.slug} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { delay: i * 0.05 } } }}>
                  <Link to={`/servicos/${s.slug}`} className="block bg-white border border-slate-200 hover:-translate-y-1 hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.1)] hover:border-blue-500/30 transition-all duration-400 group overflow-hidden" data-testid={`service-card-${s.slug}`}>
                    <div className="h-44 bg-slate-50 flex items-center justify-center relative overflow-hidden">
                      {s.image ? (
                        <img src={s.image} alt={s.name} className="max-h-[140px] max-w-[140px] object-contain group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-20 h-20 bg-white border border-slate-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors duration-300">
                          <IconComp className="w-9 h-9 text-blue-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                      )}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                    </div>
                    <div className="p-6">
                      <h3 className="font-heading font-semibold text-base text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{s.name}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">{s.desc}</p>
                      <span className="text-sm text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Ver detalhes <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <SchedulingModal open={modalOpen} onClose={() => setModalOpen(false)} equipment={selectedEq} />
    </div>
  );
}
