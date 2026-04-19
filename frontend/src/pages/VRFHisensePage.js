import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import SchedulingModal from '@/components/SchedulingModal';
import {
  ArrowRight, Phone, ChevronDown, ChevronLeft, ChevronRight,
  Snowflake, Wifi, Leaf, Shield, Zap, Wind, ThermometerSun, Building2, Wrench, CheckCircle2
} from 'lucide-react';

/* ── Reveal component — fade + translateY, no glow ── */
function R({ children, className, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

/* ── FAQ ── */
function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left py-6 group">
        <span className="font-heading font-semibold text-[15px] tracking-wide text-slate-900 pr-6 group-hover:text-blue-600 transition-colors">{q}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="text-sm text-slate-500 leading-relaxed pb-6 -mt-2">{a}</p>}
    </div>
  );
}

/* ── Product carousel ── */
const PRODUCTS = [
  { img: "/images/vrf/product_34.png", name: "Unidade Externa Hi-FLEXi S5", cat: "Condensadora" },
  { img: "/images/vrf/product_25.png", name: "Cassete 4 Vias", cat: "Unidade Interna" },
  { img: "/images/vrf/product_27.png", name: "Duto Alta Pressao", cat: "Unidade Interna" },
  { img: "/images/vrf/product_28.png", name: "Piso Teto", cat: "Unidade Interna" },
  { img: "/images/vrf/product_29.png", name: "Cassete 1 Via", cat: "Unidade Interna" },
  { img: "/images/vrf/product_30.png", name: "Hi-Wall Inverter", cat: "Unidade Interna" },
  { img: "/images/vrf/product_32.png", name: "Cassete Compacto", cat: "Unidade Interna" },
  { img: "/images/vrf/product_35.png", name: "Duto Slim", cat: "Unidade Interna" },
  { img: "/images/vrf/product_26.png", name: "Console", cat: "Unidade Interna" },
];

