
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-earniverse-blue to-earniverse-purple text-white">
      <div className="container-custom">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Transform Your Financial Journey?
          </h2>
          <p className="text-xl text-white/80">
            Join thousands of users who are already earning, investing, and growing their wealth with Earniverse.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="bg-earniverse-gold hover:bg-earniverse-royal-gold text-black px-8">
              Create Free Account
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule a Demo
            </Button>
          </div>
          <div className="pt-8 flex flex-wrap justify-center gap-8">
            <Stat number="10K+" text="Active Users" />
            <Stat number="$2.5M+" text="Earned by Users" />
            <Stat number="4.8/5" text="User Rating" />
          </div>
        </div>
      </div>
    </section>
  );
};

interface StatProps {
  number: string;
  text: string;
}

const Stat = ({ number, text }: StatProps) => {
  return (
    <div className="text-center">
      <div className="font-bold text-3xl gold-text">{number}</div>
      <div className="text-sm text-white/70 mt-1">{text}</div>
    </div>
  );
};

export default CTASection;
