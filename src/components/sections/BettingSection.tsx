
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Soccer, Dice5, MonitorPlay, MessageSquare, Shield } from "lucide-react";

const BettingSection = () => {
  return (
    <section id="betting" className="py-20">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 space-y-6 animate-slide-right">
            <h2 className="gradient-text">Betting & Games</h2>
            <p className="text-lg text-muted-foreground">
              Experience the thrill of betting with our provably fair games, live sports betting, 
              and transparent odds – all with secure payouts.
            </p>
            
            <div className="space-y-4">
              <FeatureItem 
                icon={<Dice5 size={20} />} 
                text="Variety of casino games with transparent odds" 
              />
              <FeatureItem 
                icon={<Soccer size={20} />} 
                text="Live sports betting with real-time updates" 
              />
              <FeatureItem 
                icon={<MonitorPlay size={20} />} 
                text="Live streaming of select sporting events" 
              />
              <FeatureItem 
                icon={<Shield size={20} />} 
                text="Provably fair systems for complete transparency" 
              />
            </div>
            
            <div className="pt-4">
              <Button size="lg" className="bg-earniverse-gold hover:bg-earniverse-royal-gold text-black">
                Play Now
              </Button>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-earniverse-gold/20 rounded-full blur-3xl"></div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <GameCard 
                  category="Casino"
                  title="Premium Blackjack"
                  icon={<Dice5 size={24} />}
                  bgClass="bg-gradient-to-br from-earniverse-blue to-earniverse-navy"
                  users="1,248 playing"
                  className="animate-zoom-in"
                />
                <GameCard 
                  category="Sports"
                  title="UEFA Champions League"
                  icon={<Soccer size={24} />}
                  bgClass="bg-gradient-to-br from-earniverse-purple to-earniverse-deep-purple"
                  users="3,542 betting"
                  className="sm:mt-8 animate-zoom-in"
                  style={{ animationDelay: "150ms" }}
                />
                <GameCard 
                  category="Slots"
                  title="Golden Fortune"
                  icon={<MonitorPlay size={24} />}
                  bgClass="bg-gradient-to-br from-earniverse-gold to-earniverse-royal-gold"
                  users="967 playing"
                  className="animate-zoom-in"
                  style={{ animationDelay: "300ms" }}
                />
                <GameCard 
                  category="Poker"
                  title="High Stakes Poker"
                  icon={<MessageSquare size={24} />}
                  bgClass="bg-gradient-to-br from-slate-700 to-slate-900"
                  users="512 playing"
                  className="sm:-mt-8 animate-zoom-in"
                  style={{ animationDelay: "450ms" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
}

const FeatureItem = ({ icon, text }: FeatureItemProps) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="text-earniverse-gold">{icon}</div>
      <span>{text}</span>
    </div>
  );
};

interface GameCardProps {
  category: string;
  title: string;
  icon: React.ReactNode;
  bgClass: string;
  users: string;
  className?: string;
  style?: React.CSSProperties;
}

const GameCard = ({ category, title, icon, bgClass, users, className, style }: GameCardProps) => {
  return (
    <Card className={`overflow-hidden h-48 group cursor-pointer hover:shadow-xl transition-all ${className}`} style={style}>
      <div className={`${bgClass} h-full w-full p-6 text-white flex flex-col justify-between relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-4 opacity-25 group-hover:opacity-40 transition-opacity">
          {icon}
        </div>
        
        <div>
          <span className="inline-block bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded mb-2">
            {category}
          </span>
          <h4 className="text-xl font-bold">{title}</h4>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/70">{users}</span>
          <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
            Play
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BettingSection;