function ProductCarousel() {
  const ref = useRef(null);
  const scroll = (d) => ref.current?.scrollBy({ left: d === 'r' ? 300 : -300, behavior: 'smooth' });
  return (
    <div className="relative">
      <div className="flex justify-end gap-2 mb-6">
        <button onClick={() => scroll('l')} className="w-10 h-10 border border-slate-200 flex items-center justify-center hover:border-slate-400 transition-colors"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
        <button onClick={() => scroll('r')} className="w-10 h-10 border border-slate-200 flex items-center justify-center hover:border-slate-400 transition-colors"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
      </div>
      <div ref={ref} className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4" style={{ scrollbarWidth: 'none' }}>
        {PRODUCTS.map(p => (
          <div key={p.name} className="flex-shrink-0 w-[240px] snap-start group">
            <div className="bg-slate-50 border border-slate-200 h-[180px] flex items-center justify-center p-4 mb-4 group-hover:border-slate-300 group-hover:shadow-sm transition-all">
              <img src={p.img} alt={p.name} className="max-h-[150px] max-w-[200px] object-contain group-hover:scale-105 transition-transform duration-500" />
            </div>
            <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider mb-1">{p.cat}</p>
            <p className="font-heading font-semibold text-sm text-slate-900">{p.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function VRFHisensePage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div data-testid="vrf-hisense-page" className="bg-white">

      {/* ═══ HERO — Produto direita, texto esquerda, iluminacao controlada ═══ */}
      <section className="relative overflow-hidden" data-testid="vrf-hero"
        style={{ background: 'radial-gradient(ellipse at 95% 0%, rgba(0,76,255,0.12) 0%, transparent 35%), linear-gradient(180deg, #080e1a 0%, #060d18 100%)' }}>

        {/* SVG arc around product — controlled, no blur */}
        <svg className="absolute top-0 right-0 w-[600px] h-full z-[1] pointer-events-none" viewBox="0 0 600 600" fill="none" preserveAspectRatio="xMaxYMid slice">
          <defs>
            <linearGradient id="vrfArc" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#004cff" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#004cff" stopOpacity="0.2" />
              <stop offset="80%" stopColor="#004cff" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#004cff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <ellipse cx="320" cy="300" rx="230" ry="260" stroke="url(#vrfArc)" strokeWidth="2" fill="none" />
          <ellipse cx="320" cy="300" rx="195" ry="225" stroke="rgba(0,76,255,0.05)" strokeWidth="0.8" fill="none" />
        </svg>

        {/* Radial light behind product */}
        <div className="absolute z-[1] pointer-events-none" style={{ top: '10%', right: '5%', width: '400px', height: '450px', background: 'radial-gradient(circle, rgba(0,76,255,0.15) 0%, transparent 55%)' }} />

        {/* Floor reflection */}
        <div className="absolute z-[1] pointer-events-none" style={{ bottom: 0, right: '8%', width: '300px', height: '40px', background: 'radial-gradient(ellipse at 50% 100%, rgba(0,76,255,0.2) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <motion.div className="flex items-center gap-3 mb-8"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <img src="/images/assets/hisense-logo.png" alt="Hisense" className="h-8" />
              </motion.div>
              <motion.h1 className="font-heading text-[2.5rem] sm:text-[3.25rem] lg:text-[3.75rem] font-bold tracking-[0.01em] text-white leading-[1.08] mb-6"
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                VRF Hisense
              </motion.h1>
              <motion.p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-md tracking-wide"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
                A solucao definitiva em climatizacao para seu negocio. Projeto, instalacao e manutencao especializada.
              </motion.p>
              <motion.div className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
                <Button onClick={() => setModalOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 text-sm font-semibold h-auto hover:scale-[1.01] transition-all" data-testid="vrf-hero-cta">
                  Receba um projeto personalizado <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <a href="tel:+553134225293" className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors py-4">
                  <Phone className="w-4 h-4" /> (31) 3422-5293
                </a>
              </motion.div>
            </div>

            {/* Right: Product with hover animation */}
            <motion.div className="flex justify-center relative z-[3]"
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.15 }}>
              <motion.img
                src="/images/vrf/product_34.png"
                alt="VRF Hisense Hi-FLEXi S5"
                className="w-[320px] sm:w-[380px] object-contain cursor-pointer"
                style={{ filter: 'drop-shadow(0 0 25px rgba(0,76,255,0.3))' }}
                whileHover={{ rotateY: 8, rotateX: -3, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 200 }}
                data-testid="vrf-hero-image"
              />
            </motion.div>
          </div>

          {/* Benefits row */}
          <motion.div className="grid grid-cols-3 gap-6 mt-16 pt-10 border-t border-white/10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
            {[
              { num: "30%", label: "Economia de energia" },
              { num: "64", label: "Unidades internas por sistema" },
              { num: "R-32", label: "Fluido ecologico" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">{s.num}</p>
                <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ O QUE E VRF — Clean, spacious ═══ */}
      <section className="py-24 sm:py-32" data-testid="vrf-what-is">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <R className="max-w-2xl mb-20">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600 mb-4">Tecnologia</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-5">O que e o Sistema VRF?</h2>
            <p className="text-base text-slate-500 leading-relaxed">
              VRF (Volume de Refrigerante Variavel) e a tecnologia mais avancada em climatizacao comercial. Um unico sistema externo alimenta dezenas de unidades internas com controle independente por ambiente.
            </p>
          </R>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ThermometerSun, title: "Controle Individual", desc: "Cada ambiente com temperatura independente. Conforto total para todos os setores." },
              { icon: Zap, title: "Economia de Energia", desc: "Tecnologia Inverter 3D ajusta a potencia em tempo real. Ate 30% de economia." },
              { icon: Building2, title: "Escala Empresarial", desc: "De pequenos comercios a torres corporativas. Um sistema que cresce com voce." },
            ].map((item, i) => (
              <R key={item.title} delay={i * 0.1}>
                <div className="p-8 border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group h-full">
                  <item.icon className="w-7 h-7 text-blue-600 mb-6" />
                  <h3 className="font-heading font-semibold text-base tracking-wide text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES — 4 cards, Fizens style ═══ */}
      <section className="py-24 sm:py-32 bg-slate-50" data-testid="vrf-features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <R className="text-center max-w-2xl mx-auto mb-20">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600 mb-4">Diferenciais</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Tecnologia Hisense Hi-FLEXi</h2>
          </R>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: Shield, title: "Hi-Nano", desc: "Tecnologia exclusiva que elimina 99,9% de virus e bacterias. Ar purificado para ambientes saudaveis.", img: "/images/vrf/product_25.png" },
              { icon: Zap, title: "Inverter 3D", desc: "Compressor de velocidade variavel. Ajusta a potencia conforme a demanda para economia maxima.", img: "/images/vrf/product_29.png" },
              { icon: Wifi, title: "Controle Wi-Fi", desc: "Monitoramento e controle remoto via smartphone e sistemas de gestao predial BMS.", img: "/images/vrf/product_30.png" },
              { icon: Leaf, title: "Fluido R-32", desc: "Refrigerante ecologico com menor impacto ambiental. Compativel com energia solar fotovoltaica.", img: "/images/vrf/product_28.png" },
            ].map((f, i) => (
              <R key={f.title} delay={i * 0.08}>
                <div className="bg-white border border-slate-200 p-8 hover:shadow-md hover:border-slate-300 transition-all group h-full flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <f.icon className="w-6 h-6 text-blue-600 mb-4" />
                      <h3 className="font-heading font-semibold text-lg tracking-wide text-slate-900">{f.title}</h3>
                    </div>
                    <img src={f.img} alt={f.title} className="w-20 h-20 object-contain opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">{f.desc}</p>
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRODUCTS CAROUSEL ═══ */}
      <section className="py-24 sm:py-32" data-testid="vrf-products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <R className="mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600 mb-4">Linha Completa</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Produtos VRF Hisense</h2>
          </R>
          <ProductCarousel />
        </div>
      </section>

      {/* ═══ ALTERNATING BLOCKS — Por que Mastermaq ═══ */}
      <section className="py-24 sm:py-32 bg-slate-50" data-testid="vrf-why-mastermaq">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <R className="max-w-2xl mb-20">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600 mb-4">Por Que Nos</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Por Que Escolher a Mastermaq?</h2>
          </R>

          {/* Block 1 — image left, text right */}
          <R className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="bg-white border border-slate-200 p-8 flex items-center justify-center h-[300px]">
              <img src="/images/vrf/product_33.png" alt="Projeto VRF" className="max-h-[250px] object-contain" />
            </div>
            <div>
              <Wrench className="w-6 h-6 text-blue-600 mb-4" />
              <h3 className="font-heading font-semibold text-xl tracking-wide text-slate-900 mb-4">Projeto Sob Medida</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">Dimensionamento tecnico preciso para cada ambiente. Analise termica, calculo de carga e posicionamento otimizado.</p>
              <ul className="space-y-3">
                {["Visita tecnica para avaliacao", "Projeto com memorial de calculo", "Orcamento detalhado sem compromisso"].map(t => (
                  <li key={t} className="flex items-start gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" /> {t}</li>
                ))}
              </ul>
            </div>
          </R>

          {/* Block 2 — text left, image right */}
          <R className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 lg:order-1">
              <Shield className="w-6 h-6 text-blue-600 mb-4" />
              <h3 className="font-heading font-semibold text-xl tracking-wide text-slate-900 mb-4">Instalacao Profissional</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">Tecnicos homologados Hisense com experiencia em Multi Split e projetos de grande porte. Pecas originais garantidas.</p>
              <ul className="space-y-3">
                {["Tecnicos certificados pelo fabricante", "Experiencia com projetos complexos", "Comissionamento e testes completos"].map(t => (
                  <li key={t} className="flex items-start gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" /> {t}</li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 bg-white border border-slate-200 p-8 flex items-center justify-center h-[300px]">
              <img src="/images/vrf/hisense_vrf_19.png" alt="Instalacao VRF" className="max-h-[250px] object-contain" />
            </div>
          </R>

          {/* Block 3 — image left, text right */}
          <R className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="bg-white border border-slate-200 p-8 flex items-center justify-center h-[300px]">
              <img src="/images/vrf/product_31.png" alt="Manutencao VRF" className="max-h-[250px] object-contain" />
            </div>
            <div>
              <Wind className="w-6 h-6 text-blue-600 mb-4" />
              <h3 className="font-heading font-semibold text-xl tracking-wide text-slate-900 mb-4">Manutencao Especializada</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">Planos de manutencao preventiva e corretiva. Suporte pos-venda com atendimento rapido e garantia de funcionamento.</p>
              <ul className="space-y-3">
                {["Planos preventivos personalizados", "Atendimento emergencial 24h", "Pecas originais Hisense"].map(t => (
                  <li key={t} className="flex items-start gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" /> {t}</li>
                ))}
              </ul>
            </div>
          </R>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: "30+", label: "Anos de experiencia" },
              { num: "500+", label: "Projetos VRF" },
              { num: "100%", label: "Pecas originais" },
              { num: "24h", label: "Suporte tecnico" },
            ].map((s, i) => (
              <R key={s.label} delay={i * 0.08} className="text-center">
                <p className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{s.num}</p>
                <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-2">{s.label}</p>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — Steps ═══ */}
      <section className="py-24 sm:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <R className="text-center max-w-2xl mx-auto mb-20">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600 mb-4">Como Funciona</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Do Projeto a Instalacao</h2>
          </R>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Consultoria", desc: "Nossa equipe visita seu espaco, avalia necessidades e dimensiona o sistema ideal para o seu projeto." },
              { num: "02", title: "Projeto Tecnico", desc: "Elaboramos o projeto completo com memorial de calculo, posicionamento e orcamento detalhado." },
              { num: "03", title: "Instalacao e Suporte", desc: "Tecnicos homologados instalam o sistema, fazem comissionamento e oferecem suporte continuo." },
            ].map((s, i) => (
              <R key={s.num} delay={i * 0.12}>
                <div className="text-center p-8">
                  <span className="font-heading text-5xl font-bold text-slate-200 block mb-6">{s.num}</span>
                  <h3 className="font-heading font-semibold text-base tracking-wide text-slate-900 mb-3">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-24 sm:py-32 bg-white" data-testid="vrf-faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <R className="text-center mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600 mb-4">Duvidas</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Perguntas Frequentes</h2>
          </R>

          <div>
            {[
              { q: "O que e um sistema VRF e como funciona?", a: "VRF (Volume de Refrigerante Variavel) e um sistema de ar condicionado central que utiliza um unico circuito de refrigerante para conectar uma unidade externa a multiplas unidades internas. O compressor ajusta automaticamente o fluxo conforme a demanda de cada zona." },
              { q: "Qual a diferenca entre VRF e Multi Split?", a: "O VRF suporta ate 64 unidades internas (Multi Split geralmente 4-5), oferece maior eficiencia, recuperacao de calor entre zonas e controle mais preciso. E a evolucao natural do Multi Split para projetos maiores." },
              { q: "Para que tipo de ambiente o VRF e recomendado?", a: "Edificios comerciais, escritorios, hoteis, hospitais, shoppings, condominios de alto padrao. Projetos a partir de 200m2 ja justificam o investimento em VRF." },
              { q: "Qual o prazo de instalacao?", a: "Projetos menores (ate 10 unidades): 5-10 dias uteis. Projetos maiores: 2 a 8 semanas, incluindo dimensionamento, tubulacao e comissionamento." },
              { q: "A Mastermaq oferece garantia?", a: "Sim. Todos os servicos possuem garantia. Por sermos autorizados Hisense, tambem atendemos dentro da garantia do fabricante com pecas 100% originais." },
              { q: "Como solicitar um orcamento?", a: "Pelo formulario nesta pagina, WhatsApp (31) 3422-5293, ou ligando diretamente. Nossa equipe fara uma analise do seu projeto e apresentara a melhor solucao." },
            ].map(f => <FAQ key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="py-24 sm:py-32" data-testid="vrf-final-cta"
        style={{ background: 'linear-gradient(180deg, #080e1a 0%, #060d18 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <R>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6">
              Receba um projeto de climatizacao personalizado
            </h2>
            <p className="text-base text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
              Nossa equipe de especialistas VRF esta pronta para dimensionar a melhor solucao. Orcamento sem compromisso.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={() => setModalOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700 px-10 py-4 text-sm font-semibold h-auto hover:scale-[1.01] transition-all" data-testid="vrf-final-cta-btn">
                Solicitar Consultoria Gratuita <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <a href="tel:+553134225293" className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors py-4">
                <Phone className="w-4 h-4" /> (31) 3422-5293
              </a>
            </div>
          </R>
        </div>
      </section>

      <SchedulingModal open={modalOpen} onClose={() => setModalOpen(false)} equipment={{ id: 'vrf-hisense', name: 'VRF Hisense', icon: 'Server' }} />
    </div>
  );
}
