import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, Phone, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/servicos', label: 'Servicos' },
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';
  // Header always has background for clear visibility
  const headerDark = isHome && !scrolled;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        headerDark
          ? 'bg-slate-950/90 backdrop-blur-xl border-b border-white/5'
          : 'backdrop-blur-xl bg-white/95 border-b border-slate-200 shadow-sm'
      }`}
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[68px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="header-logo">
            <img
              src="/images/assets/mastermaq-logo.png"
              alt="Mastermaq"
              className={`h-9 sm:h-10 w-auto transition-all duration-300`}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7" data-testid="desktop-nav">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-[13px] font-medium tracking-wide transition-colors duration-200 ${
                  location.pathname === link.to
                    ? headerDark ? 'text-blue-400' : 'text-blue-600'
                    : headerDark
                      ? 'text-white/90 hover:text-white'
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
            <a
              href="tel:+553134225293"
              className={`flex items-center gap-1.5 text-[13px] transition-colors duration-200 ${
                headerDark ? 'text-white/80 hover:text-white' : 'text-slate-500 hover:text-blue-600'
              }`}
              data-testid="header-phone"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>(31) 3422-5293</span>
            </a>
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/minha-conta">
                  <Button
                    variant="outline"
                    className={`text-[13px] ${
                      headerDark
                        ? 'border-white/20 text-white hover:bg-white/10 hover:border-white/40 bg-transparent'
                        : 'border-slate-200 hover:border-blue-600 hover:text-blue-600'
                    }`}
                    data-testid="header-portal-btn"
                  >
                    <User className="w-3.5 h-3.5 mr-1.5" />Minha Conta
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className={`${headerDark ? 'text-white/60 hover:text-red-400' : 'text-slate-500 hover:text-red-600'}`}
                  data-testid="header-logout-btn"
                >
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
          <button
            className={`md:hidden p-2 ${headerDark ? 'text-white' : 'text-slate-600'}`}
            onClick={() => setOpen(!open)}
            data-testid="mobile-menu-toggle"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden pb-4 border-t border-slate-100/10 mt-2 pt-4 bg-white rounded-b-lg shadow-lg" data-testid="mobile-menu">
            <nav className="flex flex-col gap-1 px-2">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`text-sm font-medium px-3 py-2.5 rounded transition-colors ${location.pathname === link.to ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-100 px-1">
                {user ? (
                  <>
                    <Link to="/minha-conta" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full text-sm" data-testid="mobile-portal-btn">Minha Conta</Button>
                    </Link>
                    <Button variant="ghost" className="w-full text-sm text-red-600" onClick={() => { logout(); setOpen(false); }} data-testid="mobile-logout-btn">Sair</Button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-blue-600 text-white text-sm" data-testid="mobile-login-btn">Entrar</Button>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
