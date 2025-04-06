
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, BarChart2, Percent, Clock, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Investments = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earniverse-purple"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Investment Hub</h1>
            <p className="text-muted-foreground">Grow your wealth with smart investments</p>
          </div>
          <Button className="bg-earniverse-purple hover:bg-earniverse-deep-purple">
            <BarChart2 className="mr-2" size={16} />
            New Investment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-full mr-4">
                  <BarChart2 className="text-earniverse-purple" size={24} />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Portfolio Value</p>
                  <p className="text-2xl font-bold">$8,459.32</p>
                </div>
              </div>
              <div className="text-green-600 flex items-center text-sm">
                <ArrowUpRight size={16} className="mr-1" />
                12.5%
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-4">
                  <Percent className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Current Returns</p>
                  <p className="text-2xl font-bold">+$952.45</p>
                </div>
              </div>
              <div className="text-green-600 flex items-center text-sm">
                <ArrowUpRight size={16} className="mr-1" />
                8.2%
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-4">
                  <Clock className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Active Investments</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
              </div>
              <div className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs">Diversified</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="portfolio" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="portfolio">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Investments</CardTitle>
                  <CardDescription>Current allocation and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Asset Allocation</h4>
                      <div className="flex gap-1 h-4">
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
                    
                    <div className="space-y-4 mt-6">
                      <InvestmentItem 
                        name="Tech Growth ETF" 
                        category="ETF"
                        allocated="$3,806.69"
                        value="$4,020.86"
                        change="+5.6%" 
                        isPositive={true}
                      />
                      <InvestmentItem 
                        name="Bitcoin (BTC)" 
                        category="Crypto"
                        allocated="$2,280.00"
                        value="$2,560.44"
                        change="+12.3%" 
                        isPositive={true}
                      />
                      <InvestmentItem 
                        name="Green Energy Fund" 
                        category="Stock"
                        allocated="$1,200.55"
                        value="$1,174.74"
                        change="-2.1%" 
                        isPositive={false}
                      />
                      <InvestmentItem 
                        name="Corporate Bonds" 
                        category="Bond"
                        allocated="$800.00"
                        value="$806.40"
                        change="+0.8%" 
                        isPositive={true}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="opportunities">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OpportunityCard
                title="High Yield Tech Fund"
                description="A diversified fund focused on high-growth technology companies"
                riskLevel="Medium"
                potentialReturn="12-18%"
                minInvestment="$500"
                category="ETF"
              />
              <OpportunityCard
                title="Green Energy Portfolio"
                description="Invest in renewable energy companies with strong ESG ratings"
                riskLevel="Medium"
                potentialReturn="9-14%"
                minInvestment="$250"
                category="Stock"
              />
              <OpportunityCard
                title="Real Estate Investment Trust"
                description="Commercial and residential property investments with regular dividends"
                riskLevel="Low"
                potentialReturn="6-10%"
                minInvestment="$1,000"
                category="REIT"
              />
              <OpportunityCard
                title="Cryptocurrency Index"
                description="Diversified exposure to top performing cryptocurrencies"
                riskLevel="High"
                potentialReturn="15-30%"
                minInvestment="$100"
                category="Crypto"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <TransactionItem
                    type="Buy"
                    asset="Tech Growth ETF"
                    amount="$1,000.00"
                    date="Apr 02, 2025"
                    status="Completed"
                  />
                  <TransactionItem
                    type="Sell"
                    asset="Silver Fund"
                    amount="$550.75"
                    date="Mar 28, 2025"
                    status="Completed"
                  />
                  <TransactionItem
                    type="Buy"
                    asset="Bitcoin (BTC)"
                    amount="$800.00"
                    date="Mar 22, 2025"
                    status="Completed"
                  />
                  <TransactionItem
                    type="Buy"
                    asset="Corporate Bonds"
                    amount="$2,000.00"
                    date="Mar 15, 2025"
                    status="Completed"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

interface InvestmentItemProps {
  name: string;
  category: string;
  allocated: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const InvestmentItem = ({ name, category, allocated, value, change, isPositive }: InvestmentItemProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{name}</h3>
          <Badge variant="outline">{category}</Badge>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Allocated: {allocated}</span>
          <span>Current value: {value}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 sm:mt-0">
        <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowUpRight size={16} className="mr-1 rotate-180" />}
          {change}
        </span>
        <Button variant="outline" className="border-earniverse-purple text-earniverse-purple hover:text-earniverse-purple hover:bg-earniverse-purple/10">
          Manage
        </Button>
      </div>
    </div>
  );
};

interface OpportunityCardProps {
  title: string;
  description: string;
  riskLevel: string;
  potentialReturn: string;
  minInvestment: string;
  category: string;
}

const OpportunityCard = ({ 
  title, 
  description, 
  riskLevel, 
  potentialReturn, 
  minInvestment,
  category
}: OpportunityCardProps) => {
  const getRiskColor = (risk: string) => {
    if (risk === "Low") return "bg-green-100 text-green-800";
    if (risk === "Medium") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="bg-gradient-to-r from-earniverse-blue/10 to-earniverse-purple/10">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge>{category}</Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Risk Level</p>
            <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getRiskColor(riskLevel)}`}>
              {riskLevel}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Potential Return</p>
            <p className="font-medium text-green-600">{potentialReturn}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Min Investment</p>
            <p className="font-medium">{minInvestment}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Investors</p>
            <p className="font-medium">1,234</p>
          </div>
        </div>
        <Button className="w-full bg-earniverse-purple hover:bg-earniverse-deep-purple">Invest Now</Button>
      </CardContent>
    </Card>
  );
};

interface TransactionItemProps {
  type: string;
  asset: string;
  amount: string;
  date: string;
  status: string;
}

const TransactionItem = ({ type, asset, amount, date, status }: TransactionItemProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center">
        <div className={`p-2 rounded-full mr-3 ${type === 'Buy' ? 'bg-green-100' : 'bg-amber-100'}`}>
          <ArrowUpRight size={16} className={`${type === 'Buy' ? 'text-green-600' : 'text-amber-600 rotate-180'}`} />
        </div>
        <div>
          <div className="flex items-center">
            <p className="font-medium">{type} {asset}</p>
          </div>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
      </div>
      <div className="flex items-center mt-2 sm:mt-0">
        <p className="font-medium mr-4">{amount}</p>
        <Badge variant="outline" className="bg-green-50">{status}</Badge>
      </div>
    </div>
  );
};

export default Investments;
