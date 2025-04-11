
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, PlayCircle, DollarSign, Award, Timer, RefreshCw } from "lucide-react";
import { userService, updateUserBalance } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const WATCH_TIME_REWARD = 0.25; // Amount earned per ad viewing session
const WATCH_TIME_REQUIRED = 30; // Seconds required to earn the reward
const MAX_DAILY_SESSIONS = 10; // Maximum number of paid ad views per day

const WatchAndEarn = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWatching, setIsWatching] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [adLink, setAdLink] = useState("https://www.profitableratecpm.com/a6ugtn3snv?key=58e9c4fff9308ccfc8012ab15de3da92");
  
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          // Get user balance
          const data = await userService.fetchUserBalance(user.id);
          if (data) {
            setBalance(data.balance);
          }
          
          // Get session count from localStorage
          const today = new Date().toDateString();
          const storedData = localStorage.getItem(`adSessions_${user.id}`);
          let sessionsData = { date: today, count: 0 };
          
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData.date === today) {
              sessionsData = parsedData;
            }
          }
          
          setSessionCount(sessionsData.count);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
  }, [user]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isWatching && watchTime < WATCH_TIME_REQUIRED) {
      interval = setInterval(() => {
        setWatchTime(prev => prev + 1);
      }, 1000);
    }
    
    if (watchTime >= WATCH_TIME_REQUIRED) {
      handleAdCompleted();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWatching, watchTime]);
  
  const startWatching = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to earn rewards from watching ads",
        variant: "destructive",
      });
      return;
    }
    
    if (sessionCount >= MAX_DAILY_SESSIONS) {
      toast({
        title: "Daily Limit Reached",
        description: `You've reached the maximum limit of ${MAX_DAILY_SESSIONS} ad views per day`,
        variant: "destructive",
      });
      return;
    }
    
    setIsWatching(true);
    setWatchTime(0);
    
    toast({
      title: "Ad Started",
      description: `Watch for ${WATCH_TIME_REQUIRED} seconds to earn ${WATCH_TIME_REWARD.toFixed(2)} tokens`,
    });
    
    // Rotate through different ad links if needed
    // This is where you could set different ad URLs if you have multiple
  };
  
  const handleAdCompleted = async () => {
    if (!user) return;
    
    setIsWatching(false);
    
    // Update session count in localStorage
    const today = new Date().toDateString();
    const newCount = sessionCount + 1;
    setSessionCount(newCount);
    localStorage.setItem(`adSessions_${user.id}`, JSON.stringify({ date: today, count: newCount }));
    
    try {
      // Add reward to user's balance
      const result = await updateUserBalance(
        user.id,
        WATCH_TIME_REWARD,
        "ad_reward",
        `Reward for watching an ad`
      );
      
      if (result.success) {
        toast({
          title: "Reward Earned!",
          description: `You earned $${WATCH_TIME_REWARD.toFixed(2)} for watching the ad`,
        });
        
        if (result.newBalance !== undefined) {
          setBalance(result.newBalance);
        } else {
          // Refresh balance
          const balanceData = await userService.fetchUserBalance(user.id);
          if (balanceData) {
            setBalance(balanceData.balance);
          }
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to process reward",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing ad reward:", error);
      toast({
        title: "Error",
        description: "Failed to process your reward",
        variant: "destructive",
      });
    }
  };
  
  const resetAdView = () => {
    setIsWatching(false);
    setWatchTime(0);
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earniverse-gold"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Watch & Earn</h1>
            <p className="text-muted-foreground">Earn rewards by watching ads and engaging with content</p>
          </div>
          <Card className="w-full md:w-auto">
            <CardContent className="p-4 flex items-center gap-3">
              <DollarSign className="text-earniverse-gold" size={24} />
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-xl font-bold">${balance?.toFixed(2) || "0.00"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Watch Ads & Earn Rewards</CardTitle>
              <CardDescription>
                Watch ads for {WATCH_TIME_REQUIRED} seconds to earn ${WATCH_TIME_REWARD.toFixed(2)} per view.
                You can earn up to ${(MAX_DAILY_SESSIONS * WATCH_TIME_REWARD).toFixed(2)} per day!
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isWatching ? (
                <div className="space-y-6">
                  <div className="aspect-video bg-black rounded-md overflow-hidden mb-4">
                    <iframe
                      src={adLink}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Progress: {watchTime} / {WATCH_TIME_REQUIRED} seconds</span>
                      <span className="text-sm">{Math.min(Math.round((watchTime / WATCH_TIME_REQUIRED) * 100), 100)}%</span>
                    </div>
                    <Progress value={Math.min((watchTime / WATCH_TIME_REQUIRED) * 100, 100)} />
                  </div>
                  
                  <Button onClick={resetAdView} variant="outline" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Cancel & Reset
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md flex flex-col items-center justify-center p-6 text-center">
                    <PlayCircle className="h-16 w-16 mb-4 text-earniverse-gold" />
                    <h3 className="text-xl font-medium mb-2">Earn By Watching Ads</h3>
                    <p className="text-muted-foreground mb-6">
                      Watch ads for just {WATCH_TIME_REQUIRED} seconds and earn ${WATCH_TIME_REWARD.toFixed(2)} per view!
                    </p>
                    <Button 
                      onClick={startWatching} 
                      disabled={sessionCount >= MAX_DAILY_SESSIONS}
                      className="bg-earniverse-gold hover:bg-earniverse-royal-gold text-black gap-2"
                    >
                      <PlayCircle className="h-4 w-4" />
                      {sessionCount >= MAX_DAILY_SESSIONS ? "Daily Limit Reached" : "Start Watching & Earn"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-muted/50 p-4">
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Watch time: {WATCH_TIME_REQUIRED} seconds
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-earniverse-gold" />
                  <span>Reward: ${WATCH_TIME_REWARD.toFixed(2)}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Progress</CardTitle>
                <CardDescription>Track your daily earning progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completed Today</span>
                      <span className="font-medium">{sessionCount} / {MAX_DAILY_SESSIONS}</span>
                    </div>
                    <Progress value={(sessionCount / MAX_DAILY_SESSIONS) * 100} />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Earned Today</span>
                      <span className="font-medium">${(sessionCount * WATCH_TIME_REWARD).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Potential Earnings</span>
                      <span className="font-medium">${(MAX_DAILY_SESSIONS * WATCH_TIME_REWARD).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important!</AlertTitle>
              <AlertDescription>
                Make sure to actually watch the ads to earn rewards. Engaging with the content ensures you get credited properly.
              </AlertDescription>
            </Alert>
            
            {/* Insert AdsTerra Ad */}
            <div className="ad-container rounded-lg overflow-hidden border bg-card p-2">
              <div className="text-xs text-muted-foreground mb-2">Advertisement</div>
              <div id="adsterra-container">
                <script type='text/javascript' src='//pl26348512.profitableratecpm.com/ea/00/c2/ea00c271bf6e93057d29e6b0345a8668.js'></script>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WatchAndEarn;
