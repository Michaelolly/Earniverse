
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, TrendingUp, Users, Wallet, BarChart2, Calendar } from "lucide-react";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earniverse-gold"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Balance" 
            value="$8,459.32" 
            change="+12.5%" 
            icon={<Wallet className="text-earniverse-gold" />} 
            isPositive={true}
          />
          <StatsCard 
            title="Active Investments" 
            value="5" 
            change="+2" 
            icon={<BarChart2 className="text-earniverse-purple" />} 
            isPositive={true}
          />
          <StatsCard 
            title="Pending Tasks" 
            value="12" 
            change="-3" 
            icon={<Calendar className="text-earniverse-blue" />} 
            isPositive={true}
          />
          <StatsCard 
            title="Referrals" 
            value="8" 
            change="+3" 
            icon={<Users className="text-green-500" />} 
            isPositive={true}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Portfolio Summary
                <TrendingUp className="text-green-500" size={20} />
              </CardTitle>
              <CardDescription>Performance of your active investments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <PortfolioItem 
                  name="Tech Growth ETF" 
                  allocation="35%" 
                  value="$2,960.76" 
                  change="+5.6%" 
                  isPositive={true}
                />
                <PortfolioItem 
                  name="Bitcoin (BTC)" 
                  allocation="25%" 
                  value="$2,114.83" 
                  change="+12.3%" 
                  isPositive={true}
                />
                <PortfolioItem 
                  name="Green Energy Fund" 
                  allocation="20%" 
                  value="$1,691.86" 
                  change="-2.1%" 
                  isPositive={false}
                />
                <PortfolioItem 
                  name="Corporate Bonds" 
                  allocation="20%" 
                  value="$1,691.86" 
                  change="+0.8%" 
                  isPositive={true}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
              <CardDescription>Tasks with the highest rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TaskItem 
                  title="Complete KYC Verification" 
                  reward="$50" 
                  difficulty="Easy" 
                  dueDate="Today"
                />
                <TaskItem 
                  title="Daily Login Streak" 
                  reward="$5" 
                  difficulty="Easy" 
                  dueDate="Today"
                />
                <TaskItem 
                  title="Refer 3 Friends" 
                  reward="$100" 
                  difficulty="Medium" 
                  dueDate="5 days"
                />
                <TaskItem 
                  title="Complete Survey" 
                  reward="$25" 
                  difficulty="Easy" 
                  dueDate="3 days"
                />
              </div>
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
          <ArrowUpRight size={14} className={`ml-1 ${!isPositive && 'rotate-180'}`} />
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
    if (diff === "Easy") return "bg-green-100 text-green-800";
    if (diff === "Medium") return "bg-yellow-100 text-yellow-800";
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
