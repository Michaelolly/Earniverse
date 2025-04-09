
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { demoPaymentConfig } from "@/integrations/flutterwave/config";
import { Coins, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DemoPaymentProps {
  amount: string;
  onSuccess?: () => void;
}

const DemoPayment = ({ amount, onSuccess }: DemoPaymentProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const userId = user?.id || "guest-user";

  const handleDemoPayment = async () => {
    setIsProcessing(true);
    
    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid positive number.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Simulate processing time for better UX
      if (demoPaymentConfig.processingDelay) {
        await new Promise(resolve => setTimeout(resolve, demoPaymentConfig.processingDelay));
      }

      // Use direct Supabase access to bypass RLS issues
      // First check if the user has a balance record
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (balanceError) {
        console.error("Error checking balance:", balanceError);
        throw new Error("Failed to check current balance");
      }
      
      // Calculate new balance
      const currentBalance = balanceData?.balance || 0;
      const newBalance = currentBalance + parsedAmount;
      
      console.log("Processing deposit with direct database calls:", {
        userId,
        currentBalance,
        newBalance,
        parsedAmount
      });
      
      // If user doesn't have a balance record, create one
      if (!balanceData) {
        const { error: insertError } = await supabase
          .from('user_balances')
          .insert({
            user_id: userId,
            balance: parsedAmount,
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error("Error creating balance record:", insertError);
          throw new Error("Failed to create balance record");
        }
      } else {
        // Update existing balance
        const { error: updateError } = await supabase
          .from('user_balances')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        if (updateError) {
          console.error("Error updating balance:", updateError);
          throw new Error("Failed to update balance");
        }
      }
      
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount: parsedAmount,
          type: 'deposit',
          description: `Demo payment - For testing purposes`,
          created_at: new Date().toISOString()
        });
      
      if (transactionError) {
        console.error("Error creating transaction:", transactionError);
        throw new Error("Failed to create transaction record");
      }

      toast({
        title: "Demo Payment Successful",
        description: `$${parsedAmount.toFixed(2)} has been added to your wallet.`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error processing demo payment:", error);
      toast({
        title: "Payment Error",
        description: error.message || "There was an error processing your payment.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handleDemoPayment}
      disabled={isProcessing || !parseFloat(amount)}
      className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Coins size={16} />
          Demo Payment (Testing)
        </>
      )}
    </Button>
  );
};

export default DemoPayment;
