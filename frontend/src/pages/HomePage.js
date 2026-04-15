import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Marquee from 'react-fast-marquee';
import { Button } from '@/components/ui/button';
import SchedulingModal from '@/components/SchedulingModal';
import {
  Shield, Award, Clock, Home, ArrowRight, Star, ChevronRight, ChevronLeft, Wrench,
  Snowflake, Cog, Shirt, Droplets, Wind, AirVent, Server, Thermometer, Fan,
  Phone, CheckCircle2
} from 'lucide-react';

const ICON_MAP = { Snowflake, Cog, Shirt, Droplets, Wind, AirVent, Server, Thermometer, Fan };

/* ── Product categories with real images ── */
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

/* ── Equipment for scheduling (all types) ── */
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

/* ── Brand logos for marquee ── */
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
  { icon: Shield, title: "Pecas Originais", desc: "Utilizamos exclusivamente pecas originais de fabrica, garantindo a durabilidade e o desempenho ideal do seu equipamento." },
  { icon: Award, title: "Tecnicos Certificados", desc: "Equipe treinada e homologada pelas principais marcas. Expertise comprovada em equipamentos premium." },
  { icon: Clock, title: "Garantia de 90 Dias", desc: "Todos os servicos possuem garantia de 90 dias. Sua tranquilidade e nossa prioridade." },
  { icon: Home, title: "Atendimento Domiciliar", desc: "Nossos tecnicos vao ate voce. Diagnostico preciso e reparo no conforto do seu lar." },
  { icon: Phone, title: "Suporte Dedicado", desc: "Canal direto via WhatsApp para acompanhamento em tempo real do seu atendimento." },
  { icon: CheckCircle2, title: "Portal do Cliente", desc: "Acompanhe suas ordens de servico, historico e agende novos atendimentos pelo portal exclusivo." },
];

