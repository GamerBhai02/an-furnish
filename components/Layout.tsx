import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Moon, Sun, ShoppingBag, Truck } from 'lucide-react';
import Chatbot from './Chatbot';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check system preference or localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
              AN
            </div>
            <span className="text-xl font-bold text-stone-900 dark:text-white tracking-tight hidden sm:block">
              AN Furnish
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600 dark:text-stone-300">
            <Link to="/catalog" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Catalog</Link>
            <Link to="/custom-design" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Design Custom</Link>
            <Link to="/tracking" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1">
              <Truck size={16} /> Track Order
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/admin" className="p-2 text-xs font-bold text-stone-400 hover:text-primary-500">
              Admin
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 absolute w-full left-0 animate-in slide-in-from-top-5 duration-200">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link to="/catalog" className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800">
                <ShoppingBag size={20} /> Browse Catalog
              </Link>
              <Link to="/custom-design" className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800">
                <span className="w-5 h-5 flex items-center justify-center border-2 border-current rounded text-xs">?</span>
                Custom Design
              </Link>
              <Link to="/tracking" className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800">
                <Truck size={20} /> Track Order
              </Link>
              <div className="h-px bg-stone-200 dark:bg-stone-800 my-2"></div>
              <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="w-full bg-green-600 text-white py-2 rounded-lg text-center font-medium">
                Chat on WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-stone-100 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4">AN Furnish</h3>
              <p className="text-stone-600 dark:text-stone-400 max-w-sm mb-6">
                Crafting homes with custom furniture and curated collections. 
                Quality craftsmanship meets modern design.
              </p>
              <div className="flex gap-4">
                 {/* Social placeholders */}
                 <div className="w-8 h-8 bg-stone-200 dark:bg-stone-800 rounded-full"></div>
                 <div className="w-8 h-8 bg-stone-200 dark:bg-stone-800 rounded-full"></div>
                 <div className="w-8 h-8 bg-stone-200 dark:bg-stone-800 rounded-full"></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-stone-900 dark:text-white mb-4">Explore</h4>
              <ul className="space-y-2 text-stone-600 dark:text-stone-400 text-sm">
                <li><Link to="/catalog">All Products</Link></li>
                <li><Link to="/custom-design">Custom Design</Link></li>
                <li><Link to="/tracking">Order Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-stone-900 dark:text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-stone-600 dark:text-stone-400 text-sm">
                <li>+91 94488 52434</li>
                <li>an-furnish@gmail.com</li>
                <li>Bengaluru, Karnataka, India</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-stone-200 dark:border-stone-800 text-center text-sm text-stone-500">
            © {new Date().getFullYear()} AN Furnish. All rights reserved.
          </div>
        </div>
      </footer>
      
      {/* Global Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Layout;
