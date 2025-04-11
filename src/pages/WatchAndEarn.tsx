
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BadgeCheck, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const WatchAndEarn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [watchCount, setWatchCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(5);
  const [isAdWatched, setIsAdWatched] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    // Track daily ad views
    const fetchWatchHistory = async () => {
      if (!user) return;
      
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data, error } = await supabase
          .from('transactions')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('type', 'ad_reward')
          .gte('created_at', today.toISOString())
          .order('created_at', { ascending: false });
          
        if (!error && data) {
          setWatchCount(data.length);
        }
      } catch (error) {
        console.error("Error fetching watch history:", error);
      }
    };
    
    fetchWatchHistory();
  }, [user, isAdWatched]);
  
  const handleAdInteraction = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to earn rewards from ads",
        variant: "destructive",
      });
      return;
    }
    
    if (watchCount >= dailyLimit) {
      toast({
        title: "Daily Limit Reached",
        description: `You've reached your limit of ${dailyLimit} ad rewards for today`,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate ad watching time (5 seconds)
      setTimeout(async () => {
        // Process the reward using the edge function
        const rewardAmount = 5; // $5 reward per ad watch
        
        const { data, error } = await supabase.functions.invoke("update_balance_after_game", {
          body: {
            p_user_id: user.id,
            p_amount: rewardAmount,
            p_game_session_id: null,
            p_transaction_type: 'ad_reward',
            p_description: 'Reward for watching ads'
          }
        });
        
        if (error) {
          throw new Error(error.message || "Failed to process reward");
        }
        
        setIsAdWatched(true);
        setWatchCount(prev => prev + 1);
        
        toast({
          title: "Reward Earned!",
          description: `$${rewardAmount} has been added to your wallet`,
        });
      }, 5000);
    } catch (error: any) {
      console.error("Error processing ad reward:", error);
      toast({
        title: "Error Processing Reward",
        description: error.message || "There was an error processing your reward",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setIsAdWatched(false);
      }, 6000);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Watch & Earn</h1>
          <p className="text-muted-foreground mt-2">
            Watch ads to earn rewards. Limited to {dailyLimit} rewards per day.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Daily Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Progress</CardTitle>
              <CardDescription>
                Track your daily ad watching progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-4">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">
                    {watchCount}/{dailyLimit}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ads watched today
                  </div>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5 mt-4">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${(watchCount / dailyLimit) * 100}%` }}
                ></div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                disabled={isLoading || watchCount >= dailyLimit}
                onClick={handleAdInteraction}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : watchCount >= dailyLimit ? (
                  <>
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    Daily Limit Reached
                  </>
                ) : (
                  "Watch Ad & Earn $5"
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Ad iframe */}
          <Card className="md:col-span-2 overflow-hidden">
            <CardHeader>
              <CardTitle>Featured Sponsor</CardTitle>
              <CardDescription>
                Interact with our sponsored content to earn rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] overflow-hidden">
              <div className="relative w-full h-full rounded-md overflow-hidden border border-border">
                <iframe 
                  src="https://www.profitableratecpm.com/a6ugtn3snv?key=58e9c4fff9308ccfc8012ab15de3da92"
                  className="w-full h-full"
                  title="Sponsored Content"
                  sandbox="allow-forms allow-scripts allow-same-origin"
                ></iframe>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Ads by AdsTerra
              </div>
              <Button variant="outline" size="sm" onClick={() => window.open('https://www.profitableratecpm.com/a6ugtn3snv?key=58e9c4fff9308ccfc8012ab15de3da92', '_blank')}>
                Open in New Window
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* AdsTerra embedded ad */}
        <div className="mt-6 p-4 border border-border rounded-md bg-background">
          <div className="text-sm text-muted-foreground mb-4">
            Featured Ads
          </div>
          <div id="adsterra-container" className="w-full min-h-[250px] flex items-center justify-center">
            <script type='text/javascript' src='//pl26348512.profitableratecpm.com/ea/00/c2/ea00c271bf6e93057d29e6b0345a8668.js'></script>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WatchAndEarn;
