import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plane, Volume2, VolumeX, History, Users, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchUserBalance } from "@/services/userService";
import { generateCrashPoint, calculateWinnings, formatMultiplier, shouldContinueGame, getMultiplierColor } from "@/utils/aviatorUtils";
import AviatorParticles from "./AviatorParticles";
import Airplane from "./Airplane";
import { useAviatorSounds } from "@/hooks/useAviatorSounds";

interface AviatorGameProps {
  onGameComplete?: () => void;
}

const MAX_MULTIPLIER = 100; // Maximum multiplier possible
const GAME_TICK_MS = 100; // How often the game updates (milliseconds)

const AviatorGame: React.FC<AviatorGameProps> = ({ onGameComplete }) => {
  const { user } = useAuth();
  const [betAmount, setBetAmount] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasBet, setHasBet] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [crashPoint, setCrashPoint] = useState(0);
  const [cashedOut, setCashedOut] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [gameHistory, setGameHistory] = useState<{ multiplier: number; color: string }[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [playersCount] = useState(Math.floor(Math.random() * 100) + 30); // Mock data
  const { playSound, stopSound, muted, toggleMute } = useAviatorSounds();

  // For visual feedback
  const [countingUp, setCountingUp] = useState(false);
  const [displayedMultiplier, setDisplayedMultiplier] = useState("1.00x");
  
  // Fetch user balance
  useEffect(() => {
    if (user) {
      fetchUserBalance(user.id).then((data) => {
        if (data) {
          setBalance(data.balance);
        } else {
          // Fallback to edge function if direct DB access fails
          console.log("Fetching balance via edge function");
          fetch(`https://fghuralujkiddeuncyml.supabase.co/functions/v1/get_user_balance`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: user.id })
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              setBalance(data.balance);
            } else {
              console.error("Failed to get balance from edge function:", data.error);
              setBalance(0);
            }
          })
          .catch(error => {
            console.error("Error fetching balance:", error);
            setBalance(0);
          });
        }
      });
    }
  }, [user]);

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;
    
    let interval: NodeJS.Timeout;
    
    if (shouldContinueGame(multiplier, crashPoint)) {
      interval = setInterval(() => {
        // Exponential growth for the multiplier to make it more exciting
        setMultiplier(prev => {
          // More rapid growth at higher values
          const increment = prev < 2 ? 0.01 : prev < 10 ? 0.05 : 0.1;
          return Math.min(prev + increment, MAX_MULTIPLIER);
        });
      }, GAME_TICK_MS);
    } else {
      setIsPlaying(false);
      setIsCrashed(true);
      if (hasBet && !cashedOut) {
        toast({
          title: "Game Over!",
          description: `The plane crashed at ${formatMultiplier(crashPoint)}`,
          variant: "destructive",
        });
        playSound('crash');
      }
      
      // Add to history
      setGameHistory(prev => [
        { multiplier: crashPoint, color: getMultiplierColor(crashPoint) },
        ...prev.slice(0, 9)
      ]);
      
      // Reset after delay
      setTimeout(() => {
        resetGame();
      }, 3000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, multiplier, crashPoint, hasBet, cashedOut, playSound]);

  // Update displayed multiplier with counting animation
  useEffect(() => {
    if (isPlaying) {
      setCountingUp(true);
      setDisplayedMultiplier(formatMultiplier(multiplier));
    }
  }, [multiplier, isPlaying]);

  const resetGame = useCallback(() => {
    setMultiplier(1);
    setIsCrashed(false);
    setHasBet(false);
    setCashedOut(false);
    setWinAmount(0);
  }, []);
  
  const startNewGame = useCallback(() => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to play",
        variant: "destructive",
      });
      return;
    }

    resetGame();
    // Generate new crash point (between 1.0 and MAX_MULTIPLIER)
    const newCrashPoint = generateCrashPoint(0.05);
    console.log("Game will crash at:", newCrashPoint);
    setCrashPoint(newCrashPoint);
    
    // Start the game timer with a countdown
    setTimeout(() => {
      setIsPlaying(true);
      playSound('takeoff');
    }, 2000);
  }, [user, resetGame, playSound]);
  
  const placeBet = useCallback(() => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to play",
        variant: "destructive",
      });
      return;
    }

    if (!isPlaying) {
      startNewGame();
    }
    
    if (betAmount <= 0) {
      toast({
        title: "Invalid bet",
        description: "Bet amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (balance !== null && betAmount > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds",
        variant: "destructive",
      });
      return;
    }
    
    setHasBet(true);
    playSound('bet');
    
    // Deduct bet from balance immediately for better UX
    if (balance !== null) {
      setBalance(balance - betAmount);
    }
  }, [user, isPlaying, startNewGame, betAmount, balance, playSound]);
  
  const cashOut = useCallback(() => {
    if (!hasBet || cashedOut) return;
    
    const winnings = calculateWinnings(betAmount, multiplier);
    setWinAmount(winnings);
    setCashedOut(true);
    
    toast({
      title: "Cashed Out!",
      description: `You won $${winnings.toFixed(2)} at ${formatMultiplier(multiplier)}`,
    });
    
    playSound('cashout');
    
    // Update balance with winnings
    if (balance !== null) {
      setBalance(balance + winnings);
    }
    
    if (onGameComplete) {
      onGameComplete();
    }
  }, [hasBet, cashedOut, betAmount, multiplier, balance, playSound, onGameComplete]);

  return (
    <Card className="w-full overflow-hidden relative">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Plane className="text-yellow-500" size={24} />
            Aviat
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
        </div>
        <CardDescription>Place bets and cash out before the plane flies away</CardDescription>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="relative h-80 bg-gradient-to-b from-blue-950 to-purple-950 rounded-lg overflow-hidden">
          {/* Game canvas with particles */}
          <AviatorParticles isFlying={isPlaying} isCrashed={isCrashed} />
          
          {/* Airplane component */}
          <Airplane 
            isFlying={isPlaying} 
            isCrashed={isCrashed} 
            multiplier={multiplier} 
            maxMultiplier={MAX_MULTIPLIER} 
          />
          
          {/* Game UI */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-6xl font-bold mb-4 transition-all ${getMultiplierColor(multiplier)}`}>
              {displayedMultiplier}
            </div>
            
            {!isPlaying && !isCrashed && (
              <div className="text-white text-lg animate-pulse">
                Next round starting soon
              </div>
            )}
            
            {cashedOut && (
              <div className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg animate-bounce">
                Cashed out ${winAmount.toFixed(2)}!
              </div>
            )}
            
            {isCrashed && (
              <div className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg animate-pulse">
                CRASHED AT {formatMultiplier(crashPoint)}
              </div>
            )}
          </div>
          
          {/* Game stats */}
          <div className="absolute top-2 left-2 right-2 flex justify-between text-white">
            <div className="flex items-center bg-black/30 px-2 py-1 rounded">
              <Users size={14} className="mr-1" />
              <span className="text-xs">{playersCount} players</span>
            </div>
            <div className="flex items-center bg-black/30 px-2 py-1 rounded">
              <TrendingUp size={14} className="mr-1" />
              <span className="text-xs">House Edge: 5%</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex justify-between">
              <Label htmlFor="bet-amount">Bet Amount</Label>
              <div className="text-sm">Balance: ${balance?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="flex gap-2 mt-1">
              <Input
                id="bet-amount"
                type="number"
                min={1}
                max={balance || 1000}
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={isPlaying && hasBet}
              />
              <Button
                variant="outline"
                onClick={() => setBetAmount(betAmount * 2)}
                disabled={(isPlaying && hasBet) || betAmount * 2 > (balance || 0)}
              >
                2x
              </Button>
              <Button
                variant="outline"
                onClick={() => setBetAmount(Math.max(1, betAmount / 2))}
                disabled={isPlaying && hasBet}
              >
                ½
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={placeBet}
              disabled={(isPlaying && hasBet) || !balance || balance < betAmount}
              className="h-12 bg-yellow-600 hover:bg-yellow-700"
            >
              {isPlaying ? "Betting Closed" : "Place Bet"}
            </Button>
            <Button
              onClick={cashOut}
              disabled={!isPlaying || !hasBet || cashedOut}
              className="h-12 bg-green-600 hover:bg-green-700"
            >
              Cash Out
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pb-4 pt-0">
        <div className="w-full">
          <div className="flex items-center mb-2">
            <History size={14} className="mr-1" />
            <h3 className="text-sm font-medium">Recent Games</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {gameHistory.map((game, index) => (
              <div 
                key={index}
                className={`${game.color} px-2 py-1 text-xs font-medium rounded bg-opacity-20 bg-black whitespace-nowrap`}
              >
                {formatMultiplier(game.multiplier)}
              </div>
            ))}
            {gameHistory.length === 0 && (
              <div className="text-xs text-muted-foreground">No games played yet</div>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AviatorGame;
