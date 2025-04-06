
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-earniverse-navy text-white py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h4 className="text-xl font-display font-bold gold-text">Earniverse</h4>
            <p className="text-gray-300">
              The all-in-one ecosystem where you can earn, invest, and play to grow your wealth.
            </p>
            <div className="flex space-x-4">
              <SocialIcon name="twitter" />
              <SocialIcon name="facebook" />
              <SocialIcon name="instagram" />
              <SocialIcon name="linkedin" />
            </div>
          </div>
          
          <div>
            <h5 className="font-bold text-lg mb-4">Platform</h5>
            <ul className="space-y-2">
              <FooterLink href="#tasks">Tasks Platform</FooterLink>
              <FooterLink href="#investments">Investment Hub</FooterLink>
              <FooterLink href="#betting">Betting & Games</FooterLink>
              <FooterLink href="#">How It Works</FooterLink>
            </ul>
          </div>
          
          <div>
            <h5 className="font-bold text-lg mb-4">Company</h5>
            <ul className="space-y-2">
              <FooterLink href="#">About Us</FooterLink>
              <FooterLink href="#">Careers</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">Contact</FooterLink>
            </ul>
          </div>
          
          <div>
            <h5 className="font-bold text-lg mb-4">Legal</h5>
            <ul className="space-y-2">
              <FooterLink href="#">Terms of Service</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Security</FooterLink>
              <FooterLink href="#">Compliance</FooterLink>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © {new Date().getFullYear()} Earniverse. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm hover:text-white transition-colors">
              Terms
            </span>
            <span className="text-gray-400 text-sm hover:text-white transition-colors">
              Privacy
            </span>
            <span className="text-gray-400 text-sm hover:text-white transition-colors">
              Cookies
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <a href={href} className="text-gray-300 hover:text-white transition-colors">
      {children}
    </a>
  </li>
);

const SocialIcon = ({ name }: { name: string }) => (
  <a 
    href="#" 
    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
    aria-label={name}
  >
    <span className="sr-only">{name}</span>
    {/* Icon would go here in a real implementation */}
  </a>
);

export default Footer;
