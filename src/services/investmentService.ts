
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  category: string;
  amount_invested: number;
  current_value: number;
  purchase_date: string;
  last_updated: string;
}

export interface InvestmentOpportunity {
  id: string;
  name: string;
  description: string;
  category: string;
  min_investment: number;
  potential_return_min: number;
  potential_return_max: number;
  risk_level: 'Low' | 'Medium' | 'High';
}

// Sample investment opportunities
export const INVESTMENT_OPPORTUNITIES: InvestmentOpportunity[] = [
  {
    id: '1',
    name: 'High Yield Tech Fund',
    description: 'A diversified fund focused on high-growth technology companies',
    category: 'ETF',
    min_investment: 500,
    potential_return_min: 12,
    potential_return_max: 18,
    risk_level: 'Medium'
  },
  {
    id: '2',
    name: 'Green Energy Portfolio',
    description: 'Invest in renewable energy companies with strong ESG ratings',
    category: 'Stock',
    min_investment: 250,
    potential_return_min: 9,
    potential_return_max: 14,
    risk_level: 'Medium'
  },
  {
    id: '3',
    name: 'Real Estate Investment Trust',
    description: 'Commercial and residential property investments with regular dividends',
    category: 'REIT',
    min_investment: 1000,
    potential_return_min: 6,
    potential_return_max: 10,
    risk_level: 'Low'
  },
  {
    id: '4',
    name: 'Cryptocurrency Index',
    description: 'Diversified exposure to top performing cryptocurrencies',
    category: 'Crypto',
    min_investment: 100,
    potential_return_min: 15,
    potential_return_max: 30,
    risk_level: 'High'
  }
];

export const fetchUserInvestments = async (userId: string): Promise<Investment[]> => {
  try {
    const { data, error } = await supabase
      .from('user_investments')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching investments:', error);
      toast({
        title: "Failed to load investments",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching investments:', error);
    return [];
  }
};

export const createInvestment = async (
  userId: string,
  investment: Omit<Investment, 'id' | 'user_id' | 'last_updated'>
): Promise<{ success: boolean; investment?: Investment; error?: string }> => {
  try {
    // Check user's balance first
    const { data: balanceData, error: balanceError } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    if (balanceError || !balanceData) {
      return { success: false, error: 'Could not retrieve your balance' };
    }
    
    if (balanceData.balance < investment.amount_invested) {
      return { success: false, error: 'Insufficient balance for this investment' };
    }
    
    // Create the investment
    const newInvestment = {
      user_id: userId,
      name: investment.name,
      category: investment.category,
      amount_invested: investment.amount_invested,
      current_value: investment.current_value,
      purchase_date: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('user_investments')
      .insert(newInvestment)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating investment:', error);
      return { success: false, error: error.message };
    }
    
    // Deduct the investment amount from user's balance
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: -investment.amount_invested,
        type: 'investment',
        description: `Investment in ${investment.name}`
      });
    
    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return { success: false, error: 'Investment created but failed to record transaction' };
    }
    
    // Update user balance
    const { error: balanceUpdateError } = await supabase
      .from('user_balances')
      .update({ balance: balanceData.balance - investment.amount_invested })
      .eq('user_id', userId);
    
    if (balanceUpdateError) {
      console.error('Error updating balance:', balanceUpdateError);
      return { success: false, error: 'Investment created but failed to update balance' };
    }
    
    return { success: true, investment: data };
  } catch (error) {
    console.error('Unexpected error creating investment:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const updateInvestment = async (
  investmentId: string,
  userId: string,
  updates: Partial<Omit<Investment, 'id' | 'user_id'>>
): Promise<{ success: boolean; investment?: Investment; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('user_investments')
      .update({
        ...updates,
        last_updated: new Date().toISOString()
      })
      .eq('id', investmentId)
      .eq('user_id', userId) // Security check
      .select()
      .single();
    
    if (error) {
      console.error('Error updating investment:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, investment: data };
  } catch (error) {
    console.error('Unexpected error updating investment:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const sellInvestment = async (investmentId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get the investment to sell
    const { data: investment, error: fetchError } = await supabase
      .from('user_investments')
      .select('*')
      .eq('id', investmentId)
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !investment) {
      return { success: false, error: 'Investment not found' };
    }
    
    // Delete the investment
    const { error: deleteError } = await supabase
      .from('user_investments')
      .delete()
      .eq('id', investmentId)
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('Error deleting investment:', deleteError);
      return { success: false, error: deleteError.message };
    }
    
    // Add transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: investment.current_value,
        type: 'investment_sale',
        description: `Sale of investment in ${investment.name}`
      });
    
    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return { success: false, error: 'Investment sold but failed to record transaction' };
    }
    
    // Update user balance
    const { error: balanceUpdateError } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    if (balanceUpdateError) {
      console.error('Error fetching balance:', balanceUpdateError);
      return { success: false, error: 'Investment sold but failed to update balance' };
    }
    
    const { error: updateError } = await supabase
      .from('user_balances')
      .update({ 
        balance: balanceUpdateError.data.balance + investment.current_value 
      })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('Error updating balance:', updateError);
      return { success: false, error: 'Investment sold but failed to update balance' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error selling investment:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
