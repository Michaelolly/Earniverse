
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  reward: number;
  difficulty: string;
  is_active: boolean | null;
  created_by: string | null;
  created_at: string;
  expiration_date: string | null;
}

export interface UserTask {
  id: string;
  user_id: string;
  task_id: string;
  status: string;
  completed_at: string | null;
}

export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Failed to load tasks",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching tasks:', error);
    return [];
  }
};

export const fetchUserTasks = async (userId: string): Promise<UserTask[]> => {
  try {
    const { data, error } = await supabase
      .from('user_tasks')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user tasks:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching user tasks:', error);
    return [];
  }
};

export const startTask = async (
  userId: string,
  taskId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if the user has already started this task
    const { data: existingTask, error: checkError } = await supabase
      .from('user_tasks')
      .select('id')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing task:', checkError);
      return { success: false, error: checkError.message };
    }
    
    if (existingTask) {
      return { success: false, error: 'You have already started this task' };
    }
    
    // Start the task
    const { error } = await supabase
      .from('user_tasks')
      .insert({
        user_id: userId,
        task_id: taskId,
        status: 'in_progress'
      });
    
    if (error) {
      console.error('Error starting task:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error starting task:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const completeTask = async (
  userId: string,
  taskId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get the task details to know the reward
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('reward')
      .eq('id', taskId)
      .single();
    
    if (taskError || !task) {
      console.error('Error fetching task details:', taskError);
      return { success: false, error: 'Task not found' };
    }
    
    // Update the user task
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('user_tasks')
      .update({
        status: 'completed',
        completed_at: now
      })
      .eq('user_id', userId)
      .eq('task_id', taskId);
    
    if (updateError) {
      console.error('Error completing task:', updateError);
      return { success: false, error: updateError.message };
    }
    
    // Add transaction for the reward
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: task.reward,
        type: 'task_reward',
        description: `Reward for completing task`
      });
    
    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return { success: false, error: 'Task completed but failed to issue reward' };
    }
    
    // Update user balance
    const { data: balanceData, error: balanceError } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    if (balanceError || !balanceData) {
      console.error('Error fetching balance:', balanceError);
      return { success: false, error: 'Task completed but failed to update balance' };
    }
    
    const { error: updateBalanceError } = await supabase
      .from('user_balances')
      .update({ balance: balanceData.balance + task.reward })
      .eq('user_id', userId);
    
    if (updateBalanceError) {
      console.error('Error updating balance:', updateBalanceError);
      return { success: false, error: 'Task completed but failed to update balance' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error completing task:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Admin functions
export const createTask = async (
  task: Omit<Task, 'id' | 'created_at'>
): Promise<{ success: boolean; task?: Task; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, task: data };
  } catch (error) {
    console.error('Unexpected error creating task:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
