
import { CircleDollarSign, BarChart3, Gamepad2 } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-background to-muted">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="mb-4 gradient-text">One Platform, Unlimited Potential</h2>
          <p className="text-lg text-muted-foreground">
            Earniverse combines three powerful platforms into one seamless ecosystem, 
            enabling you to earn, grow, and enjoy your wealth all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<CircleDollarSign size={32} className="text-earniverse-blue" />}
            title="Task Platform" 
            description="Post or complete tasks to earn money. Our secure escrow system ensures fair payment for quality work."
            delay="0"
            link="#tasks"
          />
          <FeatureCard 
            icon={<BarChart3 size={32} className="text-earniverse-purple" />}
            title="Investment Hub" 
            description="Grow your wealth with diverse investment options, real-time data, and automated investment tools."
            delay="150"
            link="#investments"
          />
          <FeatureCard 
            icon={<Gamepad2 size={32} className="text-earniverse-gold" />}
            title="Betting & Games" 
            description="Enjoy a variety of provably fair betting games with transparent odds and secure payouts."
            delay="300"
            link="#betting"
          />
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
  link: string;
}

const FeatureCard = ({ icon, title, description, delay, link }: FeatureCardProps) => {
  return (
    <div 
      className="glass-card p-8 hover:shadow-xl transition-all duration-300 animate-zoom-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      <a 
        href={link}
        className="inline-flex items-center text-primary font-semibold hover:underline"
      >
        Learn more
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 ml-2" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
      </a>
    </div>
  );
};

export default FeaturesSection;
