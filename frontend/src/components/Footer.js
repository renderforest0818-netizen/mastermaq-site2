import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const FOOTER_LINKS = [
  { title: 'Servicos', links: [
    { to: '/servicos', label: 'Todos os Servicos' },
    { to: '/servicos/geladeiras', label: 'Geladeiras' },
    { to: '/servicos/ar-condicionado-split', label: 'Ar Condicionado' },
    { to: '/servicos/lava-e-seca', label: 'Lava e Seca' },
    { to: '/servicos/freezers', label: 'Freezers' },
  ]},
  { title: 'Empresa', links: [
    { to: '/sobre', label: 'Sobre Nos' },
    { to: '/blog', label: 'Blog' },
    { to: '/contato', label: 'Contato' },
  ]},
  { title: 'Cliente', links: [
    { to: '/login', label: 'Entrar' },
    { to: '/cadastro', label: 'Cadastrar' },
    { to: '/minha-conta', label: 'Minha Conta' },
  ]},
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white relative" data-testid="footer">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand — 5 col */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 mb-5">
              <img src="/images/assets/mastermaq-logo.png" alt="Mastermaq" className="h-10 w-auto brightness-0 invert opacity-80" />
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-sm">
              Assistencia Tecnica Premium em Belo Horizonte. Especialistas em refrigeracao e eletrodomesticos de alto padrao com mais de 10 anos de experiencia.
            </p>
            <div className="flex flex-col gap-3.5 text-sm text-slate-500">
              <a href="tel:+553134225293" className="flex items-center gap-3 hover:text-white transition-colors duration-200">
                <div className="w-8 h-8 bg-white/5 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                </div>
                (31) 3422-5293
              </a>
              <a href="mailto:mastermaqassistencia@gmail.com" className="flex items-center gap-3 hover:text-white transition-colors duration-200">
                <div className="w-8 h-8 bg-white/5 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                </div>
                mastermaqassistencia@gmail.com
              </a>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                </div>
                R. Descalvado, 636A - Renascenca, BH/MG
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                </div>
                Seg-Sex: 8h-18h | Sab: 8h-12h
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {FOOTER_LINKS.map((col, i) => (
            <div key={col.title} className={`${i === 0 ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
              <h4 className="font-heading font-semibold text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-5">{col.title}</h4>
              <ul className="flex flex-col gap-3">
                {col.links.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-slate-500 hover:text-white transition-colors duration-200">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-600">
            {new Date().getFullYear()} Mastermaq Assistencia Tecnica. CNPJ: 00.000.000/0001-00. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-[11px] text-slate-600">
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Termos de Servico</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Politica de Privacidade</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
