
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Task {
  id: string;
  created_at: string;
  created_by: string | null;
  title: string;
  description: string | null;
  reward: number;
  difficulty: string;
  is_active: boolean | null;
  expiration_date: string | null;
}

export interface UserTask {
  id: string;
  task_id: string;
  user_id: string;
  status: string;
  completed_at: string | null;
  task?: Task;
}

export const fetchAllTasks = async (): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching tasks:", error);
    return [];
  }
};

export const fetchUserTasks = async (userId: string): Promise<UserTask[]> => {
  try {
    console.log("Fetching tasks for user:", userId);
    
    const { data, error } = await supabase
      .from('user_tasks')
      .select('*, task:task_id(*)')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error fetching user tasks:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching user tasks:", error);
    return [];
  }
};

export const fetchAvailableTasks = async (userId: string): Promise<Task[]> => {
  try {
    // Get all active tasks
    const { data: activeTasks, error: activeTasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('is_active', true)
      .is('expiration_date', null)
      .or('expiration_date.gt.now()');
    
    if (activeTasksError) {
      console.error("Error fetching active tasks:", activeTasksError);
      return [];
    }
    
    // Get tasks user has already claimed or completed
    const { data: userTasks, error: userTasksError } = await supabase
      .from('user_tasks')
      .select('task_id')
      .eq('user_id', userId);
    
    if (userTasksError) {
      console.error("Error fetching user tasks:", userTasksError);
      return [];
    }
    
    // Filter out tasks the user has already claimed
    const claimedTaskIds = (userTasks || []).map(ut => ut.task_id);
    const availableTasks = (activeTasks || []).filter(task => !claimedTaskIds.includes(task.id));
    
    return availableTasks;
  } catch (error) {
    console.error("Unexpected error fetching available tasks:", error);
    return [];
  }
};

export const claimTask = async (taskId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('user_tasks')
      .insert({
        user_id: userId,
        task_id: taskId,
        status: 'in_progress'
      });
    
    if (error) {
      console.error("Error claiming task:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Unexpected error claiming task:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};

export const fetchUserTask = async (taskId: string, userId: string): Promise<UserTask | null> => {
  try {
    const { data, error } = await supabase
      .from('user_tasks')
      .select('*, task:task_id(*)')
      .eq('task_id', taskId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching user task:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Unexpected error fetching user task:", error);
    return null;
  }
};

export const completeTask = async (taskId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Mark the task as completed
    const { error } = await supabase
      .from('user_tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('task_id', taskId)
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error completing task:", error);
      return { success: false, error: error.message };
    }
    
    // Get the task details to know the reward
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();
    
    if (taskError || !task) {
      console.error("Error fetching task details:", taskError);
      return { success: false, error: "Task completed but reward not processed" };
    }
    
    // Create a transaction record for the reward
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: task.reward,
        type: 'task_reward',
        description: `Reward for completing: ${task.title}`
      });
    
    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      return { success: false, error: "Task completed but reward transaction failed" };
    }
    
    // Get user's current balance
    const { data: balanceData, error: balanceError } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    if (balanceError || !balanceData) {
      console.error("Error fetching balance:", balanceError);
      return { success: false, error: "Task completed but balance update failed" };
    }
    
    // Update user's balance
    const { error: updateError } = await supabase
      .from('user_balances')
      .update({ 
        balance: balanceData.balance + task.reward 
      })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error("Error updating balance:", updateError);
      return { success: false, error: "Task completed but balance update failed" };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Unexpected error completing task:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};

export const createTask = async (task: Omit<Task, "id" | "created_at">): Promise<{ success: boolean; task?: Task; error?: string }> => {
  try {
    console.log("Creating task:", task);
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating task:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, task: data };
  } catch (error) {
    console.error("Unexpected error creating task:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};
