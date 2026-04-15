import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Snowflake, Wind, Shirt, Droplets, Cog, AirVent, Server, Thermometer, Fan, ChevronRight } from 'lucide-react';

const ICON_MAP = { Snowflake, Cog, Shirt, Droplets, Wind, AirVent, Server, Thermometer, Fan };

const SERVICES = [
  { slug: "geladeiras", name: "Geladeiras", icon: "Snowflake", desc: "Conserto e manutencao de geladeiras de todas as marcas. Diagnostico preciso, pecas originais e garantia de 90 dias.", problems: ["Nao esta gelando", "Faz barulho excessivo", "Vazamento de agua", "Formacao de gelo excessiva", "Compressor com defeito"] },
  { slug: "ar-condicionado-split", name: "Ar Condicionado Split", icon: "Wind", desc: "Instalacao, manutencao e conserto de ar condicionado split. Limpeza, troca de filtro e recarga de gas.", problems: ["Nao liga", "Nao resfria", "Vazamento de agua", "Ruido excessivo", "Mau cheiro"] },
  { slug: "lava-e-seca", name: "Lava e Seca", icon: "Shirt", desc: "Reparo especializado em lava e seca. Problemas eletricos, mecanicos e de programacao.", problems: ["Nao centrifuga", "Nao seca", "Vazamento", "Ruidos estranhos", "Erro no painel"] },
  { slug: "lavadoras", name: "Lavadoras", icon: "Droplets", desc: "Manutencao e conserto de lavadoras. Atendemos todas as marcas com tecnicos certificados.", problems: ["Nao enche agua", "Nao drena", "Vibra demais", "Nao liga", "Problema na placa"] },
  { slug: "ar-condicionado-portatil", name: "Ar Condicionado Portatil", icon: "AirVent", desc: "Conserto de ar condicionado portatil de todas as marcas.", problems: ["Nao resfria", "Barulho alto", "Vazamento", "Desliga sozinho"] },
  { slug: "trituradores", name: "Trituradores", icon: "Cog", desc: "Reparo e instalacao de trituradores de alimentos. Servico rapido e garantido.", problems: ["Nao tritura", "Entupido", "Faz barulho", "Vazamento"] },
  { slug: "vrf-hisense", name: "VRF Hisense", icon: "Server", desc: "Servico autorizado Hisense para sistemas VRF. Instalacao e manutencao especializada.", problems: ["Falha no sistema", "Nao refrigera", "Erro no controlador", "Vazamento de gas"] },
  { slug: "freezers", name: "Freezers", icon: "Thermometer", desc: "Conserto de freezers verticais e horizontais. Todas as marcas e capacidades.", problems: ["Nao congela", "Forma gelo excessivo", "Motor nao desliga", "Barulho excessivo"] },
  { slug: "coifas", name: "Coifas", icon: "Fan", desc: "Manutencao e reparo de coifas e depuradores. Limpeza e troca de filtros.", problems: ["Nao aspira", "Motor com defeito", "Iluminacao nao funciona", "Barulho"] },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function ServiceDetail({ service }) {
  const IconComp = ICON_MAP[service.icon];
  return (
    <div className="py-24 sm:py-32" data-testid={`service-detail-${service.slug}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/servicos" className="text-sm text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center gap-1">
          <ChevronRight className="w-3 h-3 rotate-180" /> Todos os Servicos
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-6">
          <div>
            <div className="w-16 h-16 bg-blue-50 flex items-center justify-center mb-6">
              <IconComp className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-slate-900 mb-4">{service.name}</h1>
            <p className="text-base text-slate-500 leading-relaxed mb-8">{service.desc}</p>
            <Button className="bg-red-600 text-white hover:bg-red-700 px-8 py-3 h-auto" data-testid="service-cta">
              Agendar Conserto <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-8">
            <h3 className="font-heading font-semibold text-lg text-slate-900 mb-4">Problemas Comuns</h3>
            <ul className="space-y-3">
              {service.problems.map(p => (
                <li key={p} className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-red-600 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const { slug } = useParams();
  const service = slug ? SERVICES.find(s => s.slug === slug) : null;

  if (service) return <ServiceDetail service={service} />;

  return (
    <div className="py-24 sm:py-32" data-testid="services-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">Nossos Servicos</p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 mb-4">Servicos Especializados</h1>
          <p className="text-base text-slate-500 max-w-lg mx-auto">Atendemos todas as marcas e tipos de eletrodomesticos com tecnicos certificados.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => {
            const IconComp = ICON_MAP[s.icon];
            return (
              <motion.div key={s.slug} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { delay: i * 0.05 } } }}>
                <Link to={`/servicos/${s.slug}`} className="block bg-white border border-slate-200 p-8 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group" data-testid={`service-card-${s.slug}`}>
                  <div className="w-12 h-12 bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                    <IconComp className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-heading font-semibold text-base text-slate-900 mb-2">{s.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">{s.desc}</p>
                  <span className="text-sm text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Ver detalhes <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
