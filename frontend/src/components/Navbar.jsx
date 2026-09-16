import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Coffee, Menu, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const navLinks = [
  { to: '/', label: 'Trang chủ' },
  { to: '/menu', label: 'Thực đơn' },
  { to: '/about', label: 'Giới thiệu' },
  { to: '/contact', label: 'Liên hệ' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-cream-50/95 backdrop-blur shadow-md py-2' : 'bg-cream-50/95 py-4'
      }`}
    >
      <nav className="container-custom flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-coffee-800 text-cream-50 transition-transform group-hover:rotate-12">
            <Coffee size={20} />
          </span>
          <span className="font-serif text-xl font-bold text-coffee-900">Ô Cà Phê</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-coffee-600 ${
                  isActive ? 'text-coffee-800 font-semibold' : 'text-coffee-700'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-coffee-800 text-cream-50 transition-transform hover:scale-105"
          >
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          <button
            className="md:hidden text-coffee-800"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Mở menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="md:hidden mt-3 bg-cream-50 border-t border-coffee-100 shadow-lg">
          <div className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-coffee-100 text-coffee-900' : 'text-coffee-700'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
