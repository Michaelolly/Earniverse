
// Payment integration configuration
export const flutterwaveConfig = {
  publicKey: "FLWPUBK_TEST-391723225190562db3f51b7c56ec0ac7-X",
  // Note: Secret key and encryption key should be stored securely on the server
  // and not exposed in the frontend code. For the purpose of this implementation,
  // we're only using the public key.
};

export const stripeConfig = {
  publicKey: "pk_test_51QPfgfCLTqMuvSE59Ik8cTm8nGncF7E9AOc4SnVmOp9vgKiaIaTPNyLzgsZR5N1PzTreIXC5yk6JpbkzG7hERFQP00OLs5TOv2",
  // Note: Secret key should be stored securely on the server
  // and not exposed in the frontend code.
};

// Demo payment configuration
export const demoPaymentConfig = {
  enabled: true,
  amounts: [10, 50, 100, 500],
  // Process speed in ms - set to 0 for immediate processing
  processingDelay: 500
};

// Investment data configuration
export const investmentConfig = {
  cryptoRefreshInterval: 30000, // 30 seconds refresh interval
  stockRefreshInterval: 300000, // 5 minute refresh interval
  apiEndpoints: {
    crypto: 'https://api.bitget.com',
    stocks: 'https://finnhub.io/api/v1'
  },
  cryptoSymbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'BNBUSDT']
};
