import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, TrendingUp, Users, Wallet, BarChart2, Calendar } from "lucide-react";
import { fetchUserBalance, fetchUserTransactions } from "@/services/userService";
import { fetchUserInvestments, Investment } from "@/services/investmentService";
import { fetchAllTasks, Task, fetchUserTasks, UserTask } from "@/services/taskService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      const fetchDashboardData = async () => {
        setIsLoadingData(true);
        try {
          // Fetch user data in parallel
          const [balanceData, investmentsData, tasksData, userTasksData] = await Promise.all([
            fetchUserBalance(user.id),
            fetchUserInvestments(user.id),
            fetchAllTasks(),
            fetchUserTasks(user.id)
          ]);
          
          setBalance(balanceData?.balance || 0);
          setInvestments(investmentsData);
          setTasks(tasksData);
          setUserTasks(userTasksData);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          toast({
            title: "Error",
            description: "Failed to load dashboard data",
            variant: "destructive",
          });
        } finally {
          setIsLoadingData(false);
        }
      };
      
      fetchDashboardData();
    }
  }, [user]);

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earniverse-gold"></div>
      </div>
    );
  }

  // Calculate total investment value
  const totalInvestmentValue = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount_invested, 0);
  const investmentChange = totalInvested > 0 
    ? ((totalInvestmentValue - totalInvested) / totalInvested) * 100 
    : 0;
  
  // Get pending tasks
  const pendingTasks = tasks.filter(task => 
    !userTasks.some(ut => ut.task_id === task.id && ut.status === 'completed')
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Balance" 
            value={`$${balance?.toFixed(2)}`} 
            change="+12.5%" 
            icon={<Wallet className="text-earniverse-gold" />} 
            isPositive={true}
          />
          <StatsCard 
            title="Active Investments" 
            value={investments.length.toString()} 
            change={investments.length > 0 ? `$${totalInvestmentValue.toFixed(2)}` : "No investments"} 
            icon={<BarChart2 className="text-earniverse-purple" />} 
            isPositive={investmentChange >= 0}
          />
          <StatsCard 
            title="Pending Tasks" 
            value={pendingTasks.length.toString()} 
            change={pendingTasks.length > 0 ? "Rewards available" : "All tasks complete"} 
            icon={<Calendar className="text-earniverse-blue" />} 
            isPositive={pendingTasks.length > 0}
          />
          <StatsCard 
            title="Referrals" 
            value="0" 
            change="Invite friends" 
            icon={<Users className="text-green-500" />} 
            isPositive={true}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Portfolio Summary
                <TrendingUp className={investmentChange >= 0 ? "text-green-500" : "text-red-500"} size={20} />
              </CardTitle>
              <CardDescription>Performance of your active investments</CardDescription>
            </CardHeader>
            <CardContent>
              {investments.length > 0 ? (
                <div className="space-y-4">
                  {investments.map(investment => {
                    const profit = investment.current_value - investment.amount_invested;
                    const percentChange = (profit / investment.amount_invested) * 100;
                    return (
                      <PortfolioItem 
                        key={investment.id}
                        name={investment.name} 
                        allocation={`${Math.round((investment.amount_invested / totalInvested) * 100)}%`} 
                        value={`$${investment.current_value.toFixed(2)}`} 
                        change={`${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`} 
                        isPositive={percentChange >= 0}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground mb-4">You don't have any investments yet</p>
                  <Button onClick={() => navigate("/investments")}>Start Investing</Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
              <CardDescription>Tasks with the highest rewards</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingTasks.length > 0 ? (
                <div className="space-y-4">
                  {pendingTasks.slice(0, 4).map(task => (
                    <TaskItem 
                      key={task.id}
                      title={task.title}
                      reward={`$${task.reward}`}
                      difficulty={task.difficulty}
                      dueDate={task.expiration_date ? new Date(task.expiration_date).toLocaleDateString() : "No expiration"}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground mb-4">No pending tasks</p>
                  <Button onClick={() => navigate("/tasks")}>View All Tasks</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  isPositive: boolean;
}

const StatsCard = ({ title, value, change, icon, isPositive }: StatsCardProps) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted-foreground text-sm">{title}</span>
          {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center mt-2 text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <span>{change}</span>
          {typeof change === 'string' && change.includes('%') && (
            <ArrowUpRight size={14} className={`ml-1 ${!isPositive && 'rotate-180'}`} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface PortfolioItemProps {
  name: string;
  allocation: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const PortfolioItem = ({ name, allocation, value, change, isPositive }: PortfolioItemProps) => {
  return (
    <div className="flex justify-between items-center p-2 hover:bg-muted rounded-md transition-colors">
      <div className="flex flex-col">
        <span className="font-medium">{name}</span>
        <span className="text-xs text-muted-foreground">{allocation}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'} text-sm`}>
          {isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowUpRight size={14} className="mr-1 rotate-180" />}
          {change}
        </span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  );
};

interface TaskItemProps {
  title: string;
  reward: string;
  difficulty: string;
  dueDate: string;
}

const TaskItem = ({ title, reward, difficulty, dueDate }: TaskItemProps) => {
  const getDifficultyColor = (diff: string) => {
    if (diff === "easy") return "bg-green-100 text-green-800";
    if (diff === "medium") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="flex justify-between items-center p-2 hover:bg-muted rounded-md transition-colors">
      <div className="flex flex-col">
        <span className="font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">Due: {dueDate}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(difficulty)}`}>
          {difficulty}
        </span>
        <span className="text-sm font-medium text-earniverse-gold">{reward}</span>
      </div>
    </div>
  );
};

export default Dashboard;
