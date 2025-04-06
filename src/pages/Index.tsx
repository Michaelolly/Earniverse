
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import TasksSection from "@/components/sections/TasksSection";
import InvestmentSection from "@/components/sections/InvestmentSection";
import BettingSection from "@/components/sections/BettingSection";
import CTASection from "@/components/sections/CTASection";
import { useEffect } from "react";

const Index = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <TasksSection />
        <InvestmentSection />
        <BettingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