const TESTIMONIALS = [
  { name: "Maria Helena S.", city: "Savassi, BH", text: "Minha geladeira Liebherr parou de funcionar em pleno verao. A Mastermaq enviou um tecnico no mesmo dia. Servico impecavel, pecas originais e a geladeira voltou a funcionar perfeitamente.", rating: 5 },
  { name: "Carlos Eduardo M.", city: "Funcionarios, BH", text: "Agendei o conserto do meu ar condicionado split pelo site e fui atendido rapidamente. O tecnico era muito profissional e explicou tudo com clareza. Recomendo!", rating: 5 },
  { name: "Ana Paula O.", city: "Lourdes, BH", text: "Confio na Mastermaq ha anos para cuidar dos meus eletrodomesticos premium. O portal do cliente e fantastico - consigo acompanhar tudo. Servico de primeira!", rating: 5 },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };

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

  // Auto-cycle products every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setProdIndex(i => (i + 1) % PRODUCT_CATEGORIES[catIndex].products.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [catIndex]);

  return (
    <div className="flex flex-col items-center" data-testid="hero-carousel">
      {/* Category name with arrows */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={prevCategory}
          className="w-10 h-10 border border-white/30 flex items-center justify-center text-white/60 hover:border-white hover:text-white transition-all"
          data-testid="hero-prev"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <AnimatePresence mode="wait">
          <motion.p
            key={category.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400 min-w-[140px] text-center"
          >
            {category.name}
          </motion.p>
        </AnimatePresence>

        <button
          onClick={nextCategory}
          className="w-10 h-10 border border-white/30 flex items-center justify-center text-white/60 hover:border-white hover:text-white transition-all"
          data-testid="hero-next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Product image (fixed size container) */}
      <div className="relative w-[200px] h-[240px] sm:w-[260px] sm:h-[300px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img
            key={`${category.id}-${prodIndex}`}
            src={product.image}
            alt={`${category.name} ${product.brand}`}
            className="w-[180px] h-[220px] sm:w-[230px] sm:h-[280px] object-contain drop-shadow-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            data-testid="hero-product-image"
          />
        </AnimatePresence>
      </div>

      {/* Brand logo (fixed size, no background) */}
      <div className="mt-6 h-12 w-[140px] flex items-center justify-center px-3">
        <AnimatePresence mode="wait">
          <motion.img
            key={`logo-${category.id}-${prodIndex}`}
            src={product.logo}
            alt={product.brand}
            className="max-h-[36px] max-w-[110px] object-contain brightness-0 invert"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            data-testid="hero-brand-logo"
          />
        </AnimatePresence>
      </div>

      {/* Dots indicator */}
      <div className="flex gap-1.5 mt-4">
        {category.products.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === prodIndex ? 'bg-white w-4' : 'bg-white/30'}`} />
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
      {/* ── HERO ── */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero-bg.png" alt="" className="w-full h-full object-cover opacity-[0.12]" />
        </div>
        <div className="absolute inset-0 bg-black/70 z-[1]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 items-center">
            {/* Left: Text */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.1] mb-5" data-testid="hero-title">
                Assistencia Tecnica
                <span className="block text-red-500">Autorizada em BH</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6 max-w-lg">
                Seu equipamento merece o melhor cuidado. Conte com nossa assistencia autorizada para um diagnostico preciso e reparo eficiente com pecas originais.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <Button
                  onClick={() => document.getElementById('scheduling-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-red-600 text-white hover:bg-red-700 px-8 py-3.5 text-sm font-semibold h-auto hover:scale-[1.02] transition-all"
                  data-testid="hero-cta"
                >
                  Agendar Visita Tecnica <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <a href="https://wa.me/553134225293" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 px-8 py-3.5 text-sm h-auto bg-transparent w-full sm:w-auto" data-testid="hero-whatsapp-btn">
                    <img src="/images/assets/whatsapp-logo.png" alt="" className="w-5 h-5 mr-2 rounded-full" /> WhatsApp
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Pecas Originais</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Garantia 90 Dias</span>
              </div>
            </motion.div>

            {/* Right: Product Carousel */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <HeroCarousel />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BRAND LOGOS ── */}
      <section className="bg-white border-b border-slate-100 py-8" data-testid="brand-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-center text-slate-400 uppercase tracking-[0.2em] font-semibold mb-5">Especialistas nas Melhores Marcas</p>
          <Marquee gradient gradientColor="#ffffff" speed={30} pauseOnHover>
            {BRAND_LOGOS.map(b => (
              <div key={b.name} className="mx-10 sm:mx-12 flex items-center justify-center w-[180px] h-20 hover:scale-110 transition-transform duration-300 cursor-default">
                <img
                  src={b.src}
                  alt={b.name}
                  className="max-h-[60px] max-w-[160px] object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ── EQUIPMENT SCHEDULING ── */}
      <section id="scheduling-section" className="py-20 sm:py-28" data-testid="carousel-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">Atendimento Expresso</p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
              Qual equipamento precisa de cuidado?
            </h2>
            <p className="text-base text-slate-500 max-w-md mx-auto">Selecione o equipamento para iniciar seu atendimento com nossos especialistas.</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {ALL_EQUIPMENT.filter(eq => eq.hasImage).map((eq, i) => (
              <motion.button
                key={eq.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.5, delay: i * 0.08 } } }}
                onClick={() => openModal(eq)}
                className="bg-white border border-slate-200 p-5 flex flex-col items-center gap-3 hover:-translate-y-2 hover:shadow-xl hover:border-blue-600 transition-all duration-300 group cursor-pointer"
                data-testid={`equipment-${eq.id}`}
              >
                {eq.hasImage ? (
                  <div className="w-20 h-20 flex items-center justify-center">
                    <img src={eq.image} alt={eq.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    {(() => { const IC = ICON_MAP[eq.icon]; return <IC className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />; })()}
                  </div>
                )}
                <span className="font-heading font-medium text-sm text-slate-800 text-center">{eq.name}</span>
                <span className="text-xs text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                  Agendar <ChevronRight className="w-3 h-3" />
                </span>
              </motion.button>
            ))}
          </div>

          {/* Link to all equipment */}
          <p className="text-center text-sm text-slate-500 mt-8">
            Atendemos tambem:{' '}
            <Link to="/servicos" className="text-blue-600 hover:text-blue-800 font-medium" data-testid="see-all-services">
              Lava e Seca, Lavadoras, Ar Condicionado, Freezers, Coifas e mais <ArrowRight className="w-3 h-3 inline" />
            </Link>
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 sm:py-28 bg-slate-50" data-testid="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">Processo Simplificado</p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">Como Funciona</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { num: "01", title: "Agende Online", desc: "Selecione seu equipamento, escolha a marca e descreva o problema. Em poucos cliques, sua solicitacao e registrada e uma OS e gerada automaticamente." },
              { num: "02", title: "Receba o Tecnico", desc: "Um tecnico certificado e especializado na sua marca ira ate voce no horario combinado para diagnosticar o equipamento com precisao." },
              { num: "03", title: "Problema Resolvido", desc: "Reparo realizado com pecas originais de fabrica e garantia de 90 dias. Acompanhe tudo pelo portal do cliente." },
            ].map((s, i) => (
              <motion.div key={s.num} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.6, delay: i * 0.15 } } }}
                className="relative bg-white border border-slate-200 p-8 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 bg-blue-600 text-white font-heading font-bold text-xl flex items-center justify-center mx-auto mb-5">{s.num}</div>
                <h3 className="font-heading font-semibold text-lg text-slate-900 mb-3">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFFERENTIALS ── */}
      <section className="py-20 sm:py-28" data-testid="differentials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">Diferenciais</p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">Por que confiar na Mastermaq?</h2>
            <p className="text-base text-slate-500 mt-3 max-w-lg mx-auto">Seu equipamento premium merece o melhor cuidado. Descubra o que nos diferencia.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DIFFERENTIALS.map((d, i) => (
              <motion.div key={d.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.6, delay: i * 0.08 } } }}
                className="bg-white border border-slate-200 p-8 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-blue-50 flex items-center justify-center mb-5 group-hover:bg-blue-600 transition-colors">
                  <d.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-heading font-semibold text-base text-slate-900 mb-2">{d.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{d.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 sm:py-28 bg-slate-50" data-testid="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">Depoimentos</p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">O que nossos clientes dizem</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.6, delay: i * 0.15 } } }}
                className="bg-white border border-slate-200 p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">"{t.text}"</p>
                <div>
                  <p className="font-heading font-semibold text-sm text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.city}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 sm:py-28 bg-[#1E3A8A] relative overflow-hidden" data-testid="final-cta">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <img src="/images/assets/mastermaq-logo.png" alt="Mastermaq" className="h-12 w-auto mx-auto mb-8 brightness-0 invert opacity-80" />
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white mb-4">
              Nao deixe seu equipamento parado
            </h2>
            <p className="text-base text-blue-200 max-w-lg mx-auto mb-10">
              Agende agora sua visita tecnica e tenha seu equipamento premium funcionando perfeitamente. Atendimento rapido e garantido.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => document.getElementById('scheduling-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-red-600 text-white hover:bg-red-700 px-10 py-3.5 text-sm font-semibold h-auto hover:scale-[1.02] transition-all"
                data-testid="final-cta-btn"
              >
                Agendar Visita Agora <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <a href="tel:+553134225293">
                <Button variant="outline" className="border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 px-10 py-3.5 text-sm h-auto bg-transparent" data-testid="final-call-btn">
                  <Phone className="w-4 h-4 mr-2" /> (31) 3422-5293
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <SchedulingModal open={modalOpen} onClose={() => setModalOpen(false)} equipment={selectedEquipment} />
    </div>
  );
}
