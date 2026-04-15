import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Marquee from 'react-fast-marquee';
import { Button } from '@/components/ui/button';
import SchedulingModal from '@/components/SchedulingModal';
import {
  Shield, Award, Clock, Home, ArrowRight, Star, ChevronRight, ChevronLeft, Wrench,
  Snowflake, Cog, Shirt, Droplets, Wind, AirVent, Server, Thermometer, Fan,
  Phone, CheckCircle2, Quote
} from 'lucide-react';

const ICON_MAP = { Snowflake, Cog, Shirt, Droplets, Wind, AirVent, Server, Thermometer, Fan };

const PRODUCT_CATEGORIES = [
  {
    id: "geladeiras", name: "Geladeiras", icon: "Snowflake",
    products: [
      { brand: "Bertazzoni", image: "/images/geladeiras/bertazzoni.png", logo: "/images/assets/bertazzoni-logo.png" },
      { brand: "Brastemp", image: "/images/geladeiras/brastemp.png", logo: "/images/assets/brastemp-logo.png" },
      { brand: "Consul", image: "/images/geladeiras/consul.png", logo: "/images/assets/consul-logo.png" },
      { brand: "Electrolux", image: "/images/geladeiras/electrolux.png", logo: "/images/assets/electrolux-logo.png" },
      { brand: "Franke", image: "/images/geladeiras/franke.jpg", logo: "/images/assets/franke-logo.png" },
      { brand: "Hisense", image: "/images/geladeiras/hisense.png", logo: "/images/assets/hisense-logo.png" },
      { brand: "LG", image: "/images/geladeiras/lg.png", logo: "/images/assets/LG-logo.png" },
      { brand: "Liebherr", image: "/images/geladeiras/liebherr.png", logo: "/images/assets/liebherr-logo.png" },
      { brand: "Panasonic", image: "/images/geladeiras/panasonic.png", logo: "/images/assets/panasonic-logo.png" },
      { brand: "Philco", image: "/images/geladeiras/philco.png", logo: "/images/assets/Philco-logo.png" },
      { brand: "Samsung", image: "/images/geladeiras/samsung.png", logo: "/images/assets/samsung-logo.png" },
    ]
  },
  {
    id: "trituradores", name: "Trituradores", icon: "Cog",
    products: [
      { brand: "Franke", image: "/images/trituradores/franke.png", logo: "/images/assets/franke-logo.png" },
    ]
  },
];

const ALL_EQUIPMENT = [
  { id: "geladeiras", name: "Geladeiras", icon: "Snowflake", hasImage: true, image: "/images/geladeiras/samsung.png" },
  { id: "trituradores", name: "Trituradores", icon: "Cog", hasImage: true, image: "/images/trituradores/franke.png" },
  { id: "lava-e-seca", name: "Lava e Seca", icon: "Shirt", hasImage: false },
  { id: "lavadoras", name: "Lavadoras", icon: "Droplets", hasImage: false },
  { id: "ar-condicionado-split", name: "Ar Condicionado Split", icon: "Wind", hasImage: false },
  { id: "ar-condicionado-portatil", name: "Ar Condicionado Portatil", icon: "AirVent", hasImage: false },
  { id: "vrf-hisense", name: "VRF Hisense", icon: "Server", hasImage: false },
  { id: "freezers", name: "Freezers", icon: "Thermometer", hasImage: false },
  { id: "coifas", name: "Coifas", icon: "Fan", hasImage: false },
];

