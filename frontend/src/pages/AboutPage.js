import { motion } from 'framer-motion';
import { Shield, Users, Award, Target } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const fadeLeft = { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6 } } };

const VALUES = [
  { icon: Shield, title: "Confiança", desc: "Transparencia em todos os processos e orçamentos." },
  { icon: Users, title: "Atendimento Humano", desc: "Cada cliente e tratado de forma única e especial." },
  { icon: Award, title: "Excelência", desc: "Busca constante pela qualidade maxima." },
  { icon: Target, title: "Agilidade", desc: "Soluções rapidas sem comprometer a qualidade." },
];

export default function AboutPage() {
  return (
    <div data-testid="about-page">
      {/* Hero */}
      <section className="relative py-14 sm:py-16 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeLeft} className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-400 mb-4 block">Sobre Nos</span>
            <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-[-0.02em] text-white mb-6">Mastermaq Assistência Técnica</h1>
            <p className="text-base text-slate-400 leading-relaxed">
              Ha mais de 30 anos oferecendo serviços de excelência em manutenção e conserto de eletrodomésticos em Belo Horizonte e regiao metropolitana.
            </p>
          </motion.div>
        </div>
      </section>

      {/* History */}
      <section className="py-12 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-4 block">Nossa História</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-900 mb-6">Uma trajetoria de confiança e qualidade</h2>
              <div className="space-y-4 text-sm text-slate-500 leading-relaxed">
                <p>A Mastermaq nasceu da paixao por tecnologia e do compromisso em oferecer soluções rapidas e eficientes para o conserto de eletrodomésticos. Desde o inicio, nossa missão sempre foi clara: devolver a tranquilidade aos nossos clientes.</p>
                <p>Com uma equipe de técnicos especializados nas principais marcas do mercado, nos especializamos no atendimento a produtos de alto padrão, oferecendo um serviço diferenciado que combina expertise técnica com atendimento humanizado.</p>
                <p>Hoje, somos referência em Belo Horizonte no conserto de eletrodomésticos, atendendo marcas como Liebherr, Bertazzoni, Hisense, Samsung e muitas outras com mais de 30 anos de experiência.</p>
              </div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <img
                src="/images/hero-bg.png"
                alt="Loja Mastermaq - Centro de Serviços"
                className="w-full h-[400px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-12 sm:py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Missão", desc: "Oferecer soluções de excelência em assistência técnica, garantindo a satisfação total dos nossos clientes atraves de um atendimento rápido, transparente e de alta qualidade." },
              { title: "Visão", desc: "Ser a principal referência em assistência técnica autorizada de Belo Horizonte, reconhecida pela qualidade, agilidade e inovacao no atendimento." },
              { title: "Valores", desc: "Etica, transparencia, qualidade, comprometimento com o cliente e busca constante pela excelência em tudo que fazemos." },
            ].map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { delay: i * 0.1 } } }}
                className="bg-white border border-slate-200 p-8"
              >
                <h3 className="font-heading font-semibold text-lg text-slate-900 mb-3">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-4 block">O Que Nos Move</span>
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-900">Nossos Pilares</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <motion.div key={v.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { delay: i * 0.1 } } }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-heading font-semibold text-base text-slate-900 mb-2">{v.title}</h3>
                <p className="text-sm text-slate-500">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="py-16 bg-[#03001A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "30+", label: "Anos de Experiência" },
              { num: "28000+", label: "Clientes Atendidos" },
              { num: "8+", label: "Marcas Autorizadas" },
              { num: "98%", label: "Satisfação" },
            ].map(s => (
              <div key={s.label}>
                <p className="font-heading text-3xl sm:text-4xl font-bold text-white mb-1">{s.num}</p>
                <p className="text-sm text-blue-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
