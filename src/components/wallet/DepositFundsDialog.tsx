
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, CreditCard, Check, ChevronsUpDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import FlutterwavePayment from "./FlutterwavePayment";
import StripePayment from "./StripePayment";
import DemoPayment from "./DemoPayment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { demoPaymentConfig } from "@/integrations/flutterwave/config";

const DepositFundsDialog = () => {
  const [amount, setAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("demo"); // Changed default to demo
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Check for payment success in URL
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    const paymentAmount = searchParams.get("amount");
    
    if (paymentStatus === "success" && sessionId) {
      setIsSuccess(true);
      setOpen(true);
      
      if (paymentAmount) {
        setAmount(paymentAmount);
      }

      // Give time for the success animation to complete
      setTimeout(() => {
        setOpen(false);
        setTimeout(resetForm, 300);
        
        toast({
          title: "Payment Successful",
          description: `Your payment has been processed successfully.`,
        });
      }, 3000);
    }
  }, [searchParams, toast]);

  const formatCardNumber = (value: string) => {
    // Remove non-numeric characters and limit to 19 digits (16 digits + 3 spaces)
    const numbers = value.replace(/\D/g, '').substring(0, 16);
    const groups = [];
    
    for (let i = 0; i < numbers.length; i += 4) {
      groups.push(numbers.substring(i, i + 4));
    }
    
    return groups.join(' ');
  };

  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, '').substring(0, 4);
    
    if (numbers.length > 2) {
      return numbers.substring(0, 2) + '/' + numbers.substring(2);
    }
    
    return numbers;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiryDate(formatExpiryDate(e.target.value));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/\D/g, '').substring(0, 3));
  };

  const resetForm = () => {
    setAmount("");
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setCardHolder("");
    setIsSuccess(false);
    setPaymentMethod("demo"); // Reset to demo
  };

  const handleDeposit = async () => {
    // Use user ID if available, otherwise use "guest-user"
    const userId = user?.id || "guest-user";
    
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }

    if (!cardNumber || !expiryDate || !cvv || !cardHolder) {
      toast({
        title: "Missing information",
        description: "Please fill in all payment details.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Starting deposit process for user:", userId);
      
      // Get current user balance or default to 0
      let userBalance = await userService.fetchUserBalance(userId);
      console.log("User balance fetched:", userBalance);
      
      // Starting balance (use 0 if no balance record exists)
      const currentBalance = userBalance?.balance || 0;
      console.log("Current balance:", currentBalance);
      
      // Calculate new balance
      const newBalance = currentBalance + depositAmount;
      console.log("New balance will be:", newBalance);
      
      // Create transaction record
      const transactionData = {
        user_id: userId,
        amount: depositAmount,
        type: 'deposit',
        description: 'Card deposit'
      };
      
      // Process the deposit
      console.log("Calling processDeposit with:", userId, newBalance, transactionData);
      const result = await userService.processDeposit(
        userId,
        newBalance,
        transactionData
      );
      
      console.log("Deposit result:", result);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to process deposit");
      }

      // Show success state
      setIsSuccess(true);
      
      // After 2 seconds, reset the form and close the dialog
      setTimeout(() => {
        toast({
          title: "Deposit successful",
          description: `$${depositAmount.toFixed(2)} has been added to your account.`,
        });
        
        setOpen(false);
        // Wait for the close animation to finish before resetting form
        setTimeout(resetForm, 300);
      }, 2000);
      
    } catch (error: any) {
      console.error("Deposit error:", error);
      toast({
        title: "Deposit failed",
        description: error.message || "There was an error processing your deposit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlutterwaveSuccess = () => {
    setIsSuccess(true);
    
    // After 2 seconds, reset the form and close the dialog
    setTimeout(() => {
      setOpen(false);
      // Wait for the close animation to finish before resetting form
      setTimeout(resetForm, 300);
    }, 2000);
  };

  const handleDemoSuccess = () => {
    setIsSuccess(true);
    
    // After 2 seconds, reset the form and close the dialog
    setTimeout(() => {
      setOpen(false);
      // Wait for the close animation to finish before resetting form
      setTimeout(resetForm, 300);
    }, 2000);
  };

  // Quick amount buttons for demo
  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button className="bg-earniverse-gold hover:bg-earniverse-royal-gold text-black gap-2" data-dialog-trigger="deposit">
          <Plus size={16} />
          Add Funds
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Deposit Funds</DialogTitle>
              <DialogDescription>
                Add money to your wallet. Choose your preferred payment method.
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

              <Tabs defaultValue="demo" onValueChange={setPaymentMethod} className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="demo">Demo</TabsTrigger>
                  <TabsTrigger value="stripe">Stripe</TabsTrigger>
                  <TabsTrigger value="flutterwave">Flutterwave</TabsTrigger>
                  <TabsTrigger value="card">Direct Card</TabsTrigger>
                </TabsList>
                
                <TabsContent value="demo" className="pt-4 space-y-4">
                  <div className="p-4 border rounded-md bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-4">
                      Quick test payment for demonstration purposes
                    </p>
                    
                    {/* Quick amount buttons */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {demoPaymentConfig.amounts.map((quickAmount) => (
                        <Button 
                          key={quickAmount} 
                          variant="outline" 
                          onClick={() => handleQuickAmount(quickAmount)}
                          className={amount === quickAmount.toString() ? "border-green-500 bg-green-50" : ""}
                        >
                          ${quickAmount}
                        </Button>
                      ))}
                    </div>
                    
                    <DemoPayment amount={amount} onSuccess={handleDemoSuccess} />
                  </div>
                </TabsContent>

                <TabsContent value="stripe" className="pt-4 space-y-4">
                  <div className="p-4 border rounded-md bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-4">
                      Secure online payment processed by Stripe
                    </p>
                    <StripePayment amount={amount} />
                  </div>
                </TabsContent>

                <TabsContent value="flutterwave" className="pt-4 space-y-4">
                  <div className="p-4 border rounded-md bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-4">
                      Secure online payment processed by Flutterwave
                    </p>
                    <FlutterwavePayment amount={amount} onSuccess={handleFlutterwaveSuccess} />
                  </div>
                </TabsContent>
                
                <TabsContent value="card" className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cardHolder" className="text-right">
                      Card holder
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="cardHolder"
                        type="text"
                        placeholder="John Doe"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cardNumber" className="text-right">
                      Card number
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="cardNumber"
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expiry" className="text-right">
                      Expiry
                    </Label>
                    <Input
                      id="expiry"
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={handleExpiryDateChange}
                      maxLength={5}
                      className="col-span-1"
                    />
                    <Label htmlFor="cvv" className="text-right">
                      CVV
                    </Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={handleCvvChange}
                      maxLength={3}
                      className="col-span-1"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {paymentMethod === "card" && (
              <DialogFooter>
                <Button type="submit" onClick={handleDeposit} disabled={isLoading}>
                  {isLoading ? "Processing..." : "Deposit"}
                </Button>
              </DialogFooter>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground">
              ${parseFloat(amount).toFixed(2)} has been added to your wallet
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DepositFundsDialog;
