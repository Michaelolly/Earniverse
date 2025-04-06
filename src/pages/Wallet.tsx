
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownLeft, Clock, CreditCard, Plus, ArrowRight, Download, ExternalLink, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DepositFundsDialog from "@/components/wallet/DepositFundsDialog";

const Wallet = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchUserBalance();
      fetchTransactions();
    }
  }, [user, loading, navigate]);

  const fetchUserBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', user?.id)
        .single();
      
      if (error) {
        console.error("Error fetching balance:", error);
      } else {
        setBalance(data.balance);
      }
    } catch (error) {
      console.error("Unexpected error fetching balance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("Error fetching transactions:", error);
      } else {
        setTransactions(data || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching transactions:", error);
    }
  };

  const handleWithdraw = () => {
    toast({
      title: "Coming Soon",
      description: "Withdrawal functionality will be implemented soon.",
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earniverse-gold"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Wallet</h1>
            <p className="text-muted-foreground">Manage your funds and transactions</p>
          </div>
          <DepositFundsDialog />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2 shadow-md bg-gradient-to-r from-earniverse-blue/10 to-earniverse-purple/10">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                  <p className="text-3xl font-bold mb-4">${balance !== null ? balance.toFixed(2) : "0.00"}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleWithdraw} size="sm" className="gap-1">
                      <ArrowUpRight size={14} />
                      Withdraw
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <RefreshCw size={14} />
                      Refresh
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Wallet ID</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-sm">{user?.id?.substring(0, 6)}...{user?.id?.substring(user.id.length - 4)}</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => {
                        navigator.clipboard.writeText(user?.id || "");
                        toast({ title: "Copied to clipboard" });
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2">
                <ActionButton icon={<Plus size={16} />} label="Add Funds" onClick={() => document.querySelector<HTMLButtonElement>('[data-dialog-trigger="deposit"]')?.click()} />
                <ActionButton icon={<ArrowUpRight size={16} />} label="Withdraw" onClick={handleWithdraw} />
                <ActionButton icon={<CreditCard size={16} />} label="Link Card" onClick={() => toast({ title: "Coming Soon" })} />
                <ActionButton icon={<Download size={16} />} label="Export" onClick={() => toast({ title: "Coming Soon" })} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="activities" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="funding">Fund & Withdraw</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Transactions</CardTitle>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Clock size={14} />
                    History
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <TransactionItem
                        key={transaction.id}
                        type={transaction.type}
                        description={transaction.description}
                        amount={transaction.amount > 0 ? `+ $${transaction.amount.toFixed(2)}` : `- $${Math.abs(transaction.amount).toFixed(2)}`}
                        date={new Date(transaction.created_at).toLocaleDateString()}
                        status="Completed"
                        isCredit={transaction.amount > 0}
                      />
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No transactions yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="funding">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Funds</CardTitle>
                  <CardDescription>Deposit funds to your wallet</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount</label>
                      <div className="flex gap-2">
                        <Input placeholder="0.00" className="text-lg" />
                        <Button variant="ghost" className="border">USD</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payment Method</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          className="justify-start px-3 py-6 h-auto border-2 border-earniverse-blue"
                        >
                          <div className="flex items-center">
                            <div className="p-2 rounded mr-2 bg-earniverse-blue/10">
                              <CreditCard size={16} className="text-earniverse-blue" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium">Credit Card</p>
                              <p className="text-xs text-muted-foreground">Instant</p>
                            </div>
                          </div>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="justify-start px-3 py-6 h-auto"
                        >
                          <div className="flex items-center">
                            <div className="p-2 rounded mr-2 bg-muted">
                              <svg width="16" height="16" viewBox="0 0 16 16" className="text-muted-foreground">
                                <rect width="16" height="16" rx="2" fill="currentColor" fillOpacity="0.2" />
                                <path d="M3 8H13" stroke="currentColor" strokeWidth="2" />
                                <path d="M8 3V13" stroke="currentColor" strokeWidth="2" />
                              </svg>
                            </div>
                            <div className="text-left">
                              <p className="font-medium">Bank Transfer</p>
                              <p className="text-xs text-muted-foreground">1-3 business days</p>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                    
                    <Button className="w-full" data-dialog-trigger="deposit">Add Funds</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Withdraw Funds</CardTitle>
                  <CardDescription>Transfer funds to your bank account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount</label>
                      <div className="flex gap-2">
                        <Input placeholder="0.00" className="text-lg" />
                        <Button variant="ghost" className="border">USD</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">Destination</label>
                        <Button variant="link" size="sm" className="h-auto p-0">+ Add Account</Button>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between px-3 py-2 h-auto"
                      >
                        <div className="flex items-center">
                          <div className="p-2 rounded mr-2 bg-muted">
                            <svg width="16" height="16" viewBox="0 0 16 16" className="text-muted-foreground">
                              <rect width="16" height="16" rx="2" fill="currentColor" fillOpacity="0.2" />
                              <path d="M3 8H13" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="font-medium">Bank Account (****4567)</p>
                          </div>
                        </div>
                        <ArrowRight size={16} />
                      </Button>
                    </div>
                    
                    <Button className="w-full" onClick={handleWithdraw}>Withdraw</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="assets">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AssetItem
                    name="US Dollar"
                    ticker="USD"
                    balance={balance?.toString() || "0.00"}
                    value={`$${balance?.toFixed(2) || "0.00"}`}
                    change="+0.0%"
                    isPositive={true}
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

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const ActionButton = ({ icon, label, onClick }: ActionButtonProps) => {
  return (
    <Button variant="outline" className="flex flex-col h-auto py-4 gap-2" onClick={onClick}>
      <div className="p-2 rounded-full bg-earniverse-purple/10">
        <div className="text-earniverse-purple">{icon}</div>
      </div>
      <span className="text-xs">{label}</span>
    </Button>
  );
};

interface TransactionItemProps {
  type: string;
  description: string;
  amount: string;
  date: string;
  status: string;
  isCredit: boolean;
}

const TransactionItem = ({ type, description, amount, date, status, isCredit }: TransactionItemProps) => {
  const getTypeIcon = (transactionType: string) => {
    if (transactionType === "deposit" || transactionType === "task_reward") return <ArrowDownLeft size={16} className="text-green-600" />;
    if (transactionType === "withdrawal") return <ArrowUpRight size={16} className="text-amber-600" />;
    if (transactionType === "game") return <Gamepad2 size={16} className="text-blue-600" />;
    if (transactionType === "investment" || transactionType === "investment_sale") return <BarChart2 size={16} className="text-purple-600" />;
    return <Clock size={16} />;
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case "deposit": return "Deposit";
      case "withdrawal": return "Withdrawal";
      case "game": return "Game";
      case "investment": return "Investment";
      case "investment_sale": return "Investment Sale";
      case "task_reward": return "Task Reward";
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center">
        <div className={`p-2 rounded-full mr-3 ${isCredit ? 'bg-green-100' : 'bg-amber-100'}`}>
          {getTypeIcon(type)}
        </div>
        <div>
          <div className="flex items-center">
            <p className="font-medium">{formatTransactionType(type)}</p>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center mt-2 sm:mt-0 sm:ml-auto">
        <div className="flex flex-col items-end mr-4">
          <p className={`font-medium ${isCredit ? 'text-green-600' : ''}`}>{amount}</p>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
        <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          {status}
        </div>
      </div>
    </div>
  );
};

const BarChart2 = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const Gamepad2 = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="6" y1="12" x2="10" y2="12"></line>
    <line x1="8" y1="10" x2="8" y2="14"></line>
    <circle cx="15" cy="13" r="1"></circle>
    <circle cx="18" cy="11" r="1"></circle>
    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
  </svg>
);

interface AssetItemProps {
  name: string;
  ticker: string;
  balance: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const AssetItem = ({ name, ticker, balance, value, change, isPositive }: AssetItemProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-earniverse-gold to-earniverse-royal-gold flex items-center justify-center mr-3 text-white font-medium">
          {ticker.substring(0, 1)}
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{ticker}</p>
        </div>
      </div>
      <div className="flex items-center gap-6 mt-2 sm:mt-0">
        <div className="text-right">
          <p className="font-medium">{balance} {ticker}</p>
          <p className="text-sm text-muted-foreground">{value}</p>
        </div>
        <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? (
            <ArrowUpRight size={16} className="mr-1" />
          ) : (
            <ArrowUpRight size={16} className="mr-1 rotate-180" />
          )}
          {change}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
