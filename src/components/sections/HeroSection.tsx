
import { Button } from "@/components/ui/button";
import ParticleBackground from "@/components/ui/ParticleBackground";
import { Link } from "react-router-dom";

interface HeroSectionProps {
  isAuthenticated?: boolean;
  authLink?: string;
  authText?: string;
}

const HeroSection = ({ 
  isAuthenticated = false, 
  authLink = "/auth", 
  authText = "Get Started" 
}: HeroSectionProps) => {
  return (
    <section className="relative h-screen flex items-center overflow-hidden bg-gradient-to-br from-earniverse-blue/90 to-earniverse-purple/90">
      <ParticleBackground />
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6 animate-slide-up">
            <h1 className="font-display font-bold leading-tight">
              Your Gateway to<br />
              <span className="gold-text">Earning, Investing</span><br />
              and <span className="gold-text">Wealth Building</span>
            </h1>
            <p className="text-xl text-white/80 max-w-md">
              Join the all-in-one ecosystem where you can earn through tasks, 
              grow wealth through investments, and enjoy entertainment through betting games.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-earniverse-gold hover:bg-earniverse-royal-gold text-black" asChild>
                <Link to={authLink}>
                  {authText}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <a href="#features">Learn More</a>
              </Button>
            </div>
            <div className="pt-6">
              <p className="text-white/60 text-sm">
                Trusted by over <span className="text-white font-medium">10,000+</span> users worldwide
              </p>
            </div>
          </div>
          <div className="hidden lg:block animate-float">
            <div className="relative">
              <div className="absolute -top-8 -left-8 w-64 h-64 bg-earniverse-gold/20 rounded-full filter blur-3xl"></div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-earniverse-blue/20 rounded-full filter blur-3xl"></div>
              <div className="relative glass-card p-8 rounded-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1470" 
                  alt="Wealth Dashboard Preview" 
                  className="rounded-lg shadow-lg w-full"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <div className="animate-bounce w-10 h-10 flex items-center justify-center">
            <a href="#features" className="text-white/60 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
