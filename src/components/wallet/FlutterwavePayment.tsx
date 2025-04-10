
import { useState } from "react";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { userService } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { flutterwaveConfig } from "@/integrations/flutterwave/config";

interface FlutterwavePaymentProps {
  amount: string;
  onSuccess?: () => void;
}

const FlutterwavePayment = ({ amount, onSuccess }: FlutterwavePaymentProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const userId = user?.id || "guest-user";
  const userEmail = user?.email || "guest@example.com";
  const userName = user?.user_metadata?.name || "Guest User";

  const handleFlutterwavePayment = useFlutterwave({
    public_key: flutterwaveConfig.publicKey,
    tx_ref: Date.now().toString(),
    amount: parseFloat(amount) || 10,
    currency: "USD",
    payment_options: "card,mobilemoney,ussd",
    customer: {
      email: userEmail,
      phone_number: "",
      name: userName,
    },
    customizations: {
      title: "Earniverse Wallet Deposit",
      description: "Add funds to your wallet",
      logo: "https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg",
    },
  });

  const handlePaymentInitiate = () => {
    setIsProcessing(true);

    handleFlutterwavePayment({
      callback: async (response) => {
        console.log("Payment response:", response);
        closePaymentModal();

        if (response.status === "successful") {
          try {
            // Process the deposit to update user balance
            const depositAmount = parseFloat(amount);
            
            // Get current user balance or default to 0
            let userBalance = await userService.fetchUserBalance(userId);
            const currentBalance = userBalance?.balance || 0;
            
            // Calculate new balance
            const newBalance = currentBalance + depositAmount;
            
            // Process the deposit
            const result = await userService.processDeposit(
              userId,
              newBalance,
              {
                user_id: userId,
                amount: depositAmount,
                type: 'deposit',
                description: `Flutterwave deposit - Ref: ${response.transaction_id}`
              }
            );

            if (!result.success) {
              throw new Error(result.error || "Failed to process deposit");
            }

            toast({
              title: "Payment Successful",
              description: `$${depositAmount.toFixed(2)} has been added to your wallet.`,
            });
            
            // Make sure onSuccess is called to trigger wallet refresh
            if (onSuccess) {
              setTimeout(() => onSuccess(), 500);
            }
          } catch (error: any) {
            console.error("Error processing payment:", error);
            toast({
              title: "Payment Error",
              description: error.message || "There was an error processing your payment.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Payment Failed",
            description: "Your payment was not successful. Please try again.",
            variant: "destructive",
          });
        }
        setIsProcessing(false);
      },
      onClose: () => {
        setIsProcessing(false);
      },
    });
  };

  return (
    <Button
      onClick={handlePaymentInitiate}
      disabled={isProcessing || !parseFloat(amount)}
      className="w-full bg-earniverse-gold hover:bg-earniverse-royal-gold text-black gap-2"
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Plus size={16} />
          Pay with Flutterwave
        </>
      )}
    </Button>
  );
};

export default FlutterwavePayment;
