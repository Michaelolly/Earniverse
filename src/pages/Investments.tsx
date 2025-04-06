
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowUpRight, BarChart2, Percent, Clock, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { 
  fetchUserInvestments, 
  createInvestment, 
  updateInvestment, 
  sellInvestment,
  Investment,
  INVESTMENT_OPPORTUNITIES 
} from "@/services/investmentService";
import { fetchUserBalance } from "@/services/userService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

const Investments = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [isInvesting, setIsInvesting] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setIsLoadingData(true);
        try {
          const [userInvestments, userBalance] = await Promise.all([
            fetchUserInvestments(user.id),
            fetchUserBalance(user.id)
          ]);
          
          setInvestments(userInvestments);
          setBalance(userBalance?.balance || 0);
        } catch (error) {
          console.error("Error loading investment data:", error);
          toast({
            title: "Error",
            description: "Failed to load investment data",
            variant: "destructive",
          });
        } finally {
          setIsLoadingData(false);
        }
      };
      
      loadData();
    }
  }, [user]);

  const handleInvestmentSelect = (opportunity: any) => {
    setSelectedOpportunity(opportunity);
    setInvestmentAmount(opportunity.min_investment);
    setDialogOpen(true);
  };

  const handleInvest = async () => {
    if (!user || !selectedOpportunity) return;
    
    if (balance < investmentAmount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds for this investment",
        variant: "destructive",
      });
      return;
    }
    
    if (investmentAmount < selectedOpportunity.min_investment) {
      toast({
        title: "Invalid Amount",
        description: `Minimum investment is $${selectedOpportunity.min_investment}`,
        variant: "destructive",
      });
      return;
    }
    
    setIsInvesting(true);
    
    try {
      // Generate a random performance between min and max potential return
      const performanceFactor = (Math.random() * (selectedOpportunity.potential_return_max - selectedOpportunity.potential_return_min) + selectedOpportunity.potential_return_min) / 100;
      const currentValue = investmentAmount * (1 + performanceFactor);
      
      const result = await createInvestment(user.id, {
        name: selectedOpportunity.name,
        category: selectedOpportunity.category,
        amount_invested: investmentAmount,
        current_value: currentValue,
        purchase_date: new Date().toISOString()
      });
      
      if (result.success) {
        toast({
          title: "Investment Created",
          description: `You have successfully invested $${investmentAmount} in ${selectedOpportunity.name}`,
        });
        
        setDialogOpen(false);
        
        // Refresh data
        const [userInvestments, userBalance] = await Promise.all([
          fetchUserInvestments(user.id),
          fetchUserBalance(user.id)
        ]);
        
        setInvestments(userInvestments);
        setBalance(userBalance?.balance || 0);
      } else {
        toast({
          title: "Investment Failed",
          description: result.error || "An error occurred while creating your investment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating investment:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsInvesting(false);
    }
  };

  const handleSellInvestment = async (investmentId: string) => {
    if (!user) return;
    
    try {
      const result = await sellInvestment(investmentId, user.id);
      
      if (result.success) {
        toast({
          title: "Investment Sold",
          description: "Your investment has been sold successfully",
        });
        
        // Refresh data
        const [userInvestments, userBalance] = await Promise.all([
          fetchUserInvestments(user.id),
          fetchUserBalance(user.id)
        ]);
        
        setInvestments(userInvestments);
        setBalance(userBalance?.balance || 0);
      } else {
        toast({
          title: "Sale Failed",
          description: result.error || "An error occurred while selling your investment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error selling investment:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earniverse-purple"></div>
      </div>
    );
  }

  // Calculate total investment value and allocation percentages
  const totalValue = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount_invested, 0);
  const profit = totalValue - totalInvested;
  const profitPercentage = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
  
  // Calculate allocation for pie chart
  const categories: Record<string, number> = {};
  investments.forEach(inv => {
    if (categories[inv.category]) {
      categories[inv.category] += inv.current_value;
    } else {
      categories[inv.category] = inv.current_value;
    }
  });
  
  const categoryPercentages = Object.entries(categories).map(([category, value]) => ({
    category,
    percentage: (value / totalValue) * 100
  }));
  
  // Sort investments by current value
  const sortedInvestments = [...investments].sort((a, b) => b.current_value - a.current_value);

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
                  <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
                </div>
              </div>
              <div className={`flex items-center text-sm ${profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <ArrowUpRight size={16} className={`mr-1 ${profitPercentage < 0 && 'rotate-180'}`} />
                {profitPercentage.toFixed(1)}%
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
                  <p className="text-2xl font-bold">{profit >= 0 ? '+' : ''}{profit.toFixed(2)}</p>
                </div>
              </div>
              <div className={`flex items-center text-sm ${profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <ArrowUpRight size={16} className={`mr-1 ${profitPercentage < 0 && 'rotate-180'}`} />
                {profitPercentage.toFixed(1)}%
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
                  <p className="text-2xl font-bold">{investments.length}</p>
                </div>
              </div>
              <div className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs">
                {investments.length > 0 ? 'Diversified' : 'No investments'}
              </div>
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
                  {investments.length > 0 ? (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Asset Allocation</h4>
                        <div className="flex gap-1 h-4">
                          {categoryPercentages.map((cat, index) => (
                            <div 
                              key={cat.category}
                              className={`bg-${getCategoryColor(cat.category)} ${index === 0 ? 'rounded-l-full' : ''} ${index === categoryPercentages.length - 1 ? 'rounded-r-full' : ''}`} 
                              style={{ width: `${cat.percentage}%` }}
                              title={`${cat.category}: ${cat.percentage.toFixed(0)}%`}
                            ></div>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs mt-2 text-muted-foreground">
                          {categoryPercentages.map(cat => (
                            <span key={cat.category}>{cat.category}: {cat.percentage.toFixed(0)}%</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4 mt-6">
                        {sortedInvestments.map(inv => {
                          const profit = inv.current_value - inv.amount_invested;
                          const percentChange = (profit / inv.amount_invested) * 100;
                          return (
                            <InvestmentItem 
                              key={inv.id}
                              id={inv.id}
                              name={inv.name} 
                              category={inv.category}
                              allocated={`$${inv.amount_invested.toFixed(2)}`}
                              value={`$${inv.current_value.toFixed(2)}`}
                              change={`${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`} 
                              isPositive={percentChange >= 0}
                              onManage={() => handleSellInvestment(inv.id)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <p className="text-muted-foreground mb-4">You don't have any investments yet</p>
                      <Button onClick={() => document.getElementById('opportunities-tab')?.click()}>
                        Explore Opportunities
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="opportunities" id="opportunities-tab">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {INVESTMENT_OPPORTUNITIES.map(opportunity => (
                <OpportunityCard
                  key={opportunity.id}
                  title={opportunity.name}
                  description={opportunity.description}
                  riskLevel={opportunity.risk_level}
                  potentialReturn={`${opportunity.potential_return_min}-${opportunity.potential_return_max}%`}
                  minInvestment={`$${opportunity.min_investment}`}
                  category={opportunity.category}
                  onInvest={() => handleInvestmentSelect(opportunity)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments.map(inv => (
                    <TransactionItem
                      key={inv.id}
                      type="Buy"
                      asset={inv.name}
                      amount={`$${inv.amount_invested.toFixed(2)}`}
                      date={format(new Date(inv.purchase_date), "MMM dd, yyyy")}
                      status="Completed"
                    />
                  ))}
                  
                  {investments.length === 0 && (
                    <div className="py-10 text-center">
                      <p className="text-muted-foreground">No transaction history available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invest in {selectedOpportunity?.name}</DialogTitle>
            <DialogDescription>
              Enter the amount you want to invest. Minimum: ${selectedOpportunity?.min_investment}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="investment-amount">Investment Amount</Label>
              <Input
                id="investment-amount"
                type="number"
                min={selectedOpportunity?.min_investment || 0}
                step={1}
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Available Balance: ${balance.toFixed(2)}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Category:</span>
                <span className="font-medium">{selectedOpportunity?.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Risk Level:</span>
                <span className="font-medium">{selectedOpportunity?.risk_level}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Potential Return:</span>
                <span className="font-medium">{selectedOpportunity?.potential_return_min}-{selectedOpportunity?.potential_return_max}%</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleInvest} 
              disabled={isInvesting || investmentAmount < (selectedOpportunity?.min_investment || 0) || investmentAmount > balance}
            >
              {isInvesting ? "Processing..." : "Confirm Investment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

// Helper function to get category colors
const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'stock':
      return 'earniverse-blue';
    case 'crypto':
      return 'earniverse-purple';
    case 'etf':
      return 'earniverse-gold';
    case 'bond':
    case 'bonds':
      return 'earniverse-navy';
    case 'reit':
      return 'green-600';
    default:
      return 'gray-400';
  }
};

interface InvestmentItemProps {
  id: string;
  name: string;
  category: string;
  allocated: string;
  value: string;
  change: string;
  isPositive: boolean;
  onManage: () => void;
}

const InvestmentItem = ({ 
  id, 
  name, 
  category, 
  allocated, 
  value, 
  change, 
  isPositive,
  onManage 
}: InvestmentItemProps) => {
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
        <Button 
          variant="outline" 
          className="border-earniverse-purple text-earniverse-purple hover:text-earniverse-purple hover:bg-earniverse-purple/10"
          onClick={onManage}
        >
          Sell
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
  onInvest: () => void;
}

const OpportunityCard = ({ 
  title, 
  description, 
  riskLevel, 
  potentialReturn, 
  minInvestment,
  category,
  onInvest
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
        <Button 
          className="w-full bg-earniverse-purple hover:bg-earniverse-deep-purple"
          onClick={onInvest}
        >
          Invest Now
        </Button>
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