const BRAND_LOGOS = [
  { name: "Bertazzoni", src: "/images/assets/bertazzoni-logo.png" },
  { name: "Bosch", src: "/images/assets/Bosch-Logo.png" },
  { name: "Brastemp", src: "/images/assets/brastemp-logo.png" },
  { name: "Consul", src: "/images/assets/consul-logo.png" },
  { name: "Electrolux", src: "/images/assets/electrolux-logo.png" },
  { name: "Franke", src: "/images/assets/franke-logo.png" },
  { name: "Gorenje", src: "/images/assets/gorenje-logo.png" },
  { name: "Hisense", src: "/images/assets/hisense-logo.png" },
  { name: "LG", src: "/images/assets/LG-logo.png" },
  { name: "Liebherr", src: "/images/assets/liebherr-logo.png" },
  { name: "Lofra", src: "/images/assets/lofra-logo.png" },
  { name: "Midea", src: "/images/assets/midea-logo.svg" },
  { name: "Panasonic", src: "/images/assets/panasonic-logo.png" },
  { name: "Philco", src: "/images/assets/Philco-logo.png" },
  { name: "Samsung", src: "/images/assets/samsung-logo.png" },
  { name: "Tecno", src: "/images/assets/tecno-logo.png" },
  { name: "Viking", src: "/images/assets/viking-logo.png" },
];

const DIFFERENTIALS = [
  { icon: Shield, title: "Pecas Originais", desc: "Exclusivamente pecas originais de fabrica, garantindo durabilidade e desempenho ideal do seu equipamento." },
  { icon: Award, title: "Tecnicos Certificados", desc: "Equipe treinada e homologada pelas principais marcas. Expertise comprovada em equipamentos premium." },
  { icon: Clock, title: "Garantia de 90 Dias", desc: "Todos os servicos com garantia. Sua tranquilidade e nossa prioridade absoluta." },
  { icon: Home, title: "Atendimento Domiciliar", desc: "Diagnostico preciso e reparo no conforto do seu lar, sem complicacoes." },
  { icon: Phone, title: "Suporte Dedicado", desc: "Canal direto via WhatsApp para acompanhamento em tempo real do seu atendimento." },
  { icon: CheckCircle2, title: "Portal do Cliente", desc: "Acompanhe ordens de servico, historico e agende novos atendimentos pelo portal exclusivo." },
];

