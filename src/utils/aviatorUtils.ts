
/**
 * Utility functions for the Aviator game
 */

// Generate a random crash point with a house edge
export const generateCrashPoint = (houseEdge: number = 0.05): number => {
  // Formula based on Aviator game mechanics
  // Using house edge to adjust the distribution
  const e = 100 / (100 - houseEdge * 100);
  const r = Math.random();
  
  // Make sure we have a minimum value
  if (r < 0.01) return 1.0; // Guaranteed crash at 1.0 for 1% of games
  
  // Calculate crash point - higher values are less likely
  return Math.max(1.0, Math.floor((e / r) * 100) / 100);
};

// Calculate potential winnings at current multiplier
export const calculateWinnings = (betAmount: number, multiplier: number): number => {
  return betAmount * multiplier;
};

// Determine if game should still be running
export const shouldContinueGame = (currentMultiplier: number, crashPoint: number): boolean => {
  return currentMultiplier < crashPoint;
};

// Get color based on multiplier
export const getMultiplierColor = (multiplier: number): string => {
  if (multiplier < 1.5) return 'text-white';
  if (multiplier < 2) return 'text-blue-400';
  if (multiplier < 3) return 'text-green-400';
  if (multiplier < 5) return 'text-yellow-400';
  if (multiplier < 10) return 'text-orange-400';
  return 'text-red-400';
};

// Format the multiplier for display
export const formatMultiplier = (multiplier: number): string => {
  return `${multiplier.toFixed(2)}x`;
};
