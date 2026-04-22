import { useState, useEffect, useCallback, useRef } from 'react';
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
  { id: "ar-condicionado-portátil", name: "Ar Condicionado Portátil", icon: "AirVent", hasImage: false },
  { id: "vrf-hisense", name: "VRF Hisense", icon: "Server", hasImage: false },
  { id: "freezers", name: "Freezers", icon: "Thermometer", hasImage: false },
  { id: "coifas", name: "Coifas", icon: "Fan", hasImage: false },
];

const BRAND_LOGOS = [
  { name: "HQ", src: "/images/assets/hq-logo.png" },
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

const AUTHORIZED_BRANDS = [
  {
    name: "HQ",
    logo: "/images/assets/hq-logo.png",
    title: "Autorizada Belmicro HQ",
    desc: "Serviço autorizado Belmicro HQ com credenciamento oficial. Atuamos no conserto de geladeiras de embutir em BH, fornos combinados, micro-ondas, fornos elétricos, coifas e ar-condicionado. Garantimos um serviço especializado que mantém a originalidade do seu aparelho.",
  },
  {
    name: "Bertazzoni & Lofra",
    logo: "/images/assets/bertazzoni-logo.png",
    logo2: "/images/assets/lofra-logo.png",
    title: "Autorizada Bertazzoni & Lofra",
    desc: "Serviço autorizado Lofra e Bertazzoni com credenciamento do fabricante. Especialistas no conserto de geladeiras de embutir em BH, fornos combinados, micro-ondas, fornos elétricos, coifas e cooktops, garantindo reparação segura e originalidade do produto.",
  },
  {
    name: "Gorenje",
    logo: "/images/assets/gorenje-logo.png",
    title: "Autorizada Gorenje",
    desc: "Serviço autorizado Gorenje credenciado pelo fabricante. Expertise no conserto de geladeiras de embutir em BH, fornos combinados, micro-ondas, fornos elétricos, coifas e cooktops. Oferecemos manutenção correta e segura para preservar seu eletrodoméstico.",
  },
  {
    name: "Hisense",
    logo: "/images/assets/hisense-logo.png",
    title: "Autorizada Hisense",
    desc: "Serviço autorizado Hisense com credenciamento oficial. Atuamos no conserto de geladeiras de embutir em BH, fornos combinados, micro-ondas, fornos elétricos, coifas e ar-condicionado. Garantimos um serviço especializado que mantém a originalidade do seu aparelho.",
  },
  {
    name: "Liebherr",
    logo: "/images/assets/liebherr-logo.png",
    title: "Autorizada Liebherr",
    desc: "Serviço especializado Liebherr, referência alemã em refrigeração de alto padrão. Atuamos no conserto de geladeiras de embutir em BH, adegas climatizadas e equipamentos premium da marca, com diagnóstico preciso e reparação técnica de alto nível. Garantimos máxima preservação da tecnologia, desempenho e sofisticação dos produtos Liebherr, utilizando práticas alinhadas ao padrão europeu de qualidade.",
  },
  {
    name: "Franke",
    logo: "/images/assets/franke-logo.png",
    title: "Autorizada Franke",
    desc: "Serviço autorizado Franke credenciado pelo fabricante. Especialistas em conserto de geladeiras de embutir em BH, fornos combinados, micro-ondas, fornos elétricos, coifas e trituradores. Reparação técnica segura para maior durabilidade do seu produto.",
  },
  {
    name: "Panasonic",
    logo: "/images/assets/panasonic-logo.png",
    title: "Panasonic",
    desc: "Especializada em conserto de geladeiras e máquinas de lavar Panasonic em BH. Fomos autorizados com credenciamento exclusivo por 11 anos pela Panasonic do Brasil, mantendo hoje a expertise técnica avançada em todos os produtos da marca.",
  },
];

const DIFFERENTIALS = [
  { icon: Shield, title: "Pecas Originais", desc: "Exclusivamente peças originais de fabrica, garantindo durabilidade e desempenho ideal do seu produto." },
  { icon: Award, title: "Técnicos Especializados", desc: "Equipe treinada e especializada nas principais marcas. Expertise em produtos de alto padrão." },
  { icon: Clock, title: "Garantia de 90 Dias", desc: "Todos os serviços com garantia. Sua tranquilidade é nossa prioridade absoluta." },
  { icon: Home, title: "Atendimento Domiciliar", desc: "Diagnostico preciso e reparo no conforto do seu lar, sem complicações." },
  { icon: Phone, title: "Suporte Dedicado", desc: "Canal direto via WhatsApp para acompanhamento em tempo real do seu atendimento." },
  { icon: CheckCircle2, title: "Portal do Cliente", desc: "Acompanhe ordens de serviço, histórico e agende novos atendimentos pelo portal exclusivo." },
];

const TESTIMONIALS = [
  { name: "Rose C Vieira", city: "Belo Horizonte", text: "Fui muito bem atendida por profissionais gabaritados! Minha Panasonic ficou maravilhosa! Gratidao a vcs equipe!", rating: 5, time: "3 meses atrás", source: "google" },
  { name: "Rafael Lucas", city: "Belo Horizonte", text: "A empresa e muito seria e confiavel. Necessitei deles para dois reparos, e foram otimos! Inclusive um dos atendimentos foi a serviço de garantia da Panasonic, excelente! Recomendo a todos que precisam.", rating: 5, time: "1 ano atrás", source: "google" },
  { name: "Felipe Porto Aires", city: "Belo Horizonte", text: "Consertaram minha geladeira Panasonic que estava com defeito, serviço honesto, rápido e o técnico mostrou muita segurança!", rating: 5, time: "4 meses atrás", source: "google" },
  { name: "Cristiano Reis de Paiva", city: "Belo Horizonte", text: "Excelente atendimento. Profissional extremamente gentil, educado e atencioso. Parabens!", rating: 5, time: "5 meses atrás", source: "google" },
  { name: "Marianna Keller", city: "Belo Horizonte", text: "Excelente profissional e atendimento rápido, indico.", rating: 5, time: "3 meses atrás", source: "google" },
  { name: "Toca Espeto", city: "Belo Horizonte", text: "Atendimento muito bom. Resolveram meu problema prontamente, atendimento rápido e eficaz com preço justo! Recomendo!", rating: 5, time: "9 meses atrás", source: "google" },
  { name: "Rodrigo G. Amaral", city: "Belo Horizonte", text: "Acionei a Mastermaq porque a minha geladeira Electrolux estava gelando pouco, fui atendido no mesmo dia e imediatamente constataram um problema no motor da geladeira e ja me passaram o orçamento.", rating: 5, time: "1 ano atrás", source: "google" },
  { name: "Juhh Costa", city: "Belo Horizonte", text: "Nelson um otimo atendente, muito atencioso e explicativo.", rating: 5, time: "1 mes atrás", source: "google" },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const fadeLeft = { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const fadeRight = { hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

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
            className="w-[220px] h-[270px] sm:w-[280px] sm:h-[330px] object-contain"
            style={{ filter: 'drop-shadow(0 0 25px rgba(0,76,255,0.35))' }}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }} data-testid="hero-product-image" />
        </AnimatePresence>
      </div>

      <div className="mt-6 h-14 w-[150px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img key={`logo-${category.id}-${prodIndex}`} src={product.logo} alt={product.brand}
            className="max-h-[40px] max-w-[120px] object-contain grayscale opacity-50"
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
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

/* ── Authorized Brands Carousel ── */
function AuthorizedCarousel() {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'right' ? 300 : -300, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative" data-testid="authorized-carousel">
      {/* Nav arrows */}
      <div className="flex gap-2 mb-4 justify-end">
        <button onClick={() => scroll('left')}
          className="w-9 h-9 border border-slate-200 bg-white flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-colors text-slate-400"
          data-testid="auth-carousel-prev">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={() => scroll('right')}
          className="w-9 h-9 border border-slate-200 bg-white flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-colors text-slate-400"
          data-testid="auth-carousel-next">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable cards */}
      <div ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
        {AUTHORIZED_BRANDS.map((brand) => (
          <div key={brand.name}
            className="flex-shrink-0 w-[260px] sm:w-[280px] bg-white border border-slate-200 flex flex-col group hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 snap-start"
            data-testid={`auth-brand-${brand.name.toLowerCase().replace(/\s+/g, '-')}`}>
            {/* Logo area */}
            <div className="px-6 pt-7 pb-5 flex items-center justify-center gap-4 border-b border-slate-100 min-h-[80px]">
              <div className="h-[50px] flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500">
                <img src={brand.logo} alt={brand.name} className="max-h-[44px] max-w-[120px] object-contain" />
              </div>
              {brand.logo2 && (
                <div className="h-[50px] flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500">
                  <img src={brand.logo2} alt="" className="max-h-[36px] max-w-[90px] object-contain" />
                </div>
              )}
            </div>
            {/* Description */}
            <div className="px-6 py-5 flex-1">
              <h3 className="font-heading font-semibold text-sm text-slate-900 mb-2">{brand.title}</h3>
              <p className="text-[12px] text-slate-500 leading-relaxed">{brand.desc}</p>
            </div>
          </div>
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
          HERO — Luz direcional concentrada, zero blur
         ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" data-testid="hero-section"
        style={{
          background: `
            radial-gradient(ellipse at 95% 0%, #004cff 0%, rgba(0,76,255,0.6) 8%, rgba(0,76,255,0.15) 20%, transparent 35%),
            linear-gradient(135deg, transparent 50%, rgba(0,76,255,0.06) 70%, rgba(0,76,255,0.12) 85%, rgba(0,60,200,0.08) 100%),
            radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.5) 100%),
            linear-gradient(180deg, #080e1a 0%, #050810 100%)
          `
        }}>

        {/* Background photo */}
        <div className="absolute inset-0 z-0">
          <img src="/images/hero-bg.png" alt="" className="w-full h-full object-cover opacity-[0.06]" />
        </div>

        {/* === LUZ DIRECIONAL — gradientes puros, sem beams retos === */}

        {/* Iluminacao concentrada atrás do produto — radial no centro-direita */}
        <div className="absolute z-[1] pointer-events-none"
          style={{
            top: '10%', right: '5%', width: '450px', height: '500px',
            background: 'radial-gradient(circle, rgba(0,76,255,0.22) 0%, rgba(0,76,255,0.08) 35%, transparent 60%)',
          }} />

        {/* SVG Arco circular — destaque, mais visivel */}
        <svg className="absolute top-0 right-0 w-[700px] h-full z-[1] pointer-events-none" viewBox="0 0 700 620" fill="none" preserveAspectRatio="xMaxYMid slice">
          <defs>
            <linearGradient id="arc1" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#004cff" stopOpacity="0.8" />
              <stop offset="25%" stopColor="#004cff" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#004cff" stopOpacity="0.2" />
              <stop offset="80%" stopColor="#004cff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#004cff" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="haloFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0,76,255,0.08)" />
              <stop offset="60%" stopColor="rgba(0,76,255,0.02)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          {/* Halo fill sutil */}
          <ellipse cx="360" cy="310" rx="230" ry="260" fill="url(#haloFill)" />
          {/* Arco principal — forte, visivel */}
          <ellipse cx="360" cy="310" rx="240" ry="270" stroke="url(#arc1)" strokeWidth="2.5" fill="none" />
          {/* Arco interno — mais sutil */}
          <ellipse cx="360" cy="310" rx="200" ry="230" stroke="rgba(0,76,255,0.08)" strokeWidth="1" fill="none" />
          {/* Arco externo — ghost */}
          <ellipse cx="360" cy="310" rx="280" ry="310" stroke="rgba(0,76,255,0.04)" strokeWidth="0.8" fill="none" />
        </svg>

        {/* Floor light — sem blur, gradiente puro */}
        <div className="absolute z-[1] pointer-events-none"
          style={{
            bottom: 0, right: '8%', width: '300px', height: '50px',
            background: 'radial-gradient(ellipse at 50% 100%, rgba(0,76,255,0.25) 0%, rgba(0,76,255,0.08) 40%, transparent 70%)',
          }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">

            {/* Left: Text */}
            <div className="lg:col-span-7 relative z-[2]">
              <motion.h1
                className="font-heading text-[2.5rem] sm:text-[3.25rem] lg:text-[4rem] font-bold tracking-[-0.03em] text-white leading-[1.08] mb-5"
                data-testid="hero-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
                Assistência Técnica{' '}
                <span className="text-blue-500">Autorizada em BH</span>
              </motion.h1>
              <motion.p
                className="text-base text-slate-400 leading-relaxed mb-7 max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
                Seu produto merece o <strong className="text-slate-300">melhor cuidado</strong>. Diagnostico preciso, pecas originais e <strong className="text-slate-300">técnicos homologados</strong> na sua porta.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-3 mb-7"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                <Button
                  onClick={() => document.getElementById('scheduling-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-red-600 text-white hover:bg-red-700 px-8 py-4 text-sm font-semibold h-auto hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-red-600/20"
                  data-testid="hero-cta">
                  Agendar Visita Técnica <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <a href="https://wa.me/553134225293" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border border-white/15 text-white hover:bg-white/5 hover:border-white/30 px-8 py-4 text-sm h-auto bg-transparent w-full sm:w-auto transition-all duration-200" data-testid="hero-whatsapp-btn">
                    <img src="/images/assets/whatsapp-logo.png" alt="" className="w-5 h-5 mr-2 rounded-full" /> WhatsApp
                  </Button>
                </a>
              </motion.div>
              <motion.div
                className="flex items-center gap-6 text-[13px] text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.45 }}>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Pecas Originais</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Garantia 90 Dias</span>
                <span className="flex items-center gap-1.5 hidden sm:flex"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Técnicos Especializados</span>
              </motion.div>
            </div>

            {/* Right: Product — drop-shadow nitido #004cff */}
            <motion.div className="lg:col-span-5 relative z-[3]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
              <HeroCarousel />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          BRAND LOGOS — Carrossel padronizado
         ══════════════════════════════════════════════════════════ */}
      <section className="relative bg-white py-8 border-b border-slate-100" data-testid="brand-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] text-center text-slate-400 uppercase tracking-[0.25em] font-semibold mb-5">Especialistas nas Melhores Marcas</p>
          <Marquee gradient gradientColor="#ffffff" speed={25} pauseOnHover>
            {BRAND_LOGOS.map(b => (
              <div key={b.name} className="mx-8 sm:mx-10 flex items-center justify-center w-[140px] h-[56px] grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
                <img src={b.src} alt={b.name} className="max-h-[46px] max-w-[120px] object-contain" loading="lazy" />
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SERVICO AUTORIZADO — Carrossel horizontal de cards verticais
         ══════════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-14 bg-slate-50 relative overflow-hidden" data-testid="authorized-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
            {/* Left — Title 40% — aligned to top of cards */}
            <motion.div className="lg:col-span-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft}>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-3 block">Serviço Autorizado</span>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-[2.25rem] font-semibold tracking-[-0.02em] text-slate-900 leading-[1.15] mb-4">
                Credenciado Pelas Melhores Marcas
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Expertise reconhecida pelos fabricantes lideres de mercado. Garantia de pecas originais e técnicos homologados.
              </p>
              <div className="bg-white border-l-4 border-blue-600 p-5 shadow-sm">
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "Não arrisque com seu produto. Somente a Mastermaq Assistência possui a expertise e o credenciamento direto dos fabricantes para garantir um reparo correto, seguro e com pecas originais. Confie em quem entende de verdade."
                </p>
              </div>
            </motion.div>

            {/* Right — Carrossel horizontal 60% */}
            <div className="lg:col-span-8">
              <AuthorizedCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          EQUIPMENT — Layout Assimetrico 40/60
         ══════════════════════════════════════════════════════════ */}
      <section id="scheduling-section" className="py-14 sm:py-18 relative overflow-hidden" data-testid="carousel-section">
        {/* Textura de fundo sutil */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            {/* Left — Titulo e contexto (5 col) */}
            <motion.div className="lg:col-span-5" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft}>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-3 block">Atendimento Expresso</span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-[-0.02em] text-slate-900 leading-[1.1] mb-5">
                Qual produto precisa de cuidado?
              </h2>
              <p className="text-base text-slate-500 leading-relaxed mb-8 max-w-sm">
                Selecione o produto para iniciar seu atendimento com nossos especialistas.
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
              Ver todos os serviços <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          COMO FUNCIONA — Steps conectados com linha
         ══════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-18 bg-slate-950 relative overflow-hidden" data-testid="how-it-works">
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
              { num: "01", title: "Agende Online", desc: "Selecione seu produto, escolha a marca e descreva o problema. Uma OS é gerada automaticamente." },
              { num: "02", title: "Receba o Técnico", desc: "O técnico especializado irá até você no horário combinado." },
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
          DIFERENCIAIS — Centralizado com chips compactos
         ══════════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-14 relative" data-testid="differentials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Centered text */}
          <motion.div className="text-center max-w-2xl mx-auto mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-3 block">Diferenciais</span>
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-slate-900 leading-[1.1] mb-3">
              Por que confiar na Mastermaq?
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Seu produto merece o melhor cuidado. Descubra o que nos diferencia.
            </p>
          </motion.div>

          {/* Chips grid — compact */}
          <motion.div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            {DIFFERENTIALS.map((d) => (
              <motion.div key={d.title} variants={fadeUp}
                className="group flex items-center gap-3 bg-white border border-slate-200 px-5 py-3 hover:border-blue-500/40 hover:shadow-md transition-all duration-300">
                <div className="w-9 h-9 bg-slate-50 group-hover:bg-blue-600 flex items-center justify-center shrink-0 transition-colors duration-300">
                  <d.icon className="w-4.5 h-4.5 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm text-slate-900 leading-tight">{d.title}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          DEPOIMENTOS — Layout mapa mental com logo central
         ══════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-18 bg-slate-50 relative overflow-hidden" data-testid="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header centered */}
          <motion.div className="text-center mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-3 block">Depoimentos</span>
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-slate-900 whitespace-nowrap">O que nossos clientes dizem</h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="flex gap-0.5">
                {[1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                <Star className="w-4 h-4 fill-yellow-400/30 text-yellow-400/30" />
              </div>
              <span className="text-sm font-semibold text-slate-700">4,1</span>
              <span className="text-xs text-slate-400">134 avaliações no Google</span>
            </div>
          </motion.div>

          {/* Mind map layout — logo center, reviews around */}
          <div className="relative">
          {/* Reviews grid — 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TESTIMONIALS.slice(0, 3).map((t, i) => (
                <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.5, delay: i * 0.08 } } }}
                  className="bg-white border border-slate-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <span className="text-[10px] text-slate-400">{t.time}</span>
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed mb-4 italic line-clamp-3">"{t.text}"</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-blue-600 flex items-center justify-center text-white font-heading font-semibold text-[10px] rounded-full">
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

            {/* Second row — offset */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 lg:px-16">
              {TESTIMONIALS.slice(3, 6).map((t, i) => (
                <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.5, delay: 0.3 + i * 0.08 } } }}
                  className="bg-white border border-slate-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <span className="text-[10px] text-slate-400">{t.time}</span>
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed mb-4 italic line-clamp-3">"{t.text}"</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-slate-200 flex items-center justify-center text-slate-600 font-heading font-semibold text-[10px] rounded-full">
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

            {/* Third row — remaining 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 max-w-2xl mx-auto">
              {TESTIMONIALS.slice(6).map((t, i) => (
                <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.5, delay: 0.5 + i * 0.08 } } }}
                  className="bg-white border border-slate-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <span className="text-[10px] text-slate-400">{t.time}</span>
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed mb-4 italic line-clamp-3">"{t.text}"</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-slate-200 flex items-center justify-center text-slate-600 font-heading font-semibold text-[10px] rounded-full">
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
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA FINAL — Glow estilo SaaS com metricas
         ══════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-16 bg-[#030014] relative overflow-hidden" data-testid="final-cta">
        {/* Glow radial */}
        <div className="absolute -top-[80px] -right-[80px] w-[400px] h-[400px] bg-[#0a84ff] rounded-full z-0" style={{ filter: 'blur(140px)', opacity: 0.2 }} />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/15 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left content — 7 col */}
            <motion.div className="lg:col-span-7" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft}>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[-0.02em] text-white leading-[1.15] mb-4">
                Não deixe seu produto parado
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mb-6 leading-relaxed">
                Agende uma visita técnica e tenha seu produto funcionando perfeitamente.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Button
                  onClick={() => document.getElementById('scheduling-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-blue-600/90 border border-blue-500/50 text-white hover:bg-blue-600 px-7 py-3.5 text-sm font-semibold h-auto hover:scale-[1.02] transition-all duration-200 shadow-[0_0_24px_rgba(10,132,255,0.35)]"
                  data-testid="final-cta-btn">
                  Resolver meu produto <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <a href="tel:+553134225293" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" /> (31) 3422-5293
                </a>
              </div>
            </motion.div>

            {/* Right — Metrics 2x2 (5 col) */}
            <motion.div className="lg:col-span-5" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeRight}>
              <div className="grid grid-cols-2">
                {[
                  { num: "30+", label: "Anos de Experiência" },
                  { num: "28000+", label: "Clientes Atendidos" },
                  { num: "8+", label: "Marcas Autorizadas" },
                  { num: "98%", label: "Satisfação" },
                ].map((s) => (
                  <div key={s.label} className="border border-white/10 p-5 sm:p-6 text-center">
                    <p className="font-heading text-2xl sm:text-3xl font-bold text-white mb-1">{s.num}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">{s.label}</p>
                  </div>
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

