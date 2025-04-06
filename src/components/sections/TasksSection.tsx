
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, DollarSign, Star } from "lucide-react";

const TasksSection = () => {
  return (
    <section id="tasks" className="py-20">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 space-y-6 animate-slide-right">
            <h2 className="gradient-text">Task Platform</h2>
            <p className="text-lg text-muted-foreground">
              Post tasks, complete work, and earn money in a secure environment with our 
              escrow payment system and reputation-based community.
            </p>
            
            <div className="space-y-4">
              <FeatureItem 
                icon={<CheckCircle size={20} />} 
                text="Create and manage tasks with rich details" 
              />
              <FeatureItem 
                icon={<Clock size={20} />} 
                text="Submit proof of work and get verified" 
              />
              <FeatureItem 
                icon={<DollarSign size={20} />} 
                text="Secure escrow payment system" 
              />
              <FeatureItem 
                icon={<Star size={20} />} 
                text="Build your reputation with reviews" 
              />
            </div>
            
            <div className="pt-4">
              <Button size="lg" className="bg-earniverse-blue hover:bg-earniverse-blue/90">
                Explore Tasks
              </Button>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-earniverse-blue/20 rounded-full blur-3xl"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TaskCard 
                  category="Design"
                  title="Logo Design for Tech Startup"
                  payment="$250"
                  deadline="3 days"
                  className="sm:mt-8 animate-zoom-in"
                />
                <TaskCard 
                  category="Writing"
                  title="Product Description (2000 words)"
                  payment="$120"
                  deadline="2 days"
                  className="animate-zoom-in"
                  style={{ animationDelay: "150ms" }}
                />
                <TaskCard 
                  category="Development"
                  title="Fix WordPress Plugin Bugs"
                  payment="$300"
                  deadline="4 days"
                  className="animate-zoom-in"
                  style={{ animationDelay: "300ms" }}
                />
                <TaskCard 
                  category="Marketing"
                  title="Social Media Campaign Setup"
                  payment="$180"
                  deadline="2 days"
                  className="sm:-mt-8 animate-zoom-in"
                  style={{ animationDelay: "450ms" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
}

const FeatureItem = ({ icon, text }: FeatureItemProps) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="text-earniverse-blue">{icon}</div>
      <span>{text}</span>
    </div>
  );
};

interface TaskCardProps {
  category: string;
  title: string;
  payment: string;
  deadline: string;
  className?: string;
  style?: React.CSSProperties;
}

const TaskCard = ({ category, title, payment, deadline, className, style }: TaskCardProps) => {
  return (
    <Card className={`p-5 hover:shadow-lg transition-shadow ${className}`} style={style}>
      <div className="flex justify-between items-center mb-3">
        <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded">
          {category}
        </span>
        <div className="flex items-center text-earniverse-gold font-semibold">
          <DollarSign size={16} className="mr-1" /> {payment}
        </div>
      </div>
      <h4 className="font-medium mb-3">{title}</h4>
      <div className="flex items-center text-xs text-muted-foreground">
        <Clock size={14} className="mr-1" />
        <span>Deadline: {deadline}</span>
      </div>
    </Card>
  );
};

export default TasksSection;
