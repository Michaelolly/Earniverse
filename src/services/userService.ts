
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UserBalance {
  id: string;
  user_id: string;
  balance: number;
  total_winnings: number | null;
  total_losses: number | null;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  reference_id: string | null;
  created_at: string;
  description: string | null;
}

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (error: any) {
    console.error('Unexpected error fetching user profile:', error);
    return null;
  }
};

export const fetchUserBalance = async (userId: string): Promise<UserBalance | null> => {
  try {
    const { data, error } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user balance:', error);
      return null;
    }
    
    return data;
  } catch (error: any) {
    console.error('Unexpected error fetching user balance:', error);
    return null;
  }
};

export const fetchUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Unexpected error fetching user transactions:', error);
    return [];
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'role' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, profile: data };
  } catch (error: any) {
    console.error('Unexpected error updating profile:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const processDeposit = async (
  userId: string, 
  newBalance: number,
  transactionData: {
    user_id: string;
    amount: number;
    type: string;
    description: string;
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("Processing deposit for user:", userId, "with new balance:", newBalance);
    
    // For guest users, we might need to create a balance record first
    if (userId === "guest-user") {
      // Check if a record exists
      const { data: existingBalance } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', userId);
      
      if (!existingBalance || existingBalance.length === 0) {
        // Create a new balance record for guest
        const { error: insertError } = await supabase
          .from('user_balances')
          .insert({
            user_id: userId,
            balance: newBalance,
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error('Error creating balance for guest:', insertError);
          return { success: false, error: insertError.message };
        }
      } else {
        // Update existing balance
        const { error: updateError } = await supabase
          .from('user_balances')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        if (updateError) {
          console.error('Error updating balance:', updateError);
          return { success: false, error: updateError.message };
        }
      }
    } else {
      // Regular user, just update balance
      const { error: balanceError } = await supabase
        .from('user_balances')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (balanceError) {
        console.error('Error updating balance:', balanceError);
        return { success: false, error: balanceError.message };
      }
    }
    
    // Create transaction record - this is now separate from the balance update
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: transactionData.user_id,
        amount: transactionData.amount,
        type: transactionData.type,
        description: transactionData.description,
        created_at: new Date().toISOString()
      });
    
    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return { success: false, error: transactionError.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error processing deposit:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return data.role === 'admin';
  } catch (error: any) {
    console.error('Unexpected error checking admin status:', error);
    return false;
  }
};

export const fetchAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error('Error fetching all users:', error);
      toast({
        title: "Failed to load users",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Unexpected error fetching all users:', error);
    return [];
  }
};

export const fetchAllBalances = async (): Promise<UserBalance[]> => {
  try {
    const { data, error } = await supabase
      .from('user_balances')
      .select('*');
    
    if (error) {
      console.error('Error fetching all balances:', error);
      toast({
        title: "Failed to load balances",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Unexpected error fetching all balances:', error);
    return [];
  }
};

export const makeUserAdmin = async (userEmail: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.rpc('make_user_admin', { user_email: userEmail });
    
    if (error) {
      console.error('Error making user admin:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error making user admin:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const userService = {
  fetchUserProfile,
  fetchUserBalance,
  fetchUserTransactions,
  updateUserProfile,
  isUserAdmin,
  fetchAllUsers,
  fetchAllBalances,
  makeUserAdmin,
  processDeposit
};
