import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, Phone, Mail, MapPin, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/blog', label: 'Blog' },
  { to: '/contato', label: 'Contato' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50" data-testid="header">
      {/* Top info bar */}
      <div className={`bg-slate-50 border-b border-slate-100 transition-all duration-300 ${scrolled ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex items-center justify-between py-1.5 text-[11px] text-slate-500">
            <div className="flex items-center gap-5">
              <a href="mailto:mastermaqassistencia@gmail.com" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors" data-testid="header-email">
                <Mail className="w-3 h-3" /> mastermaqassistencia@gmail.com
              </a>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> R. Descalvado, 636A - Renascenca, BH/MG
              </span>
            </div>
            <a href="tel:+553134225293" className="flex items-center gap-1.5 font-medium hover:text-blue-600 transition-colors" data-testid="header-phone">
              <Phone className="w-3 h-3" /> (31) 3422-5293
            </a>
          </div>
        </div>
      </div>

      {/* Main nav bar — always white */}
      <div className={`bg-white border-b border-slate-200 transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2" data-testid="header-logo">
              <img src="/images/assets/mastermaq-logo.png" alt="Mastermaq" className="h-9 sm:h-10 w-auto" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-7" data-testid="desktop-nav">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-[13px] font-medium tracking-wide transition-colors duration-200 ${
                    location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to))
                      ? 'text-blue-600'
                      : 'text-slate-600 hover:text-blue-600'
                  }`}
                  data-testid={`nav-link-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2">
                  <Link to="/minha-conta">
                    <Button variant="outline" className="text-[13px] border-slate-200 text-slate-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all" data-testid="header-portal-btn">
                      <User className="w-3.5 h-3.5 mr-1.5" />Minha Conta
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={logout} className="text-slate-500 hover:text-white hover:bg-red-600 transition-all" data-testid="header-logout-btn">
                    <LogOut className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700 text-[13px] px-5 h-9" data-testid="header-login-btn">
                    Entrar
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Toggle */}
            <button className="md:hidden p-2 text-slate-600" onClick={() => setOpen(!open)} data-testid="mobile-menu-toggle">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-lg" data-testid="mobile-menu">
          <div className="max-w-7xl mx-auto px-4 pb-4 pt-2">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                  className={`text-sm font-medium px-3 py-2.5 rounded transition-colors ${location.pathname === link.to ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 px-3 py-1 text-xs text-slate-500">
                <Phone className="w-3 h-3" /> (31) 3422-5293
              </div>
              <div className="flex items-center gap-2 px-3 py-1 text-xs text-slate-500">
                <Mail className="w-3 h-3" /> mastermaqassistencia@gmail.com
              </div>
              <div className="mt-2">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Link to="/minha-conta" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full text-sm" data-testid="mobile-portal-btn">Minha Conta</Button>
                    </Link>
                    <Button variant="ghost" className="w-full text-sm text-red-600" onClick={() => { logout(); setOpen(false); }} data-testid="mobile-logout-btn">Sair</Button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-blue-600 text-white text-sm" data-testid="mobile-login-btn">Entrar</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
