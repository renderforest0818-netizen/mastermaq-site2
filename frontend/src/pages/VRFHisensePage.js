import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import SchedulingModal from '@/components/SchedulingModal';
import {
  ArrowRight, Phone, ChevronDown, ChevronRight,
  Snowflake, Wifi, Leaf, Shield, Zap, Wind, ThermometerSun, Building2, Wrench, CheckCircle2
} from 'lucide-react';
import Marquee from 'react-fast-marquee';

/* ── Animation variants ── */
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] } }
});
const fadeLeft = (delay = 0) => ({
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] } }
});
const fadeRight = (delay = 0) => ({
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] } }
});
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

/* ── Reveal on scroll component ── */
function Reveal({ children, className, variants, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} className={className}
      initial="hidden" animate={isInView ? "visible" : "hidden"}
      variants={variants || fadeUp(delay)}>
      {children}
    </motion.div>
  );
}

/* ── FAQ Item ── */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 py-5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left group" data-testid={`faq-${q.slice(0,20)}`}>
        <span className="font-heading font-semibold text-sm text-slate-900 pr-4 group-hover:text-blue-600 transition-colors">{q}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-sm text-slate-500 leading-relaxed mt-3">{a}</motion.p>
      )}
    </div>
  );
}

/* ── Feature stats marquee data ── */
const VRF_STATS = [
  "Ate 30% de economia de energia",
  "Controle individual por ambiente",
  "Fluido R-32 sustentavel",
  "Ate 64 unidades internas por sistema",
  "Hi-Nano: elimina virus e bacterias",
  "Monitoramento Wi-Fi inteligente",
];

