
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import TasksSection from "@/components/sections/TasksSection";
import InvestmentSection from "@/components/sections/InvestmentSection";
import BettingSection from "@/components/sections/BettingSection";
import CTASection from "@/components/sections/CTASection";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user } = useAuth();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection 
          isAuthenticated={!!user}
          authLink={user ? "/dashboard" : "/auth"}
          authText={user ? "Go to Dashboard" : "Get Started"}
        />
        <FeaturesSection />
        <TasksSection />
        <InvestmentSection />
        <BettingSection />
        <CTASection 
          isAuthenticated={!!user}
          authLink={user ? "/dashboard" : "/auth"}
          authText={user ? "Go to Dashboard" : "Join Now"}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
