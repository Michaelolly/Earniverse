
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, DollarSign, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Tasks = () => {
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Tasks</h1>
          <Button className="bg-earniverse-gold hover:bg-earniverse-royal-gold text-black">
            <Zap className="mr-2" size={16} />
            Find New Tasks
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-4">
                  <CheckSquare className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Completed</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
              </div>
              <div className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs">+3 today</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-4">
                  <Clock className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Pending</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
              <div className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs">5 new</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-amber-100 p-2 rounded-full mr-4">
                  <DollarSign className="text-amber-600" size={24} />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Earnings</p>
                  <p className="text-2xl font-bold">$345.20</p>
                </div>
              </div>
              <div className="text-amber-600 bg-amber-100 px-2 py-1 rounded text-xs">+$42 today</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Tasks</CardTitle>
              <CardDescription>Complete tasks to earn rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TaskCard 
                  title="Complete User Profile"
                  description="Fill out all your profile information"
                  reward="$10"
                  difficulty="Easy"
                  timeRequired="5 min"
                />
                <TaskCard 
                  title="Verify Your Email"
                  description="Verify your email address to secure your account"
                  reward="$5"
                  difficulty="Easy"
                  timeRequired="2 min"
                />
                <TaskCard 
                  title="Complete Survey About Financial Habits"
                  description="Answer a 10-question survey about your financial habits and goals"
                  reward="$25"
                  difficulty="Medium"
                  timeRequired="15 min"
                />
                <TaskCard 
                  title="Refer a Friend"
                  description="Invite friends to join Earniverse and earn for each successful referral"
                  reward="$20"
                  difficulty="Medium"
                  timeRequired="5 min"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Streak</CardTitle>
              <CardDescription>Log in daily to earn bonus rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Current streak: 3 days</span>
                  <span className="text-sm font-medium">7 days target</span>
                </div>
                <Progress value={43} className="h-3" />
                
                <div className="flex justify-between gap-2 mt-4">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <div 
                      key={day} 
                      className={`flex-1 aspect-square flex items-center justify-center rounded-full text-center text-sm
                        ${day <= 3 
                          ? 'bg-earniverse-gold text-black font-medium' 
                          : 'bg-muted text-muted-foreground'}`}
                    >
                      {day <= 3 && <CheckSquare size={16} />}
                      {day > 3 && day}
                    </div>
                  ))}
                </div>
                <div className="text-center text-sm text-muted-foreground mt-2">
                  Complete 7-day streak to earn $50 bonus
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

interface TaskCardProps {
  title: string;
  description: string;
  reward: string;
  difficulty: string;
  timeRequired: string;
}

const TaskCard = ({ title, description, reward, difficulty, timeRequired }: TaskCardProps) => {
  const getDifficultyColor = (diff: string) => {
    if (diff === "Easy") return "bg-green-100 text-green-800";
    if (diff === "Medium") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="space-y-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            {timeRequired}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4 sm:mt-0">
        <div className="font-bold text-earniverse-gold">{reward}</div>
        <Button>Start Task</Button>
      </div>
    </div>
  );
};

export default Tasks;
