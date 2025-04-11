
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { updateUserBalance } from "./userService";

export interface Game {
  id: string;
  name: string;
  description: string | null;
  min_bet: number;
  max_bet: number;
  house_edge: number;
  image_url: string | null;
  active: boolean;
}

export interface GameSession {
  id: string;
  user_id: string;
  game_id: string;
  bet_amount: number;
  win_amount: number | null;
  outcome: string;
  played_at: string;
}

export const fetchGames = async (): Promise<Game[]> => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('active', true);
    
    if (error) {
      console.error('Error fetching games:', error);
      toast({
        title: "Failed to load games",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Unexpected error fetching games:', error);
    return [];
  }
};

export const fetchGameHistory = async (userId: string): Promise<GameSession[]> => {
  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching game history:', error);
      return [];
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Unexpected error fetching game history:', error);
    return [];
  }
};

export const playGame = async (
  userId: string,
  gameId: string,
  betAmount: number,
  gameOutcome: { outcome: string; win_amount: number | null }
): Promise<{ success: boolean; session?: GameSession; error?: string; newBalance?: number }> => {
  try {
    // First, check user's balance
    const { data: balanceData, error: balanceError } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    if (balanceError || !balanceData) {
      return { success: false, error: 'Could not retrieve your balance' };
    }
    
    if (balanceData.balance < betAmount) {
      return { success: false, error: 'Insufficient balance' };
    }
    
    // Create the game session record
    const gameSession = {
      user_id: userId,
      game_id: gameId,
      bet_amount: betAmount,
      win_amount: gameOutcome.win_amount,
      outcome: gameOutcome.outcome,
    };
    
    const { data: sessionData, error: sessionError } = await supabase
      .from('game_sessions')
      .insert(gameSession)
      .select()
      .single();
    
    if (sessionError || !sessionData) {
      return { success: false, error: 'Failed to record game session' };
    }
    
    // Calculate balance change based on the outcome
    const balanceChange = (gameOutcome.win_amount || 0) - betAmount;
    const transactionType = balanceChange >= 0 ? 'game_win' : 'game_loss';
    const description = `${transactionType === 'game_win' ? 'Won' : 'Lost'} in ${gameId}`;
    
    // Update user's balance
    const balanceUpdate = await updateUserBalance(
      userId,
      balanceChange,
      transactionType,
      description,
      sessionData.id
    );
    
    if (!balanceUpdate.success) {
      return { success: false, error: balanceUpdate.error };
    }
    
    return { 
      success: true, 
      session: sessionData,
      newBalance: balanceUpdate.newBalance
    };
  } catch (error: any) {
    console.error('Error in playGame:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const playCoinFlip = async (userId: string, betAmount: number, userChoice: 'heads' | 'tails'): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    // Get the coin flip game
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('id')
      .eq('name', 'Coin Flip')
      .single();
    
    if (gameError || !gameData) {
      return { success: false, error: 'Game not found' };
    }
    
    // Generate random outcome (0 for heads, 1 for tails)
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const isWin = result === userChoice;
    
    // Calculate win amount (2x bet for a win, 0 for a loss)
    const winAmount = isWin ? betAmount * 2 : 0;
    
    // Record game outcome
    const gameOutcome = {
      outcome: `${userChoice} - ${result} - ${isWin ? 'Win' : 'Loss'}`,
      win_amount: winAmount
    };
    
    const playResult = await playGame(userId, gameData.id, betAmount, gameOutcome);
    
    if (!playResult.success) {
      return { success: false, error: playResult.error };
    }
    
    return { 
      success: true, 
      message: isWin 
        ? `You won! The coin landed on ${result}` 
        : `You lost. The coin landed on ${result}`
    };
  } catch (error: any) {
    console.error('Error in playCoinFlip:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const playDiceRoll = async (userId: string, betAmount: number, userChoice: 'higher' | 'lower'): Promise<{ success: boolean; message?: string; error?: string; roll?: number }> => {
  try {
    // Get the dice roll game
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('id')
      .eq('name', 'Dice Roll')
      .single();
    
    if (gameError || !gameData) {
      return { success: false, error: 'Game not found' };
    }
    
    // Roll a dice (1-6)
    const roll = Math.floor(Math.random() * 6) + 1;
    const isWin = (userChoice === 'higher' && roll > 3) || (userChoice === 'lower' && roll <= 3);
    
    // Calculate win amount (2x bet for a win, 0 for a loss)
    const winAmount = isWin ? betAmount * 2 : 0;
    
    // Record game outcome
    const gameOutcome = {
      outcome: `${userChoice} - ${roll} - ${isWin ? 'Win' : 'Loss'}`,
      win_amount: winAmount
    };
    
    const playResult = await playGame(userId, gameData.id, betAmount, gameOutcome);
    
    if (!playResult.success) {
      return { success: false, error: playResult.error };
    }
    
    return { 
      success: true, 
      roll,
      message: isWin 
        ? `You won! The dice rolled ${roll}` 
        : `You lost. The dice rolled ${roll}`
    };
  } catch (error: any) {
    console.error('Error in playDiceRoll:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const playAviator = async (
  userId: string, 
  betAmount: number, 
  cashoutMultiplier: number | null, 
  crashPoint: number
): Promise<{ success: boolean; message?: string; error?: string; newBalance?: number }> => {
  try {
    // Get the aviator game
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('id')
      .eq('name', 'Aviat')
      .single();
    
    if (gameError || !gameData) {
      return { success: false, error: 'Game not found' };
    }
    
    // Determine outcome
    const isWin = cashoutMultiplier !== null && cashoutMultiplier <= crashPoint;
    
    // Calculate win amount (bet * multiplier for a win, 0 for a loss)
    const winAmount = isWin ? betAmount * cashoutMultiplier : 0;
    
    // Record game outcome
    const gameOutcome = {
      outcome: `${isWin ? 'Win' : 'Loss'} - Crashed at ${crashPoint.toFixed(2)}${cashoutMultiplier ? `, cashed out at ${cashoutMultiplier.toFixed(2)}` : ', no cashout'}`,
      win_amount: winAmount
    };
    
    const playResult = await playGame(userId, gameData.id, betAmount, gameOutcome);
    
    if (!playResult.success) {
      return { success: false, error: playResult.error };
    }
    
    return { 
      success: true, 
      message: isWin 
        ? `You won $${winAmount.toFixed(2)} by cashing out at ${cashoutMultiplier.toFixed(2)}x` 
        : `You lost $${betAmount.toFixed(2)}. Plane crashed at ${crashPoint.toFixed(2)}x`,
      newBalance: playResult.newBalance
    };
  } catch (error: any) {
    console.error('Error in playAviator:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
