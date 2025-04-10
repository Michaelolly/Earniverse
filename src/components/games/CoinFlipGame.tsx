import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, ArrowDown, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { playCoinFlip } from "@/services/gameService";
import { useAuth } from "@/context/AuthContext";
import { fetchUserBalance } from "@/services/userService";

interface CoinFlipGameProps {
  onGameComplete?: () => void;
}

const CoinFlipGame = ({ onGameComplete }: CoinFlipGameProps) => {
  const { user } = useAuth();
  const [betAmount, setBetAmount] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [isWon, setIsWon] = useState<boolean | null>(null);
  const [userChoice, setUserChoice] = useState<'heads' | 'tails' | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      fetchUserBalance(user.id).then((data) => {
        if (data) {
          setBalance(data.balance);
        }
      });
    }
  }, [user]);

  const handleBet = async (choice: 'heads' | 'tails') => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to play",
        variant: "destructive",
      });
      return;
    }

    if (betAmount <= 0) {
      toast({
        title: "Invalid bet",
        description: "Bet amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsPlaying(true);
    setUserChoice(choice);
    setIsFlipping(true);
    
    setTimeout(async () => {
      try {
        const result = await playCoinFlip(user.id, betAmount, choice);
        
        if (result.success) {
          const wonGame = result.message?.includes("won");
          setIsWon(wonGame);
          setResult(result.message?.includes("heads") ? "heads" : "tails");
          
          toast({
            title: wonGame ? "You won!" : "You lost",
            description: result.message,
            variant: wonGame ? "default" : "destructive",
          });
          
          const updatedBalance = await fetchUserBalance(user.id);
          if (updatedBalance) {
            setBalance(updatedBalance.balance);
          }
          
          if (onGameComplete) {
            onGameComplete();
          }
        } else {
          toast({
            title: "Error",
            description: result.error || "Something went wrong",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error playing coin flip:", error);
        toast({
          title: "Error",
          description: "Failed to play game",
          variant: "destructive",
        });
      } finally {
        setIsFlipping(false);
      }
    }, 1500);
  };

  const resetGame = () => {
    setIsPlaying(false);
    setResult(null);
    setIsWon(null);
    setUserChoice(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="text-yellow-500" size={24} />
          Coin Flip
        </CardTitle>
        <CardDescription>Guess heads or tails and double your money</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {!isPlaying ? (
            <>
              <div>
                <Label htmlFor="bet-amount">Bet Amount</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="bet-amount"
                    type="number"
                    min={1}
                    max={balance || 1000}
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setBetAmount(betAmount * 2)}
                    disabled={betAmount * 2 > (balance || 0)}
                  >
                    2x
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setBetAmount(Math.max(1, betAmount / 2))}
                  >
                    ½
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Balance: ${balance?.toFixed(2) || '0.00'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleBet('heads')}
                  className="h-24 text-lg flex flex-col gap-1"
                  disabled={!balance || balance < betAmount}
                >
                  <div className="bg-yellow-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold">
                    H
                  </div>
                  Heads
                </Button>
                <Button 
                  onClick={() => handleBet('tails')}
                  className="h-24 text-lg flex flex-col gap-1"
                  disabled={!balance || balance < betAmount}
                >
                  <div className="bg-yellow-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold">
                    T
                  </div>
                  Tails
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-4">
              {isFlipping ? (
                <div className="relative h-32 w-32 animate-flip-coin">
                  <div className="absolute inset-0 bg-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {userChoice === 'heads' ? 'H' : 'T'}
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className={`bg-yellow-500 rounded-full w-20 h-20 flex items-center justify-center text-white font-bold text-2xl ${isWon ? 'ring-4 ring-green-500' : 'ring-4 ring-red-500'}`}>
                      {result === 'heads' ? 'H' : 'T'}
                    </div>
                    <p className="mt-2 text-lg font-medium">
                      Result: {result === 'heads' ? 'Heads' : 'Tails'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <div className={`p-2 rounded-full ${isWon ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {isWon ? <Check size={24} /> : <X size={24} />}
                    </div>
                    <span className="font-medium">
                      {isWon 
                        ? `You won $${(betAmount * 2).toFixed(2)}!` 
                        : `You lost $${betAmount.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="animate-bounce">
                  <ArrowDown size={32} />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {isPlaying && !isFlipping && (
          <Button onClick={resetGame} className="w-full">
            Play Again
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CoinFlipGame;
