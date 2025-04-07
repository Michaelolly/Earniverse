// src/pages/Admin.tsx
import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { createTask, fetchAllTasks, Task } from "@/services/taskService";

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    refreshTasks();
  }, []);

  const refreshTasks = async () => {
    const allTasks = await fetchAllTasks();
    setTasks(allTasks);
  };

  const handleCreateTask = async (data: any) => {
    setIsSubmittingTask(true);
    
    try {
      const taskData = {
        title: data.title,
        description: data.description || '', // Ensure description is not null/undefined
        reward: parseFloat(data.reward),
        difficulty: data.difficulty,
        is_active: true,
        created_by: user?.id || null,
        expiration_date: data.expirationDate ? new Date(data.expirationDate).toISOString() : null
      };
      
      const result = await createTask(taskData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Task created successfully",
        });
        reset();
        refreshTasks();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create task",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error", 
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingTask(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earniverse-gold"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Create New Task</h2>
          <form onSubmit={handleSubmit(handleCreateTask)} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" type="text" {...register("title", { required: "Title is required" })} />
              {errors.title && <p className="text-red-500">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" type="text" {...register("description")} />
            </div>
            <div>
              <Label htmlFor="reward">Reward</Label>
              <Input id="reward" type="number" step="0.01" {...register("reward", {
                required: "Reward is required",
                valueAsNumber: true,
                validate: (value: number) => value > 0 || "Reward must be positive",
              })} />
              {errors.reward && <p className="text-red-500">{errors.reward.message}</p>}
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select difficulty" {...register("difficulty", { required: "Difficulty is required" })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy" {...register("difficulty")}>Easy</SelectItem>
                  <SelectItem value="medium" {...register("difficulty")}>Medium</SelectItem>
                  <SelectItem value="hard" {...register("difficulty")}>Hard</SelectItem>
                </SelectContent>
              </Select>
              {errors.difficulty && <p className="text-red-500">Difficulty is required</p>}
            </div>
            <div>
              <Label>Expiration Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      // Manually set the expirationDate value in the form
                      setValue("expirationDate", date);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input type="hidden" {...register("expirationDate")} />
            </div>

            <Button type="submit" disabled={isSubmittingTask} className="bg-earniverse-purple text-white">
              {isSubmittingTask ? "Creating..." : "Create Task"}
            </Button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Existing Tasks</h2>
          <ul>
            {tasks.map(task => (
              <li key={task.id} className="py-2 border-b border-gray-200">
                {task.title} - Reward: ${task.reward} - Difficulty: {task.difficulty}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
