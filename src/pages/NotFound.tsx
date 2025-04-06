
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import ParticleBackground from "@/components/ui/ParticleBackground";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-earniverse-blue/90 to-earniverse-purple/90 text-white relative overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 text-center px-4">
        <h1 className="text-6xl md:text-8xl font-bold mb-4">404</h1>
        <div className="w-16 h-1 bg-earniverse-gold mx-auto mb-8"></div>
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">Page Not Found</h2>
        <p className="text-xl text-white/80 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button 
          size="lg" 
          className="bg-earniverse-gold hover:bg-earniverse-royal-gold text-black"
          onClick={() => window.location.href = '/'}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
