import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const FOOTER_LINKS = [
  { title: 'Serviços', links: [
    { to: '/servicos', label: 'Todos os Serviços' },
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
    <footer className="bg-white border-t border-slate-200" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand — 5 col */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 mb-5">
              <img src="/images/assets/mastermaq-logo.png" alt="Mastermaq" className="h-10 w-auto" />
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-7 max-w-sm">
              Assistência Técnica Autorizada em Belo Horizonte. Especialistas em refrigeracao e eletrodomésticos de alto padrão com mais de 30 anos de experiência.
            </p>
            <div className="flex flex-col gap-3 text-sm text-slate-500">
              <a href="tel:+553134225293" className="flex items-center gap-3 hover:text-blue-600 transition-colors duration-200">
                <div className="w-8 h-8 bg-blue-50 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                </div>
                (31) 3422-5293
              </a>
              <a href="mailto:mastermaqassistencia@gmail.com" className="flex items-center gap-3 hover:text-blue-600 transition-colors duration-200">
                <div className="w-8 h-8 bg-blue-50 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                </div>
                mastermaqassistencia@gmail.com
              </a>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                </div>
                R. Descalvado, 636A - Renascenca, BH/MG
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                </div>
                Seg-Sex: 09:00-18:00
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {FOOTER_LINKS.map((col, i) => (
            <div key={col.title} className={`${i === 0 ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
              <h4 className="font-heading font-semibold text-[11px] uppercase tracking-[0.2em] text-slate-900 mb-5">{col.title}</h4>
              <ul className="flex flex-col gap-3">
                {col.links.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-slate-500 hover:text-blue-600 transition-colors duration-200">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">
            {new Date().getFullYear()} Mastermaq Assistência Técnica. CNPJ: 19.955.560/0001-28. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-[11px] text-slate-400">
            <span className="hover:text-slate-600 cursor-pointer transition-colors">Termos de Serviço</span>
            <span className="hover:text-slate-600 cursor-pointer transition-colors">Politica de Privacidade</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
