import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const FOOTER_LINKS = [
  { title: 'Servicos', links: [
    { to: '/servicos', label: 'Todos os Servicos' },
    { to: '/servicos/geladeiras', label: 'Geladeiras' },
    { to: '/servicos/ar-condicionado', label: 'Ar Condicionado' },
    { to: '/servicos/lava-e-seca', label: 'Lava e Seca' },
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
    <footer className="bg-slate-900 text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/images/assets/mastermaq-logo.png" alt="Mastermaq" className="h-10 w-auto brightness-0 invert" />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              Assistencia Tecnica Premium em Belo Horizonte. Especialistas em refrigeracao e eletrodomesticos de alto padrao.
            </p>
            <div className="flex flex-col gap-3 text-sm text-slate-400">
              <a href="tel:+553134225293" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-blue-500" />(31) 3422-5293
              </a>
              <a href="mailto:mastermaqassistencia@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-blue-500" />mastermaqassistencia@gmail.com
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />R. Descalvado, 636A - Renascenca, BH/MG
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />Seg-Sex: 8h-18h | Sab: 8h-12h
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {FOOTER_LINKS.map(col => (
            <div key={col.title}>
              <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-slate-400 hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {new Date().getFullYear()} Mastermaq Assistencia Tecnica. CNPJ: 00.000.000/0001-00. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <span className="hover:text-slate-300 cursor-pointer">Termos de Servico</span>
            <span className="hover:text-slate-300 cursor-pointer">Politica de Privacidade</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