/* ── Main VRF Page ── */
export default function VRFHisensePage() {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);

  return (
    <div data-testid="vrf-hisense-page">

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden" data-testid="vrf-hero"
        style={{ background: 'linear-gradient(180deg, #0a1628 0%, #060d18 100%)' }}>
        {/* Radial light behind product */}
        <div className="absolute z-[1] pointer-events-none"
          style={{
            top: '5%', right: '0', width: '60%', height: '90%',
            background: 'radial-gradient(ellipse at 70% 50%, rgba(0,76,255,0.12) 0%, transparent 60%)',
          }} />
        {/* SVG arc */}
        <svg className="absolute top-0 right-0 w-[600px] h-full z-[1] pointer-events-none opacity-40" viewBox="0 0 600 600" fill="none" preserveAspectRatio="xMaxYMid slice">
          <ellipse cx="300" cy="300" rx="250" ry="270" stroke="rgba(0,76,255,0.2)" strokeWidth="1.5" fill="none" />
          <ellipse cx="300" cy="300" rx="210" ry="230" stroke="rgba(0,76,255,0.06)" strokeWidth="0.8" fill="none" />
        </svg>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Text */}
            <div>
              <motion.div className="flex items-center gap-3 mb-6"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                <img src="/images/assets/hisense-logo.png" alt="Hisense" className="h-7 brightness-0 invert opacity-70" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400 border border-blue-400/30 px-2.5 py-1">Autorizada</span>
              </motion.div>
              <motion.h1 className="font-heading text-[2.25rem] sm:text-[3rem] lg:text-[3.5rem] font-bold tracking-[-0.03em] text-white leading-[1.08] mb-5"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
                VRF Hisense: A Solucao Definitiva em Climatizacao
              </motion.h1>
              <motion.p className="text-base text-slate-400 leading-relaxed mb-7 max-w-lg"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}>
                Mastermaq: Sua Autorizada Hisense e Especialista em Projetos VRF de Alta Performance para comercios, industrias e condominios.
              </motion.p>
              <motion.div className="flex flex-col sm:flex-row gap-3 mb-6"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
                <Button onClick={openModal} className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 text-sm font-semibold h-auto shadow-[0_0_20px_rgba(0,76,255,0.25)] hover:scale-[1.02] transition-all" data-testid="vrf-hero-cta">
                  Solicite um Orcamento <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <a href="https://wa.me/553134225293" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border border-white/15 text-white hover:bg-white/5 px-8 py-4 text-sm h-auto bg-transparent w-full sm:w-auto">
                    Fale com Especialista VRF
                  </Button>
                </a>
              </motion.div>
              <motion.div className="flex items-center gap-5 text-[12px] text-slate-500"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Pecas Originais</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Projeto Sob Medida</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Suporte Pos-Venda</span>
              </motion.div>
            </div>
            {/* Product image */}
            <motion.div className="flex justify-center"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }}>
              <img src="/images/vrf/vrf-banner.png" alt="VRF Hisense Hi-FLEXi S5" className="w-full max-w-[560px] object-contain" style={{ filter: 'drop-shadow(0 0 30px rgba(0,76,255,0.2))' }} data-testid="vrf-hero-image" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ STATS MARQUEE ═══ */}
      <section className="bg-blue-600 py-3">
        <Marquee gradient={false} speed={40}>
          {VRF_STATS.concat(VRF_STATS).map((s, i) => (
            <span key={i} className="mx-8 text-[11px] font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white/50 rounded-full" /> {s}
            </span>
          ))}
        </Marquee>
      </section>

      {/* ═══ O QUE E VRF? ═══ */}
      <section className="py-16 sm:py-20 bg-white" data-testid="vrf-what-is">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-3 block">Tecnologia VRF</span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              O que e o Sistema VRF?
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              VRF (Volume de Refrigerante Variavel) e a tecnologia mais avancada em climatizacao comercial e industrial. Um unico sistema externo alimenta ate 64 unidades internas, com controle independente de temperatura em cada ambiente.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ThermometerSun, title: "Controle Individual", desc: "Cada ambiente com temperatura independente. Conforto total para todos os setores do seu negocio." },
              { icon: Zap, title: "Economia de Energia", desc: "Tecnologia Inverter 3D ajusta a potencia em tempo real. Ate 30% de economia na conta de energia." },
              { icon: Building2, title: "Escala Empresarial", desc: "De pequenos comercios a torres corporativas. Um sistema flexivel que cresce com seu negocio." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <div className="bg-slate-50 border border-slate-200 p-8 hover:shadow-lg hover:border-blue-500/30 transition-all duration-300 group h-full">
                  <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-base text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DIFERENCIAIS HISENSE VRF — Feature cards ═══ */}
      <section className="py-16 sm:py-20 bg-slate-50" data-testid="vrf-features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-3 block">Diferenciais Exclusivos</span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Tecnologia Hisense Hi-FLEXi
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Shield, title: "Hi-Nano", desc: "Tecnologia exclusiva de purificacao que elimina 99,9% dos virus e bacterias. Ar puro e saudavel para seu ambiente.", color: "bg-emerald-600" },
              { icon: Zap, title: "Inverter 3D", desc: "Compressor de velocidade variavel que ajusta a potencia conforme a demanda. Ate 30% de economia de energia.", color: "bg-blue-600" },
              { icon: Wifi, title: "Controle Wi-Fi", desc: "Monitoramento e controle remoto via smartphone e sistemas de gestao predial BMS. Inteligencia na palma da mao.", color: "bg-violet-600" },
              { icon: Leaf, title: "Fluido R-32", desc: "Refrigerante ecologico com menor potencial de aquecimento global. Compativel com energia solar fotovoltaica.", color: "bg-teal-600" },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="bg-white border border-slate-200 p-7 hover:shadow-xl hover:-translate-y-1 hover:border-blue-500/30 transition-all duration-400 group h-full flex flex-col">
                  <div className={`w-11 h-11 ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-base text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed flex-1">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRODUCT SHOWCASE ═══ */}
      <section className="py-16 sm:py-20 bg-white overflow-hidden" data-testid="vrf-products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-12">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-3 block">Linha Completa</span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Produtos VRF Hisense</h2>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* External units */}
            <Reveal variants={fadeLeft()}>
              <div className="bg-slate-50 border border-slate-200 p-8">
                <div className="h-[220px] flex items-center justify-center mb-6">
                  <img src="/images/vrf/product_34.png" alt="Unidade Externa VRF" className="max-h-[200px] object-contain" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">Unidades Externas Hi-FLEXi S5</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">Sistema modular de alta capacidade. De 8HP a 80HP, com recuperacao de calor e operacao silenciosa para ambientes comerciais e industriais.</p>
                <ul className="space-y-2">
                  {["Alta eficiencia energetica (COP ate 4.88)", "Operacao de -25°C a 54°C", "Compressor DC Inverter duplo"].map(t => (
                    <li key={t} className="flex items-start gap-2 text-[13px] text-slate-600"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" /> {t}</li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Internal units */}
            <Reveal variants={fadeRight()}>
              <div className="bg-slate-50 border border-slate-200 p-8">
                <div className="h-[220px] flex items-center justify-center mb-6">
                  <img src="/images/vrf/product_33.png" alt="Unidades Internas VRF" className="max-h-[200px] object-contain" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">Unidades Internas</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">Variedade de modelos para cada tipo de ambiente: cassete, duto, piso-teto, parede e mais. Design moderno e operacao silenciosa.</p>
                <ul className="space-y-2">
                  {["7 tipos de unidades internas", "Operacao ultra silenciosa (ate 19dB)", "Controle individual por zona"].map(t => (
                    <li key={t} className="flex items-start gap-2 text-[13px] text-slate-600"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" /> {t}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ POR QUE MASTERMAQ ═══ */}
      <section className="py-16 sm:py-20" data-testid="vrf-why-mastermaq"
        style={{ background: 'linear-gradient(180deg, #0a1628 0%, #060d18 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-400 mb-3 block">Por Que Nos</span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-4">
              Por Que Escolher a Mastermaq para Seu VRF?
            </h2>
            <p className="text-sm text-slate-400">Mais de 30 anos de experiencia e credenciamento direto da Hisense.</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Wrench, title: "Projeto Sob Medida", desc: "Dimensionamento tecnico preciso para cada ambiente. Analise termica, calculo de carga e posicionamento otimizado de unidades." },
              { icon: Shield, title: "Instalacao Profissional", desc: "Tecnicos homologados Hisense com experiencia em Multi Split e projetos de grande porte. Pecas originais garantidas." },
              { icon: Wind, title: "Manutencao Especializada", desc: "Planos de manutencao preventiva e corretiva. Suporte pos-venda com atendimento rapido e garantia de funcionamento." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <div className="border border-white/10 bg-white/[0.03] p-8 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 group h-full">
                  <div className="w-12 h-12 border border-blue-500/30 flex items-center justify-center mb-5 group-hover:border-blue-500 transition-colors">
                    <item.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-heading font-semibold text-base text-white mb-2">{item.title}</h3>
                  <p className="text-[13px] text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { num: "30+", label: "Anos de Experiencia" },
              { num: "500+", label: "Projetos VRF" },
              { num: "100%", label: "Pecas Originais" },
              { num: "24h", label: "Suporte Tecnico" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="border border-white/10 py-6 text-center">
                  <p className="font-heading text-2xl sm:text-3xl font-bold text-white mb-1">{s.num}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-16 sm:py-20 bg-white" data-testid="vrf-faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-3 block">Duvidas Frequentes</span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Perguntas Sobre VRF</h2>
          </Reveal>

          <div data-testid="faq-list">
            {[
              { q: "O que e um sistema VRF e como funciona?", a: "VRF (Volume de Refrigerante Variavel) e um sistema de ar condicionado central que utiliza um unico circuito de refrigerante para conectar uma unidade externa a multiplas unidades internas. O compressor ajusta automaticamente o fluxo de refrigerante conforme a demanda de cada zona, proporcionando controle individual e economia de energia." },
              { q: "Qual a diferenca entre VRF e Multi Split?", a: "O VRF e uma evolucao do Multi Split. Enquanto o Multi Split tem limite de unidades internas (geralmente 4-5), o VRF suporta ate 64 unidades. O VRF tambem oferece maior eficiencia energetica, recuperacao de calor entre zonas e controle mais preciso." },
              { q: "Para que tipo de ambiente o VRF e recomendado?", a: "O VRF e ideal para edificios comerciais, escritorios, hoteis, hospitais, shoppings, condominios de alto padrao e qualquer ambiente que precise de climatizacao multi-zona com eficiencia. Projetos a partir de 200m2 ja justificam o investimento." },
              { q: "Qual o prazo de instalacao de um sistema VRF?", a: "O prazo varia conforme a complexidade do projeto. Projetos menores (ate 10 unidades) podem ser concluidos em 5-10 dias uteis. Projetos maiores podem levar de 2 a 8 semanas, incluindo dimensionamento, tubulacao e comissionamento." },
              { q: "A Mastermaq oferece garantia nos servicos VRF?", a: "Sim. Todos os servicos de instalacao e manutencao VRF possuem garantia. Por sermos autorizados Hisense, tambem atendemos equipamentos dentro da garantia do fabricante com pecas 100% originais." },
              { q: "Como solicitar um orcamento para VRF Hisense?", a: "Voce pode solicitar um orcamento atraves do formulario nesta pagina, pelo WhatsApp (31) 3422-5293, ou ligando diretamente. Nossa equipe tecnica fara uma analise do seu projeto e apresentara a melhor solucao." },
            ].map(item => <FAQItem key={item.q} q={item.q} a={item.a} />)}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="py-16 sm:py-20 relative overflow-hidden" data-testid="vrf-final-cta"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #060d18 100%)' }}>
        <div className="absolute z-0 pointer-events-none"
          style={{ top: '-80px', right: '-80px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,76,255,0.15), transparent 60%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <img src="/images/assets/hisense-logo.png" alt="Hisense" className="h-8 mx-auto mb-6 brightness-0 invert opacity-50" />
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-4">
              Solicite uma Consultoria Gratuita
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
              Nossa equipe de especialistas VRF esta pronta para dimensionar a melhor solucao para o seu projeto. Orcamento sem compromisso.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={openModal} className="bg-blue-600 text-white hover:bg-blue-700 px-10 py-4 text-sm font-semibold h-auto shadow-[0_0_20px_rgba(0,76,255,0.25)] hover:scale-[1.02] transition-all" data-testid="vrf-final-cta-btn">
                Pedir Orcamento VRF Hisense <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <a href="tel:+553134225293" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4" /> (31) 3422-5293
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <SchedulingModal open={modalOpen} onClose={() => setModalOpen(false)} equipment={{ id: 'vrf-hisense', name: 'VRF Hisense', icon: 'Server' }} />
    </div>
  );
}
