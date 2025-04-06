
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const DepositFundsDialog = () => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDeposit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to deposit funds.",
        variant: "destructive",
      });
      return;
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Get current user balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      
      if (balanceError) {
        throw balanceError;
      }

      // 2. Update user balance
      const { error: updateError } = await supabase
        .from('user_balances')
        .update({ balance: balanceData.balance + depositAmount })
        .eq('user_id', user.id);
      
      if (updateError) {
        throw updateError;
      }

      // 3. Add transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: depositAmount,
          type: 'deposit',
          description: 'User deposit'
        });
      
      if (transactionError) {
        throw transactionError;
      }

      toast({
        title: "Deposit successful",
        description: `$${depositAmount.toFixed(2)} has been added to your account.`,
      });
      
      setOpen(false);
      setAmount("");
      
    } catch (error) {
      console.error("Deposit error:", error);
      toast({
        title: "Deposit failed",
        description: "There was an error processing your deposit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-earniverse-gold hover:bg-earniverse-royal-gold text-black gap-2">
          <Plus size={16} />
          Add Funds
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
          <DialogDescription>
            Add money to your wallet. This is a simulation for educational purposes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="col-span-3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-method" className="text-right">
              Method
            </Label>
            <div className="col-span-3">
              <div className="p-2 border rounded-md flex items-center gap-2 bg-muted/50">
                <CreditCard className="text-muted-foreground" size={18} />
                <span>Credit Card (Simulated)</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleDeposit} disabled={isLoading}>
            {isLoading ? "Processing..." : "Deposit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DepositFundsDialog;
