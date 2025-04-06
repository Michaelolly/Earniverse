
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { UserProfile, UserBalance, fetchAllUsers, fetchAllBalances, makeUserAdmin } from "@/services/userService";
import { createTask } from "@/services/taskService";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { isUserAdmin } from "@/services/userService";

const taskFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional().nullable(),
  reward: z.coerce.number().positive({ message: "Reward must be positive" }),
  difficulty: z.string().min(1, { message: "Please select a difficulty" }),
  expiration_date: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

// Define the full Task type that matches what createTask expects
export interface Task {
  id: string;
  created_at: string;
  created_by: string;
  title: string;
  description?: string | null;
  reward: number;
  difficulty: string;
  is_active: boolean;
  expiration_date?: string | null;
}

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      reward: 10,
      difficulty: "easy",
      is_active: true,
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    const checkAdmin = async () => {
      if (user) {
        try {
          console.log("Checking admin status for user:", user.id);
          const admin = await isUserAdmin(user.id);
          
          if (!admin) {
            toast({
              title: "Access Denied",
              description: "You don't have permission to access this page",
              variant: "destructive",
            });
            navigate("/dashboard");
            return;
          }
          
          setIsAdmin(admin);
          await fetchData();
        } catch (error) {
          console.error("Error checking admin status:", error);
          toast({
            title: "Error",
            description: "Failed to verify admin privileges",
            variant: "destructive",
          });
          navigate("/dashboard");
        }
      }
    };
    
    checkAdmin();
  }, [user, loading, navigate]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      console.log("Fetching admin data...");
      const fetchedUsers = await fetchAllUsers();
      const fetchedBalances = await fetchAllBalances();
      
      setUsers(fetchedUsers);
      setBalances(fetchedBalances);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleMakeAdmin = async () => {
    if (!adminEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a valid user email",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const result = await makeUserAdmin(adminEmail);
    
    if (result.success) {
      toast({
        title: "Success",
        description: `${adminEmail} has been made an admin`,
      });
      setAdminEmail("");
      await fetchData();
    } else {
      toast({
        title: "Failed to update user",
        description: result.error || "An error occurred",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const onSubmitTask = async (values: z.infer<typeof taskFormSchema>) => {
    if (!user) return;

    setIsSubmitting(true);
    // Ensure all required fields are present in the task
    const taskData: Omit<Task, "id" | "created_at"> = {
      title: values.title,
      description: values.description || null,
      reward: values.reward,
      difficulty: values.difficulty,
      is_active: values.is_active,
      created_by: user.id,
      expiration_date: values.expiration_date || null,
    };
    
    const result = await createTask(taskData);
    
    if (result.success) {
      toast({
        title: "Task Created",
        description: "The task has been created successfully",
      });
      form.reset();
    } else {
      toast({
        title: "Failed to create task",
        description: result.error || "An error occurred",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earniverse-purple"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Redirect handled in useEffect
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, tasks, and platform data</p>
          </div>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="platform">Platform Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Make User Admin</CardTitle>
                <CardDescription>Grant admin privileges to a user</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="admin-email">User Email</Label>
                    <Input 
                      id="admin-email" 
                      type="email" 
                      placeholder="user@example.com" 
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleMakeAdmin} disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "Make Admin"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user accounts and balances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const userBalance = balances.find(b => b.user_id === user.id);
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.username || user.id.slice(0, 8)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? "default" : "outline"}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>${userBalance?.balance.toFixed(2) || '0.00'}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(user.created_at), "MMM d, yyyy")}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Create New Task</CardTitle>
                <CardDescription>Add a new task for users to complete</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitTask)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter task title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter task description" 
                              className="h-24" 
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-4">
                      <FormField
                        control={form.control}
                        name="reward"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Reward ($)</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} step={0.01} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Difficulty</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="expiration_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiration Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormDescription>
                            Leave empty for no expiration
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Active (immediately available to users)
                          </FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Task"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="platform">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Total Users</dt>
                      <dd className="font-medium">{users.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Admins</dt>
                      <dd className="font-medium">{users.filter(u => u.role === 'admin').length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Regular Users</dt>
                      <dd className="font-medium">{users.filter(u => u.role === 'user').length}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Total Balance</dt>
                      <dd className="font-medium">
                        ${balances.reduce((sum, b) => sum + b.balance, 0).toFixed(2)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Average Balance</dt>
                      <dd className="font-medium">
                        ${balances.length ? (balances.reduce((sum, b) => sum + b.balance, 0) / balances.length).toFixed(2) : '0.00'}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
