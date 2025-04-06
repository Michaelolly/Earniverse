
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dice5, ArrowUp, ArrowDown, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { playDiceRoll } from "@/services/gameService";
import { useAuth } from "@/context/AuthContext";
import { fetchUserBalance } from "@/services/userService";

const DiceRollGame = () => {
  const { user } = useAuth();
  const [betAmount, setBetAmount] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [result, setResult] = useState<number | null>(null);
  const [isWon, setIsWon] = useState<boolean | null>(null);
  const [userChoice, setUserChoice] = useState<'higher' | 'lower' | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      fetchUserBalance(user.id).then((data) => {
        if (data) {
          setBalance(data.balance);
        }
      });
    }
  }, [user]);

  const handleBet = async (choice: 'higher' | 'lower') => {
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
    setIsRolling(true);
    
    // Simulate dice roll animation
    setTimeout(async () => {
      try {
        const result = await playDiceRoll(user.id, betAmount, choice);
        
        if (result.success) {
          setIsWon(result.message?.includes("won"));
          setResult(result.roll || null);
          
          toast({
            title: result.message?.includes("won") ? "You won!" : "You lost",
            description: result.message,
            variant: result.message?.includes("won") ? "default" : "destructive",
          });
          
          // Update balance
          const updatedBalance = await fetchUserBalance(user.id);
          if (updatedBalance) {
            setBalance(updatedBalance.balance);
          }
        } else {
          toast({
            title: "Error",
            description: result.error || "Something went wrong",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error playing dice roll:", error);
        toast({
          title: "Error",
          description: "Failed to play game",
          variant: "destructive",
        });
      } finally {
        setIsRolling(false);
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
          <Dice5 className="text-purple-500" size={24} />
          Dice Roll
        </CardTitle>
        <CardDescription>Bet on higher (4-6) or lower (1-3) and double your money</CardDescription>
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
                  onClick={() => handleBet('higher')}
                  className="h-24 text-lg flex flex-col gap-1"
                  disabled={!balance || balance < betAmount}
                >
                  <div className="flex items-center">
                    <ArrowUp size={20} className="mr-1" />
                    Higher (4-6)
                  </div>
                  <div className="text-xs">2x payout</div>
                </Button>
                <Button 
                  onClick={() => handleBet('lower')}
                  className="h-24 text-lg flex flex-col gap-1"
                  disabled={!balance || balance < betAmount}
                >
                  <div className="flex items-center">
                    <ArrowDown size={20} className="mr-1" />
                    Lower (1-3)
                  </div>
                  <div className="text-xs">2x payout</div>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-4">
              {isRolling ? (
                <div className="relative h-32 w-32 animate-bounce">
                  <div className="absolute inset-0 bg-purple-500 rounded-lg flex items-center justify-center text-white text-4xl font-bold">
                    ?
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className={`bg-purple-500 rounded-lg w-24 h-24 flex items-center justify-center text-white font-bold text-5xl ${isWon ? 'ring-4 ring-green-500' : 'ring-4 ring-red-500'}`}>
                      {result}
                    </div>
                    <p className="mt-2 text-lg font-medium">
                      Your bet: {userChoice === 'higher' ? 'Higher (4-6)' : 'Lower (1-3)'}
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
              ) : null}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {isPlaying && !isRolling && (
          <Button onClick={resetGame} className="w-full">
            Play Again
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DiceRollGame;
