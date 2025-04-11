
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface UserProfile {
  id: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
  role: string;
}

export interface UserBalance {
  id: string;
  user_id: string;
  balance: number;
  total_winnings: number;
  total_losses: number;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description?: string;
  reference_id?: string;
  created_at: string;
}

// Fetch user profile data
const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Unexpected error fetching profile:", error);
    return null;
  }
};

// Fetch user balance with fallback to edge function
const fetchUserBalance = async (userId: string): Promise<UserBalance | null> => {
  try {
    console.info(`Fetching balance for user: ${userId}`);
    
    // Try fetching balance directly from edge function first (more reliable)
    try {
      const response = await fetch(`https://fghuralujkiddeuncyml.supabase.co/functions/v1/get_user_balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId })
      });
      
      const edgeFunctionData = await response.json();
      
      if (edgeFunctionData.success) {
        console.info(`Successfully fetched balance from DB: ${edgeFunctionData.balance}`);
        
        // Create a balance object from the edge function response
        return {
          id: 'edge-function-balance',
          user_id: userId,
          balance: edgeFunctionData.balance || 0,
          total_winnings: 0, // Edge function doesn't return these yet
          total_losses: 0,   // Edge function doesn't return these yet
          updated_at: new Date().toISOString(),
        };
      }
      
      throw new Error(edgeFunctionData.error || "Failed to fetch balance from edge function");
    } catch (edgeFunctionError: any) {
      console.warn("Edge function fallback failed, trying direct DB access:", edgeFunctionError.message);
      
      // Fall back to direct database access
      const { data, error } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      console.info(`Successfully fetched balance from DB: ${data?.balance}`);
      return data;
    }
  } catch (error: any) {
    console.error("Error fetching user balance:", error);
    return null;
  } finally {
    console.info("Wallet data fetch complete");
  }
};

// Fetch user transactions
const fetchUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching user transactions:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching transactions:", error);
    return [];
  }
};

// Update user profile
const updateUserProfile = async (
  userId: string, 
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
};

// Export all functions as a service object
export const userService = {
  fetchUserProfile,
  fetchUserBalance,
  fetchUserTransactions,
  updateUserProfile
};

// Also export individual functions for backward compatibility
export {
  fetchUserProfile,
  fetchUserBalance,
  fetchUserTransactions,
  updateUserProfile
};
