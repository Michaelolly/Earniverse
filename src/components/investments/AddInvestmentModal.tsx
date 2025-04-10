
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { createInvestment } from "@/services/investmentService";
import { fetchUserBalance } from "@/services/userService";
import { PlusCircle, Loader2, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AddInvestmentModalProps {
  onInvestmentAdded: () => void;
}

const AddInvestmentModal = ({ onInvestmentAdded }: AddInvestmentModalProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Stock");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [step, setStep] = useState(1); // 1: form, 2: confirmation/results
  const [investmentResult, setInvestmentResult] = useState<{ success: boolean; profit?: number; currentValue?: number }>();
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen);
    
    if (newOpen && user) {
      setStep(1); // Reset step
      try {
        // Fetch user balance when opening the dialog
        const balance = await fetchUserBalance(user.id);
        setUserBalance(balance?.balance || 0);
      } catch (error) {
        console.error("Failed to fetch user balance:", error);
        setUserBalance(0);
      }
    }
  };
  
  const handleAddInvestment = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to make investments",
        variant: "destructive",
      });
      return;
    }
    
    // Validate inputs
    if (!name || !category || !amount) {
      toast({
        title: "Missing information",
        description: "Please fill out all fields",
        variant: "destructive",
      });
      return;
    }
    
    const investmentAmount = parseFloat(amount);
    if (isNaN(investmentAmount) || investmentAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }
    
    if (investmentAmount > userBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds for this investment",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate a random performance between -5% and +15%
      const performanceFactor = (Math.random() * 0.20) - 0.05;
      const currentValue = investmentAmount * (1 + performanceFactor);
      const profit = currentValue - investmentAmount;
      
      const result = await createInvestment(user.id, {
        name,
        category,
        amount_invested: investmentAmount,
        current_value: currentValue,
        purchase_date: new Date().toISOString(),
      });
      
      if (result.success) {
        setInvestmentResult({
          success: true,
          profit: profit,
          currentValue: currentValue
        });
        
        setStep(2); // Move to results step
        onInvestmentAdded(); // Notify parent to refresh investments
      } else {
        throw new Error(result.error || "Failed to create investment");
      }
    } catch (error: any) {
      console.error("Error creating investment:", error);
      toast({
        title: "Investment failed",
        description: error.message || "There was an error creating your investment",
        variant: "destructive",
      });
      setStep(1); // Stay on form step
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setName("");
    setCategory("Stock");
    setAmount("");
    setStep(1);
    setInvestmentResult(undefined);
  };

  const closeDialog = () => {
    setOpen(false);
    resetForm();
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle size={16} />
          Add Investment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle>Add New Investment</DialogTitle>
              <DialogDescription>
                Create a new investment with funds from your wallet.
                Available balance: ${userBalance.toFixed(2)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <Alert className="bg-blue-50">
                <Info className="h-4 w-4" />
                <AlertTitle>Investment Guide</AlertTitle>
                <AlertDescription className="text-xs">
                  Investments can gain or lose value based on market performance. Diversify your portfolio across different categories for better risk management.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                  placeholder="Investment name"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Stock">Stock</SelectItem>
                    <SelectItem value="ETF">ETF</SelectItem>
                    <SelectItem value="Crypto">Cryptocurrency</SelectItem>
                    <SelectItem value="REIT">Real Estate (REIT)</SelectItem>
                    <SelectItem value="Bond">Bond</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount ($)
                </Label>
                <div className="col-span-3 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddInvestment} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Add Investment"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Investment Created</DialogTitle>
              <DialogDescription>
                Your investment has been processed.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">{name}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">{category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount Invested</p>
                    <p className="font-medium">${parseFloat(amount).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Value</p>
                    <p className="font-medium">${investmentResult?.currentValue?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Performance</p>
                    <p className={`font-medium ${(investmentResult?.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(investmentResult?.profit || 0) >= 0 ? '+' : ''}${investmentResult?.profit?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              
              <Alert className={`${(investmentResult?.profit || 0) >= 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
                <Info className="h-4 w-4" />
                <AlertTitle>Investment Tips</AlertTitle>
                <AlertDescription className="text-xs">
                  {(investmentResult?.profit || 0) >= 0
                    ? "Your investment is performing well! Consider diversifying further for sustained growth."
                    : "Markets fluctuate regularly. Consider long-term investment strategies for better results."}
                </AlertDescription>
              </Alert>
            </div>
            
            <DialogFooter>
              <Button onClick={closeDialog}>
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddInvestmentModal;
