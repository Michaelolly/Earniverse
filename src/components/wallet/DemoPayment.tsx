
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Coins, Loader2 } from "lucide-react";
import { demoPaymentConfig } from "@/integrations/flutterwave/config";

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
      
      // Use the Edge Function to process the payment and avoid RLS issues
      const response = await fetch(`https://fghuralujkiddeuncyml.supabase.co/functions/v1/update_balance_after_game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_user_id: userId,
          p_amount: parsedAmount,
          p_game_session_id: null,
          p_transaction_type: 'deposit',
          p_description: 'Demo payment - For testing purposes'
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to process payment");
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
