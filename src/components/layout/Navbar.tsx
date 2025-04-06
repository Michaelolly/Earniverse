
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-display font-bold gradient-text">
              Earniverse
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              <NavLink href="#tasks">Tasks</NavLink>
              <NavLink href="#investments">Investments</NavLink>
              <NavLink href="#betting">Betting</NavLink>
              <NavLink href="#about">About</NavLink>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline">Login</Button>
              <Button>Sign Up</Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg shadow-lg p-4 border-t">
            <div className="flex flex-col space-y-4">
              <MobileNavLink href="#tasks" onClick={() => setIsMenuOpen(false)}>Tasks</MobileNavLink>
              <MobileNavLink href="#investments" onClick={() => setIsMenuOpen(false)}>Investments</MobileNavLink>
              <MobileNavLink href="#betting" onClick={() => setIsMenuOpen(false)}>Betting</MobileNavLink>
              <MobileNavLink href="#about" onClick={() => setIsMenuOpen(false)}>About</MobileNavLink>
              <div className="flex space-x-3 pt-2">
                <Button variant="outline" className="flex-1">Login</Button>
                <Button className="flex-1">Sign Up</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a 
    href={href}
    className="text-foreground/80 hover:text-foreground font-medium text-sm transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 after:origin-bottom-right after:transition-transform hover:after:scale-x-100 hover:after:origin-bottom-left"
  >
    {children}
  </a>
);

const MobileNavLink = ({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) => (
  <a 
    href={href}
    onClick={onClick}
    className="text-foreground font-medium text-lg py-2 border-b border-gray-100"
  >
    {children}
  </a>
);

export default Navbar;
