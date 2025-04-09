
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, CreditCard, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import FlutterwavePayment from "./FlutterwavePayment";
import StripePayment from "./StripePayment";
import DemoPayment from "./DemoPayment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { demoPaymentConfig } from "@/integrations/flutterwave/config";

interface DepositFundsDialogProps {
  onDepositSuccess?: () => void;
}

const DepositFundsDialog = ({ onDepositSuccess }: DepositFundsDialogProps) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("demo");
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
        
        if (onDepositSuccess) {
          onDepositSuccess();
        }
        
        toast({
          title: "Payment Successful",
          description: `Your payment has been processed successfully.`,
        });
      }, 3000);
    }
  }, [searchParams, toast, onDepositSuccess]);

  const resetForm = () => {
    setAmount("");
    setIsSuccess(false);
    setPaymentMethod("demo");
  };

  const handleFlutterwaveSuccess = () => {
    setIsSuccess(true);
    
    // After 2 seconds, reset the form and close the dialog
    setTimeout(() => {
      setOpen(false);
      // Wait for the close animation to finish before resetting form
      setTimeout(resetForm, 300);
      
      if (onDepositSuccess) {
        onDepositSuccess();
      }
    }, 2000);
  };

  const handleDemoSuccess = () => {
    setIsSuccess(true);
    
    // After 2 seconds, reset the form and close the dialog
    setTimeout(() => {
      setOpen(false);
      // Wait for the close animation to finish before resetting form
      setTimeout(() => {
        resetForm();
        
        if (onDepositSuccess) {
          onDepositSuccess();
        }
      }, 300);
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
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="demo">Demo</TabsTrigger>
                  <TabsTrigger value="stripe">Stripe</TabsTrigger>
                  <TabsTrigger value="flutterwave">Flutterwave</TabsTrigger>
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
              </Tabs>
            </div>
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
