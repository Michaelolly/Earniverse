
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CTASectionProps {
  isAuthenticated?: boolean;
  authLink?: string;
  authText?: string;
}

const CTASection = ({ 
  isAuthenticated = false, 
  authLink = "/auth", 
  authText = "Join Now" 
}: CTASectionProps) => {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-r from-earniverse-blue to-earniverse-purple text-white">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-earniverse-gold to-earniverse-royal-gold"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-display font-bold">
            Ready to Build Your Financial Future?
          </h2>
          <p className="text-xl text-white/80">
            Join thousands of users already growing their wealth through tasks, investments, and games on our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="bg-earniverse-gold hover:bg-earniverse-royal-gold text-black" asChild>
              <Link to={authLink}>
                {authText}
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <a href="#features">Learn More</a>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-8 pt-8">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Bank-Level Security</p>
                <p className="text-sm text-white/70">Your data is always protected</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Instant Withdrawals</p>
                <p className="text-sm text-white/70">Get your money when you need it</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">24/7 Support</p>
                <p className="text-sm text-white/70">We're always here to help</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
