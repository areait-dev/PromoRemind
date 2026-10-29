import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';

const NAV_LINKS = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Gestione', icon: Server, href: '/gestione' },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);


  // Sigla: prime due lettere dell'email (areait@... -> AR)
  const initials = (user?.email ?? '?').replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || '?';

  // Smart Visibility Logic: un solo listener, aggiornato al massimo una volta per frame
  useEffect(() => {
    let ticking = false;

    const update = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Vuoi uscire?',
      showCancelButton: true,
      confirmButtonText: 'Esci',
      cancelButtonText: 'Annulla',
      reverseButtons: true,
      width: '360px',
      customClass: {
        popup: 'ds-popup',
        confirmButton: 'ds-confirm-btn',
        cancelButton: 'ds-cancel-btn',
        actions: 'ds-actions',
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        signOut();
      }
    });
  };

  return (
    <nav className={`
      fixed bottom-20 md:bottom-20 inset-x-0 z-50 
      transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] 
      flex justify-center px-4 md:px-4
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0 pointer-events-none'}
    `}>
      {/* Barra di navigazione */}
      <div className={`
        relative w-[80%] md:w-full max-w-3xl flex items-center justify-between overflow-hidden
        transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        bg-surface border border-divider
        ${isScrolled
          ? 'h-12 rounded-card'
          : 'h-14 md:h-16 rounded-card'
        }
      `}>

        {/* Logo Section - Hooked to the left edge */}
        <Link to="/dashboard" className="flex items-center gap-3 pl-3 md:pl-4 z-10" aria-label="PromoRemind — Dashboard">
          <Logo variant="icon" className="h-9 sm:hidden" />
          <Logo className="hidden sm:inline-flex h-3.5 md:h-5" />
        </Link>

        {/* Main Nav (Icons only on mobile) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-1 md:gap-2 pointer-events-auto">
            {NAV_LINKS.map(({ name, icon: Icon, href }) => {
              const active = pathname === href;
              return (
                <Link
                  key={name}
                  to={href}
                  className={`
                    flex items-center gap-3 px-3 md:px-5 py-2 md:py-2.5 rounded-card md:rounded-full transition-all duration-300
                    outline-hidden focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent
                    select-none active:scale-95
                    ${active
                      ? 'text-link'
                      : 'text-muted hover:text-link'
                    }
                  `}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <Icon size={25} className={`md:w-5 md:h-5 transition-transform duration-300`} />
                  <span className="hidden md:block text-xs font-semibold uppercase tracking-wider">{name}</span>
                </Link>
              );
            })}
            <div className="h-6 w-px bg-line/20 mx-2" />
            <ThemeToggle />
          </div>
        </div>

        {/* Profile Section - Hooked to the right edge */}
        <div className="flex items-center z-10">
          <button
            onClick={handleLogout}
            aria-label="Esci"
            className="group flex items-center transition-all duration-500"
          >
            <div className="max-w-0 overflow-hidden group-hover:max-w-[80px] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] hidden sm:block">
              <span className="ml-4 mr-2 text-xs font-semibold uppercase tracking-wider text-error whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                Esci
              </span>
            </div>
            <div className={`
              rounded-full flex items-center justify-center bg-elevated border border-divider text-link font-semibold tracking-wide transition-all duration-500 group-hover:border-accent
              ${isScrolled ? 'h-11 w-11 text-sm' : 'h-14 w-14 text-base'}
            `}>
              {initials}
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}