
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, TrendingUp, Shield, BarChart2, BriefcaseBusiness } from "lucide-react";

const InvestmentSection = () => {
  return (
    <section id="investments" className="py-20 bg-muted">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row-reverse gap-16 items-center">
          <div className="lg:w-1/2 space-y-6 animate-slide-up">
            <h2 className="gradient-text">Investment Hub</h2>
            <p className="text-lg text-muted-foreground">
              Grow your wealth with diverse investment options, real-time market data, 
              and advanced analytics to make informed decisions.
            </p>
            
            <div className="space-y-4">
              <FeatureItem 
                icon={<BriefcaseBusiness size={20} />} 
                text="Diverse range of investment opportunities" 
              />
              <FeatureItem 
                icon={<BarChart2 size={20} />} 
                text="Real-time data and performance analytics" 
              />
              <FeatureItem 
                icon={<TrendingUp size={20} />} 
                text="Automated investment tools and robo-advisors" 
              />
              <FeatureItem 
                icon={<Shield size={20} />} 
                text="Bank-grade security for all transactions" 
              />
            </div>
            
            <div className="pt-4">
              <Button size="lg" className="bg-earniverse-purple hover:bg-earniverse-deep-purple">
                Start Investing
              </Button>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-earniverse-purple/20 rounded-full blur-3xl"></div>
              
              <Card className="mb-6 overflow-hidden animate-zoom-in">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-earniverse-blue to-earniverse-purple p-6 text-white">
                    <h3 className="font-bold text-xl mb-2">Portfolio Overview</h3>
                    <p className="text-white/80">Total Value: $24,586.00</p>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Asset Allocation</span>
                        <span className="text-sm text-muted-foreground">April 2025</span>
                      </div>
                      <div className="flex gap-2 h-3">
                        <div className="bg-earniverse-blue w-[45%] rounded-l-full" title="Stocks: 45%"></div>
                        <div className="bg-earniverse-purple w-[30%]" title="Crypto: 30%"></div>
                        <div className="bg-earniverse-gold w-[15%]" title="ETFs: 15%"></div>
                        <div className="bg-earniverse-navy w-[10%] rounded-r-full" title="Bonds: 10%"></div>
                      </div>
                      <div className="flex justify-between text-xs mt-2 text-muted-foreground">
                        <span>Stocks: 45%</span>
                        <span>Crypto: 30%</span>
                        <span>ETFs: 15%</span>
                        <span>Bonds: 10%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <InvestmentItem 
                        name="Tech Growth ETF" 
                        change="+5.6%" 
                        value="$8,650.20"
                        isPositive={true}
                      />
                      <InvestmentItem 
                        name="Bitcoin (BTC)" 
                        change="+12.3%" 
                        value="$7,320.00"
                        isPositive={true}
                      />
                      <InvestmentItem 
                        name="Green Energy Fund" 
                        change="-2.1%" 
                        value="$4,210.50"
                        isPositive={false}
                      />
                      <InvestmentItem 
                        name="Corporate Bonds" 
                        change="+0.8%" 
                        value="$4,405.30"
                        isPositive={true}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
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
      <div className="text-earniverse-purple">{icon}</div>
      <span>{text}</span>
    </div>
  );
};

interface InvestmentItemProps {
  name: string;
  change: string;
  value: string;
  isPositive: boolean;
}

const InvestmentItem = ({ name, change, value, isPositive }: InvestmentItemProps) => {
  return (
    <div className="flex justify-between items-center p-2 hover:bg-muted rounded-md transition-colors">
      <span className="font-medium">{name}</span>
      <div className="flex items-center gap-4">
        <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowUpRight size={14} className="mr-1 rotate-180" />}
          {change}
        </span>
        <span className="text-muted-foreground">{value}</span>
      </div>
    </div>
  );
};

export default InvestmentSection;
