import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Menu, X, User, Search, Home, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };
  
  const breederNav = [
    { name: 'Dashboard', path: '/dashboard/breeder', icon: Home },
    { name: 'My Profile', path: `/breeder/${user?.id}`, icon: User }
  ];

  const buyerNav = [
    { name: 'Trust Score Info', path: '/trust-score-info', icon: Shield }
  ];

  const roleNav = profile?.role === 'breeder' || profile?.role === 'both' ? breederNav : buyerNav;

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-morphism shadow-lg' : 'bg-transparent'
        }`}
        data-testid="main-header"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              <Shield className="w-8 h-8 text-[#C5A55A]" />
              <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                BluBloodz
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              {/* Browse — always visible */}
              <Link
                to="/search"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  location.pathname === '/search' ? 'text-[#C5A55A]' : 'text-slate-300 hover:text-white'
                }`}
                data-testid="nav-browse"
              >
                <Search className="w-4 h-4" />
                Browse
              </Link>

              {user && roleNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      location.pathname === item.path ? 'text-[#C5A55A]' : 'text-slate-300 hover:text-white'
                    }`}
                    data-testid={`nav-${item.name.toLowerCase().replace(/ /g, '-')}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}

              {user ? (
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:text-white"
                  data-testid="logout-button"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Link to="/login" data-testid="nav-login">
                  <Button size="sm" className="bg-[#C5A55A] text-[#0A1628] hover:bg-[#D4B66A] font-medium">
                    Login
                  </Button>
                </Link>
              )}
            </nav>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t border-white/10 space-y-3">
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 text-sm font-medium py-2 ${
                  location.pathname === '/search' ? 'text-[#C5A55A]' : 'text-slate-300'
                }`}
              >
                <Search className="w-4 h-4" />
                Browse
              </Link>

              {user && roleNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 text-sm font-medium py-2 ${
                      location.pathname === item.path ? 'text-[#C5A55A]' : 'text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}

              {user ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 text-sm font-medium py-2 text-slate-300 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium py-2 text-[#C5A55A]"
                >
                  Login
                </Link>
              )}
            </nav>
          )}
        </div>
      </header>
      
      <main className="pt-20">
        {children}
      </main>
      
      <footer className="bg-[#1E3A5F]/20 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#C5A55A]" />
              <span className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                BluBloodz
              </span>
            </div>
            <p className="text-sm text-slate-400">
              © 2024 BluBloodz. Trust Before You Buy. Verify Before You Breed.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
