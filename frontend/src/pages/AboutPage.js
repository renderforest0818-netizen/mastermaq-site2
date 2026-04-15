import { motion } from 'framer-motion';
import { Shield, Users, Award, Target, Wrench, CheckCircle2 } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const VALUES = [
  { icon: Shield, title: "Confianca", desc: "Transparencia em todos os processos e orcamentos." },
  { icon: Users, title: "Atendimento Humano", desc: "Cada cliente e tratado de forma unica e especial." },
  { icon: Award, title: "Excelencia", desc: "Busca constante pela qualidade maxima." },
  { icon: Target, title: "Agilidade", desc: "Solucoes rapidas sem comprometer a qualidade." },
];

export default function AboutPage() {
  return (
    <div data-testid="about-page">
      {/* Hero */}
      <section className="relative py-24 sm:py-32 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-4">Sobre Nos</p>
            <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-6">Mastermaq Assistencia Tecnica</h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Ha mais de 10 anos oferecendo servicos de excelencia em manutencao e conserto de eletrodomesticos em Belo Horizonte e regiao metropolitana.
            </p>
          </motion.div>
        </div>
      </section>

      {/* History */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">Nossa Historia</p>
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-900 mb-6">Uma trajetoria de confianca e qualidade</h2>
              <div className="space-y-4 text-sm text-slate-500 leading-relaxed">
                <p>A Mastermaq nasceu da paixao por tecnologia e do compromisso em oferecer solucoes rapidas e eficientes para o conserto de eletrodomesticos. Desde o inicio, nossa missao sempre foi clara: devolver a tranquilidade aos nossos clientes.</p>
                <p>Com uma equipe de tecnicos certificados pelas principais marcas do mercado, nos especializamos no atendimento a equipamentos premium, oferecendo um servico diferenciado que combina expertise tecnica com atendimento humanizado.</p>
                <p>Hoje, somos referencia em Belo Horizonte no conserto de eletrodomesticos de alto padrao, atendendo marcas como Liebherr, Bertazzoni, Hisense, Samsung e muitas outras.</p>
              </div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <img
                src="https://images.unsplash.com/photo-1615467500370-0395bf8932e4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjB0ZWNobmljaWFuJTIwcmVwYWlyaW5nJTIwYXBwbGlhbmNlfGVufDB8fHx8MTc3NjEyNTY4NXww&ixlib=rb-4.1.0&q=85"
                alt="Tecnico Mastermaq"
                className="w-full h-[400px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 sm:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Missao", desc: "Oferecer solucoes de excelencia em assistencia tecnica, garantindo a satisfacao total dos nossos clientes atraves de um atendimento rapido, transparente e de alta qualidade." },
              { title: "Visao", desc: "Ser a principal referencia em assistencia tecnica premium de Belo Horizonte, reconhecida pela qualidade, agilidade e inovacao no atendimento." },
              { title: "Valores", desc: "Etica, transparencia, qualidade, comprometimento com o cliente e busca constante pela excelencia em tudo que fazemos." },
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
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">O Que Nos Move</p>
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
      <section className="py-16 bg-[#1E3A8A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "10+", label: "Anos de Experiencia" },
              { num: "5000+", label: "Clientes Atendidos" },
              { num: "15+", label: "Marcas Atendidas" },
              { num: "98%", label: "Satisfacao" },
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