const TESTIMONIALS = [
  { name: "Rose C Vieira", city: "Belo Horizonte", text: "Fui muito bem atendida por profissionais gabaritados! Minha Panasonic ficou maravilhosa! Gratidao a vcs equipe!", rating: 5, time: "3 meses atras", source: "google" },
  { name: "Rafael Lucas", city: "Belo Horizonte", text: "A empresa e muito seria e confiavel. Necessitei deles para dois reparos, e foram otimos! Inclusive um dos atendimentos foi a servico de garantia da Panasonic, excelente! Recomendo a todos que precisam.", rating: 5, time: "1 ano atras", source: "google" },
  { name: "Felipe Porto Aires", city: "Belo Horizonte", text: "Consertaram minha geladeira Panasonic que estava com defeito, servico honesto, rapido e o tecnico mostrou muita seguranca!", rating: 5, time: "4 meses atras", source: "google" },
  { name: "Cristiano Reis de Paiva", city: "Belo Horizonte", text: "Excelente atendimento. Profissional extremamente gentil, educado e atencioso. Parabens!", rating: 5, time: "5 meses atras", source: "google" },
  { name: "Marianna Keller", city: "Belo Horizonte", text: "Excelente profissional e atendimento rapido, indico.", rating: 5, time: "3 meses atras", source: "google" },
  { name: "Toca Espeto", city: "Belo Horizonte", text: "Atendimento muito bom. Resolveram meu problema prontamente, atendimento rapido e eficaz com preco justo! Recomendo!", rating: 5, time: "9 meses atras", source: "google" },
];

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };
const fadeLeft = { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };
const fadeRight = { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

/* ── Hero Product Carousel ── */
function HeroCarousel() {
  const [catIndex, setCatIndex] = useState(0);
  const [prodIndex, setProdIndex] = useState(0);

  const category = PRODUCT_CATEGORIES[catIndex];
  const product = category.products[prodIndex];

  const nextCategory = useCallback(() => {
    setCatIndex(i => (i + 1) % PRODUCT_CATEGORIES.length);
    setProdIndex(0);
  }, []);

  const prevCategory = useCallback(() => {
    setCatIndex(i => (i - 1 + PRODUCT_CATEGORIES.length) % PRODUCT_CATEGORIES.length);
    setProdIndex(0);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setProdIndex(i => (i + 1) % PRODUCT_CATEGORIES[catIndex].products.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [catIndex]);

  return (
    <div className="flex flex-col items-center" data-testid="hero-carousel">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={prevCategory} className="w-11 h-11 border border-white/20 flex items-center justify-center text-white/50 hover:border-white/60 hover:text-white transition-all duration-300" data-testid="hero-prev">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <AnimatePresence mode="wait">
          <motion.p key={category.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-400 min-w-[140px] text-center">
            {category.name}
          </motion.p>
        </AnimatePresence>
        <button onClick={nextCategory} className="w-11 h-11 border border-white/20 flex items-center justify-center text-white/50 hover:border-white/60 hover:text-white transition-all duration-300" data-testid="hero-next">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="relative w-[240px] h-[290px] sm:w-[300px] sm:h-[350px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img key={`${category.id}-${prodIndex}`} src={product.image} alt={`${category.name} ${product.brand}`}
            className="w-[220px] h-[270px] sm:w-[280px] sm:h-[330px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }} data-testid="hero-product-image" />
        </AnimatePresence>
      </div>

      <div className="mt-6 h-14 w-[150px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img key={`logo-${category.id}-${prodIndex}`} src={product.logo} alt={product.brand}
            className="max-h-[40px] max-w-[120px] object-contain brightness-0 invert opacity-80"
            initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
            data-testid="hero-brand-logo" />
        </AnimatePresence>
      </div>

      <div className="flex gap-1.5 mt-3">
        {category.products.map((_, i) => (
          <button key={i} onClick={() => setProdIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === prodIndex ? 'bg-white w-6' : 'bg-white/25 w-1.5 hover:bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const openModal = (eq) => { setSelectedEquipment(eq); setModalOpen(true); };

  return (
    <div data-testid="home-page">

      {/* ══════════════════════════════════════════════════════════
          HERO — Assimetrico, texto esquerda, carrossel direita
         ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-950" data-testid="hero-section">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero-bg.png" alt="" className="w-full h-full object-cover opacity-[0.08]" />
        </div>
        {/* Diagonal accent */}
        <div className="absolute -right-32 top-0 w-[600px] h-full bg-gradient-to-l from-blue-900/20 to-transparent skew-x-[-8deg] z-[1]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            {/* Left: Text — 7 columns */}
            <motion.div className="lg:col-span-7" initial="hidden" animate="visible" variants={fadeLeft}>
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.3em] text-blue-400 mb-6 border border-blue-400/30 px-3 py-1.5">
                Assistencia Autorizada
              </span>
              <h1 className="font-heading text-[2.75rem] sm:text-[3.5rem] lg:text-[4.25rem] font-semibold tracking-[-0.03em] text-white leading-[1.05] mb-6" data-testid="hero-title">
                Assistencia Tecnica<br />
                <span className="text-red-500">Premium em BH</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-8 max-w-xl">
                Seu equipamento merece o melhor cuidado. Diagnostico preciso, pecas originais e tecnicos homologados na sua porta.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button
                  onClick={() => document.getElementById('scheduling-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-red-600 text-white hover:bg-red-700 px-8 py-4 text-sm font-semibold h-auto hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-red-600/20"
                  data-testid="hero-cta">
                  Agendar Visita Tecnica <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <a href="https://wa.me/553134225293" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-2 border-white/15 text-white hover:bg-white/5 hover:border-white/30 px-8 py-4 text-sm h-auto bg-transparent w-full sm:w-auto transition-all duration-200" data-testid="hero-whatsapp-btn">
                    <img src="/images/assets/whatsapp-logo.png" alt="" className="w-5 h-5 mr-2 rounded-full" /> WhatsApp
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-8 text-sm text-slate-500">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Pecas Originais</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Garantia 90 Dias</span>
                <span className="flex items-center gap-2 hidden sm:flex"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Tecnicos Certificados</span>
              </div>
            </motion.div>

            {/* Right: Product Carousel — 5 columns */}
            <motion.div className="lg:col-span-5" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3 }}>
              <HeroCarousel />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          BRAND LOGOS — Conectado ao hero, grayscale→color hover
         ══════════════════════════════════════════════════════════ */}
      <section className="relative bg-white py-10 border-b border-slate-100" data-testid="brand-bar">
        {/* Sutil overlap visual com hero */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-600/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] text-center text-slate-400 uppercase tracking-[0.25em] font-semibold mb-6">Especialistas nas Melhores Marcas</p>
          <Marquee gradient gradientColor="#ffffff" speed={25} pauseOnHover>
            {BRAND_LOGOS.map(b => (
              <div key={b.name} className="mx-10 sm:mx-12 flex items-center justify-center w-[160px] h-16 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
                <img src={b.src} alt={b.name} className="max-h-[52px] max-w-[140px] object-contain" loading="lazy" />
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          EQUIPMENT — Layout Assimetrico 40/60
         ══════════════════════════════════════════════════════════ */}
      <section id="scheduling-section" className="py-20 sm:py-28 relative overflow-hidden" data-testid="carousel-section">
        {/* Textura de fundo sutil */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            {/* Left — Titulo e contexto (5 col) */}
            <motion.div className="lg:col-span-5 lg:sticky lg:top-32" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft}>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-4 block">Atendimento Expresso</span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] text-slate-900 leading-[1.1] mb-5">
                Qual equipamento precisa de cuidado?
              </h2>
              <p className="text-base text-slate-500 leading-relaxed mb-8 max-w-sm">
                Selecione o equipamento para iniciar seu atendimento com nossos especialistas.
              </p>
              <div className="hidden lg:block">
                <p className="text-sm text-slate-400 mb-3">Atendemos tambem:</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_EQUIPMENT.filter(eq => !eq.hasImage).map(eq => (
                    <button key={eq.id} onClick={() => openModal(eq)}
                      className="text-xs border border-slate-200 px-3 py-1.5 text-slate-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                      data-testid={`equipment-tag-${eq.id}`}>
                      {eq.name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right — Equipment Cards (7 col) */}
            <motion.div className="lg:col-span-7" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {ALL_EQUIPMENT.map((eq, i) => {
                  const IC = ICON_MAP[eq.icon];
                  return (
                    <motion.button key={eq.id} variants={fadeUp}
                      onClick={() => openModal(eq)}
                      className="group relative bg-white border border-slate-200 p-5 sm:p-6 flex flex-col items-center gap-4 hover:-translate-y-2 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] hover:border-blue-500/50 transition-all duration-400 cursor-pointer overflow-hidden"
                      data-testid={`equipment-${eq.id}`}>
                      {/* Hover accent */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                      {eq.hasImage ? (
                        <div className="w-24 h-24 flex items-center justify-center">
                          <img src={eq.image} alt={eq.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                          <IC className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                      )}
                      <span className="font-heading font-medium text-sm text-slate-800 text-center">{eq.name}</span>
                      <span className="text-xs text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                        Agendar <ArrowRight className="w-3 h-3" />
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Mobile: atendemos tambem */}
          <div className="lg:hidden mt-8 text-center">
            <Link to="/servicos" className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1" data-testid="see-all-services">
              Ver todos os servicos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          COMO FUNCIONA — Steps conectados com linha
         ══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-slate-950 relative overflow-hidden" data-testid="how-it-works">
        {/* Background textura */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-16">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-400 mb-4 block">Processo Simplificado</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-white max-w-md">Como Funciona</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-0 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[calc(16.66%+12px)] right-[calc(16.66%+12px)] h-px bg-gradient-to-r from-blue-600/50 via-blue-400/30 to-blue-600/50" />

            {[
              { num: "01", title: "Agende Online", desc: "Selecione seu equipamento, escolha a marca e descreva o problema. Uma OS e gerada automaticamente." },
              { num: "02", title: "Receba o Tecnico", desc: "Tecnico certificado e especializado na sua marca ira ate voce no horario combinado." },
              { num: "03", title: "Problema Resolvido", desc: "Reparo com pecas originais e garantia de 90 dias. Acompanhe tudo pelo portal." },
            ].map((s, i) => (
              <motion.div key={s.num}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.7, delay: i * 0.2 } } }}
                className="relative p-6 md:p-8 text-center md:text-left">
                {/* Step number */}
                <div className="w-[72px] h-[72px] bg-blue-600 text-white font-heading font-bold text-xl flex items-center justify-center mx-auto md:mx-0 mb-6 relative z-10 shadow-lg shadow-blue-600/30">
                  {s.num}
                </div>
                <h3 className="font-heading font-semibold text-lg text-white mb-3">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto md:mx-0">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          DIFERENCIAIS — Grid variado com profundidade
         ══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative" data-testid="differentials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left — Title (4 col) */}
            <motion.div className="lg:col-span-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft}>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-4 block">Diferenciais</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-slate-900 leading-[1.1] mb-5">
                Por que confiar na Mastermaq?
              </h2>
              <p className="text-base text-slate-500 leading-relaxed">
                Seu equipamento premium merece o melhor cuidado. Descubra o que nos diferencia.
              </p>
            </motion.div>

            {/* Right — Grid 2x3 com tamanhos variados (8 col) */}
            <motion.div className="lg:col-span-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DIFFERENTIALS.map((d, i) => {
                  const isLarge = i === 0 || i === 3;
                  return (
                    <motion.div key={d.title} variants={fadeUp}
                      className={`group relative bg-white border border-slate-200 hover:border-blue-500/30 hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.08)] transition-all duration-400 overflow-hidden ${isLarge ? 'p-8 sm:p-10' : 'p-7'}`}>
                      {/* Accent line */}
                      <div className="absolute top-0 left-0 w-0.5 h-0 group-hover:h-full bg-blue-600 transition-all duration-500" />
                      <div className={`${isLarge ? 'w-14 h-14' : 'w-12 h-12'} bg-slate-50 group-hover:bg-blue-600 flex items-center justify-center mb-5 transition-colors duration-300`}>
                        <d.icon className={`${isLarge ? 'w-7 h-7' : 'w-6 h-6'} text-blue-600 group-hover:text-white transition-colors duration-300`} />
                      </div>
                      <h3 className="font-heading font-semibold text-base text-slate-900 mb-2">{d.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{d.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          DEPOIMENTOS — Avaliacoes reais do Google
         ══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-slate-50 relative" data-testid="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-14">
            <motion.div className="lg:col-span-7" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft}>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-4 block">Depoimentos</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-slate-900 max-w-md">O que nossos clientes dizem</h2>
            </motion.div>
            <motion.div className="lg:col-span-5 flex items-center gap-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeRight}>
              <div className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-3 shadow-sm">
                <div className="text-center">
                  <p className="font-heading text-2xl font-bold text-slate-900">4,1</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4].map(i => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                    <Star className="w-3.5 h-3.5 fill-yellow-400/30 text-yellow-400/30" />
                  </div>
                </div>
                <div className="border-l border-slate-200 pl-3">
                  <p className="text-xs font-semibold text-slate-700">134 avaliacoes</p>
                  <p className="text-[10px] text-slate-400">Google Meu Negocio</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Featured testimonial — 7 col */}
            <motion.div className="lg:col-span-7" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft}>
              <div className="bg-white border border-slate-200 p-10 sm:p-12 relative overflow-hidden group hover:shadow-xl transition-shadow duration-400">
                <Quote className="w-16 h-16 text-blue-100 absolute top-6 right-6 group-hover:text-blue-200 transition-colors duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex gap-0.5">
                      {Array.from({ length: TESTIMONIALS[1].rating }).map((_, j) => <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{TESTIMONIALS[1].time}</span>
                  </div>
                  <p className="text-lg sm:text-xl text-slate-700 leading-relaxed mb-8 font-heading font-normal italic">
                    "{TESTIMONIALS[1].text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 flex items-center justify-center text-white font-heading font-bold text-lg">
                      {TESTIMONIALS[1].name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-sm text-slate-900">{TESTIMONIALS[1].name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        Via Google
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Secondary testimonials — 5 col */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {TESTIMONIALS.filter((_, i) => i !== 1).slice(0, 3).map((t, i) => (
                <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={{ ...fadeRight, visible: { ...fadeRight.visible, transition: { duration: 0.7, delay: i * 0.12 } } }}
                  className="bg-white border border-slate-200 p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <span className="text-[10px] text-slate-400">{t.time}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 flex items-center justify-center text-slate-600 font-heading font-semibold text-xs">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-xs text-slate-900">{t.name}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        Via Google
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* More reviews row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
            {TESTIMONIALS.filter((_, i) => i !== 1).slice(3).map((t, i) => (
              <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.6, delay: i * 0.1 } } }}
                className="bg-white border border-slate-200 p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <span className="text-[10px] text-slate-400">{t.time}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 flex items-center justify-center text-slate-600 font-heading font-semibold text-xs">{t.name.charAt(0)}</div>
                  <div>
                    <p className="font-heading font-semibold text-xs text-slate-900">{t.name}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      Via Google
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA FINAL — Assimetrico com personalidade
         ══════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 bg-[#0F1D3D] relative overflow-hidden" data-testid="final-cta">
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div className="absolute -right-40 -top-40 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute -left-40 -bottom-40 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left content — 7 col */}
            <motion.div className="lg:col-span-7" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft}>
              <img src="/images/assets/mastermaq-logo.png" alt="Mastermaq" className="h-10 w-auto brightness-0 invert opacity-60 mb-8" />
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] text-white leading-[1.1] mb-5">
                Nao deixe seu equipamento parado
              </h2>
              <p className="text-base text-blue-200/70 max-w-lg mb-10 leading-relaxed">
                Agende agora sua visita tecnica e tenha seu equipamento premium funcionando perfeitamente. Atendimento rapido e garantido.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => document.getElementById('scheduling-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-red-600 text-white hover:bg-red-700 px-10 py-4 text-sm font-semibold h-auto hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-red-600/25"
                  data-testid="final-cta-btn">
                  Agendar Visita Agora <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <a href="tel:+553134225293">
                  <Button variant="outline" className="border-2 border-white/15 text-white hover:bg-white/5 hover:border-white/30 px-10 py-4 text-sm h-auto bg-transparent transition-all duration-200" data-testid="final-call-btn">
                    <Phone className="w-4 h-4 mr-2" /> (31) 3422-5293
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* Right — Stats compactos (5 col) */}
            <motion.div className="lg:col-span-5" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeRight}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { num: "10+", label: "Anos de Experiencia" },
                  { num: "5000+", label: "Clientes Atendidos" },
                  { num: "15+", label: "Marcas Atendidas" },
                  { num: "98%", label: "Satisfacao" },
                ].map((s, i) => (
                  <motion.div key={s.label} variants={fadeUp}
                    className="border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 text-center hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300">
                    <p className="font-heading text-2xl sm:text-3xl font-bold text-white mb-1">{s.num}</p>
                    <p className="text-[11px] text-blue-200/50 uppercase tracking-wider">{s.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <SchedulingModal open={modalOpen} onClose={() => setModalOpen(false)} equipment={selectedEquipment} />
    </div>
  );
}
