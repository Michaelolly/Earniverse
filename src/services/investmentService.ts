
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { updateUserBalance } from "./userService";

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

// Sample investment opportunities - crypto and stocks
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
  },
  {
    id: '5',
    name: 'Bitcoin (BTC)',
    description: 'Direct investment in Bitcoin, the leading cryptocurrency',
    category: 'Crypto',
    min_investment: 50,
    potential_return_min: 20,
    potential_return_max: 40,
    risk_level: 'High'
  },
  {
    id: '6',
    name: 'Ethereum (ETH)',
    description: 'Direct investment in Ethereum, the leading smart contract platform',
    category: 'Crypto',
    min_investment: 50,
    potential_return_min: 18,
    potential_return_max: 35,
    risk_level: 'High'
  },
  {
    id: '7',
    name: 'Blue Chip Stock Portfolio',
    description: 'Collection of stable, established companies with consistent performance',
    category: 'Stock',
    min_investment: 300,
    potential_return_min: 8,
    potential_return_max: 12,
    risk_level: 'Low'
  },
  {
    id: '8',
    name: 'Growth Stocks Index',
    description: 'Focused on high-growth technology and consumer companies',
    category: 'Stock',
    min_investment: 200,
    potential_return_min: 10,
    potential_return_max: 20,
    risk_level: 'Medium'
  }
];

export const fetchUserInvestments = async (userId: string): Promise<Investment[]> => {
  try {
    // Log the userId to help with debugging
    console.log('Fetching investments for user:', userId);
    
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
    console.log(`Creating investment for user ${userId}: ${investment.name} - $${investment.amount_invested}`);
    
    // Deduct the investment amount from user's balance using the updateUserBalance function
    const balanceUpdate = await updateUserBalance(
      userId,
      -investment.amount_invested,
      'investment_purchase',
      `Investment in ${investment.name}`,
      undefined // No reference ID yet
    );
    
    if (!balanceUpdate.success) {
      console.error('Failed to update balance:', balanceUpdate.error);
      return { success: false, error: balanceUpdate.error || 'Could not update balance' };
    }
    
    console.log(`Balance updated successfully. New balance: ${balanceUpdate.newBalance}`);
    
    // Create the investment record
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
      // If investment creation fails, we should refund the user
      await updateUserBalance(
        userId,
        investment.amount_invested, // Refund the investment amount
        'investment_refund',
        `Refund for failed investment in ${investment.name}`,
        undefined
      );
      return { success: false, error: error.message };
    }
    
    console.log('Investment record created successfully:', data);
    
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

export const sellInvestment = async (investmentId: string, userId: string): Promise<{ success: boolean; error?: string; newBalance?: number }> => {
  try {
    // Get the investment to sell
    const { data: investment, error: fetchError } = await supabase
      .from('user_investments')
      .select('*')
      .eq('id', investmentId)
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !investment) {
      console.error('Error fetching investment to sell:', fetchError);
      return { success: false, error: 'Investment not found' };
    }
    
    console.log(`Selling investment for user ${userId}: ${investment.name} - Current value: $${investment.current_value}`);
    
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
    
    // Add the investment's current value to user's balance
    const balanceUpdate = await updateUserBalance(
      userId,
      investment.current_value,
      'investment_sale',
      `Sale of investment in ${investment.name}`,
      investmentId
    );
    
    if (!balanceUpdate.success) {
      console.error('Error updating balance after investment sale:', balanceUpdate.error);
      
      // If the balance update fails, we should try to restore the investment
      await supabase.from('user_investments').insert(investment);
      
      return { success: false, error: 'Investment sold but failed to update balance' };
    }
    
    console.log(`Balance updated successfully after investment sale. New balance: ${balanceUpdate.newBalance}`);
    
    return { 
      success: true,
      newBalance: balanceUpdate.newBalance
    };
  } catch (error) {
    console.error('Unexpected error selling investment:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
