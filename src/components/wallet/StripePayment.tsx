
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface StripePaymentProps {
  amount: string;
  onSuccess?: () => void;
}

const StripePayment = ({ amount, onSuccess }: StripePaymentProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const userId = user?.id || "guest-user";
  const userEmail = user?.email || "guest@example.com";
  const userName = user?.user_metadata?.name || "Guest User";

  const handleStripePayment = async () => {
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

      // Call our Supabase Edge Function to create a Stripe checkout session
      const response = await fetch("https://fghuralujkiddeuncyml.supabase.co/functions/v1/create-stripe-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parsedAmount,
          userId,
          userEmail,
          userName
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (!data.url) {
        throw new Error("No checkout URL returned");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Error",
        description: error.message || "There was an error processing your payment.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handleStripePayment}
      disabled={isProcessing || !parseFloat(amount)}
      className="w-full bg-[#635BFF] hover:bg-[#4F46E5] text-white gap-2"
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard size={16} />
          Pay with Stripe
        </>
      )}
    </Button>
  );
};

export default StripePayment;
