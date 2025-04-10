import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dice5, Trophy, MonitorPlay, MessageSquare, Gamepad2, Clock, Users, TrendingUp, Flame, Plane } from "lucide-react";
import { fetchGames, Game, fetchGameHistory, GameSession } from "@/services/gameService";
import { fetchUserBalance, UserBalance } from "@/services/userService";
import CoinFlipGame from "@/components/games/CoinFlipGame";
import DiceRollGame from "@/components/games/DiceRollGame";
import AviatorGame from "@/components/games/aviator/AviatorGame";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

const Games = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setIsLoadingData(true);
        try {
          const [gamesData, historyData, balanceData] = await Promise.all([
            fetchGames(),
            fetchGameHistory(user.id),
            fetchUserBalance(user.id)
          ]);
          
          setGames(gamesData);
          setGameHistory(historyData);
          setUserBalance(balanceData);
        } catch (error) {
          console.error("Error loading game data:", error);
          toast({
            title: "Error",
            description: "Failed to load game data",
            variant: "destructive",
          });
        } finally {
          setIsLoadingData(false);
        }
      };
      
      loadData();
    }
  }, [user, refreshTrigger]);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earniverse-gold"></div>
      </div>
    );
  }

  const renderGameContent = () => {
    if (!selectedGame) return null;

    switch (selectedGame) {
      case "Coin Flip":
        return <CoinFlipGame onGameComplete={refreshData} />;
      case "Dice Roll":
        return <DiceRollGame onGameComplete={refreshData} />;
      case "Aviat":
        return <AviatorGame onGameComplete={refreshData} />;
      default:
        return (
          <div className="text-center py-10">
            <p>Game coming soon!</p>
          </div>
        );
    }
  };

  const totalGames = gameHistory.length;
  const wins = gameHistory.filter(g => g.win_amount && g.win_amount > 0).length;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const totalWinnings = gameHistory.reduce((sum, game) => sum + (game.win_amount || 0), 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const gamesPlayedToday = gameHistory.filter(
    game => new Date(game.played_at) >= today
  ).length;

  const winningsToday = gameHistory
    .filter(game => new Date(game.played_at) >= today && game.win_amount && game.win_amount > 0)
    .reduce((sum, game) => sum + (game.win_amount || 0), 0);
  
  const winRateChange = "+3";

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Games & Betting</h1>
            <p className="text-muted-foreground">Play games and place bets to win rewards</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <TrendingUp size={16} />
              Leaderboard
            </Button>
            <Button className="bg-earniverse-gold hover:bg-earniverse-royal-gold text-black gap-2">
              <Wallet />
              Balance: ${userBalance?.balance.toFixed(2) || '0.00'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-amber-100 p-2 rounded-full mr-4">
                  <Trophy className="text-amber-600" size={24} />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Winnings</p>
                  <p className="text-2xl font-bold">${totalWinnings.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs">+${winningsToday.toFixed(2)} today</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-full mr-4">
                  <Gamepad2 className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Games Played</p>
                  <p className="text-2xl font-bold">{totalGames}</p>
                </div>
              </div>
              <div className="text-purple-600 bg-purple-100 px-2 py-1 rounded text-xs">{gamesPlayedToday} today</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-full mr-4">
                  <Flame className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Win Rate</p>
                  <p className="text-2xl font-bold">{winRate}%</p>
                </div>
              </div>
              <div className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs">{winRateChange}% this week</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="casino" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="casino">Casino</TabsTrigger>
            <TabsTrigger value="sports">Sports Betting</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="casino">
            {selectedGame ? (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      className="p-2" 
                      onClick={() => setSelectedGame(null)}
                    >
                      ← Back
                    </Button>
                    {selectedGame}
                  </h2>
                </div>
                {renderGameContent()}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {games.map((game) => (
                  <GameCard 
                    key={game.id}
                    title={game.name}
                    category={game.description || "Casino Game"}
                    icon={getGameIcon(game.name)}
                    minBet={`$${game.min_bet}`}
                    bgClass={getGameBackground(game.name)}
                    isHot={game.name === "Coin Flip" || game.name === "Dice Roll" || game.name === "Aviat"}
                    onClick={() => setSelectedGame(game.name)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sports">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Live Events</h3>
                <Button variant="outline" size="sm">
                  <Clock size={14} className="mr-1" />
                  Upcoming
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SportsBettingCard
                  league="UEFA Champions League"
                  team1="Bayern Munich"
                  team2="Real Madrid"
                  time="Live - 64'"
                  team1Score="2"
                  team2Score="1"
                  team1Odds="2.40"
                  drawOdds="3.25"
                  team2Odds="2.90"
                />
                <SportsBettingCard
                  league="NBA"
                  team1="Boston Celtics"
                  team2="LA Lakers"
                  time="Live - 3Q 4:23"
                  team1Score="78"
                  team2Score="72"
                  team1Odds="1.75"
                  drawOdds="-"
                  team2Odds="2.10"
                />
                <SportsBettingCard
                  league="Premier League"
                  team1="Liverpool"
                  team2="Manchester City"
                  time="Starting in 3h 45m"
                  team1Odds="2.20"
                  drawOdds="3.40"
                  team2Odds="2.70"
                />
                <SportsBettingCard
                  league="NFL"
                  team1="Kansas City Chiefs"
                  team2="San Francisco 49ers"
                  time="Tomorrow, 19:00"
                  team1Odds="1.90"
                  drawOdds="-"
                  team2Odds="1.95"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Game History</CardTitle>
                <CardDescription>Your recent game sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {gameHistory.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bet Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outcome</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {gameHistory.map((session) => {
                          const gameInfo = games.find(g => g.id === session.game_id);
                          const isWin = session.win_amount && session.win_amount > 0;
                          
                          return (
                            <tr key={session.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {gameInfo?.name || session.game_id.slice(0, 8)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {format(new Date(session.played_at), "MMM d, yyyy h:mm a")}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                ${session.bet_amount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isWin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {session.outcome}
                                </span>
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isWin ? 'text-green-600' : 'text-red-600'}`}>
                                {isWin ? `$${session.win_amount?.toFixed(2)}` : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    You haven't played any games yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

const getGameIcon = (gameName: string) => {
  switch (gameName) {
    case "Coin Flip":
      return <Dice5 size={24} />;
    case "Dice Roll":
      return <Dice5 size={24} />;
    case "Aviat":
      return <Plane size={24} />;
    case "Slot Machine":
      return <MonitorPlay size={24} />;
    case "Roulette":
      return <Dice5 size={24} />;
    case "Blackjack":
      return <MessageSquare size={24} />;
    default:
      return <Gamepad2 size={24} />;
  }
};

const getGameBackground = (gameName: string) => {
  switch (gameName) {
    case "Coin Flip":
      return "bg-gradient-to-br from-yellow-500 to-amber-700";
    case "Dice Roll":
      return "bg-gradient-to-br from-purple-600 to-purple-900";
    case "Aviat":
      return "bg-gradient-to-br from-blue-700 to-indigo-900";
    case "Slot Machine":
      return "bg-gradient-to-br from-earniverse-gold to-earniverse-royal-gold";
    case "Roulette":
      return "bg-gradient-to-br from-red-600 to-red-900";
    case "Blackjack":
      return "bg-gradient-to-br from-slate-700 to-slate-900";
    default:
      return "bg-gradient-to-br from-earniverse-blue to-earniverse-navy";
  }
};

const Wallet = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
  </svg>
);

interface GameCardProps {
  title: string;
  category: string;
  icon: React.ReactNode;
  minBet: string;
  bgClass: string;
  isHot: boolean;
  onClick: () => void;
}

const GameCard = ({ title, category, icon, minBet, bgClass, isHot, onClick }: GameCardProps) => {
  return (
    <Card className="overflow-hidden h-48 group cursor-pointer hover:shadow-xl transition-all" onClick={onClick}>
      <div className={`${bgClass} h-full w-full p-6 text-white flex flex-col justify-between relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-4 opacity-25 group-hover:opacity-40 transition-opacity">
          {icon}
        </div>
        
        <div>
          <span className="inline-block bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded mb-2">
            {category}
          </span>
          <h4 className="text-xl font-bold flex items-center gap-2">
            {title}
            {isHot && (
              <Badge className="bg-red-500 text-white text-xs">HOT</Badge>
            )}
          </h4>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start">
            <span className="text-xs text-white/70">Min bet</span>
            <span className="text-sm font-bold">{minBet}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            Play Now
          </Button>
        </div>
      </div>
    </Card>
  );
};

interface SportsBettingCardProps {
  league: string;
  team1: string;
  team2: string;
  time: string;
  team1Score?: string;
  team2Score?: string;
  team1Odds: string;
  drawOdds: string;
  team2Odds: string;
}

const SportsBettingCard = ({
  league,
  team1,
  team2,
  time,
  team1Score,
  team2Score,
  team1Odds,
  drawOdds,
  team2Odds,
}: SportsBettingCardProps) => {
  const isLive = time.includes("Live");
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Trophy size={16} className="text-earniverse-gold mr-2" />
            <CardTitle className="text-sm font-medium">{league}</CardTitle>
          </div>
          <Badge className={`${isLive ? 'bg-red-500' : 'bg-blue-500'}`}>
            {isLive ? (
              <div className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse mr-1"></span>
                {time}
              </div>
            ) : time}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            <h3 className="font-bold">{team1}</h3>
          </div>
          {team1Score && team2Score && (
            <div className="flex items-center justify-center gap-2 px-4">
              <span className="text-lg font-bold">{team1Score}</span>
              <span className="text-muted-foreground">-</span>
              <span className="text-lg font-bold">{team2Score}</span>
            </div>
          )}
          <div className="flex-1 text-right">
            <h3 className="font-bold">{team2}</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="py-6">
            <div className="flex flex-col">
              <span className="text-sm">Home</span>
              <span className="text-lg font-bold">{team1Odds}</span>
            </div>
          </Button>
          <Button variant="outline" className="py-6" disabled={drawOdds === "-"}>
            <div className="flex flex-col">
              <span className="text-sm">Draw</span>
              <span className="text-lg font-bold">{drawOdds}</span>
            </div>
          </Button>
          <Button variant="outline" className="py-6">
            <div className="flex flex-col">
              <span className="text-sm">Away</span>
              <span className="text-lg font-bold">{team2Odds}</span>
            </div>
          </Button>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button className="w-full bg-earniverse-gold hover:bg-earniverse-royal-gold text-black">
          More Bets
        </Button>
      </CardFooter>
    </Card>
  );
};

interface TournamentCardProps {
  title: string;
  prize: string;
  entryFee: string;
  players: string;
  startDate: string;
  status: "Open" | "Full" | "Upcoming" | "Complete";
}

const TournamentCard = ({ 
  title, 
  prize, 
  entryFee, 
  players, 
  startDate,
  status 
}: TournamentCardProps) => {
  const getStatusColor = (status: string) => {
    if (status === "Open") return "bg-green-100 text-green-800";
    if (status === "Full") return "bg-amber-100 text-amber-800";
    if (status === "Upcoming") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-earniverse-blue to-earniverse-purple p-4 text-white">
        <CardTitle className="flex justify-between items-center">
          <span>{title}</span>
          <Badge className={`${getStatusColor(status)}`}>{status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Prize Pool</p>
            <p className="text-xl font-bold text-earniverse-gold">{prize}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Entry Fee</p>
            <p className="font-bold">{entryFee}</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Players</span>
            <span>{players}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Start Date</span>
            <span>{startDate}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button className="w-full" disabled={status === "Full"}>
          {status === "Full" ? "Tournament Full" : "Register Now"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Games;
