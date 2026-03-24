// ============================================================
// FundFlow Configuration
// Update CONTRACT_ID after deploying with:
// stellar contract deploy --wasm target/wasm32-unknown-unknown/release/fundflow.wasm \
//   --source <your-identity> --network testnet
// ============================================================

export const CONFIG = {
  // Stellar Testnet
  NETWORK: 'TESTNET',
  NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015',
  RPC_URL: 'https://soroban-testnet.stellar.org',
  HORIZON_URL: 'https://horizon-testnet.stellar.org',

  // Contract — replace after deployment
  CONTRACT_ID: import.meta.env.VITE_CONTRACT_ID || 'YOUR_CONTRACT_ID_HERE',


  // Campaign settings
  FUNDING_GOAL_XLM: 10000, // 10,000 XLM

  // Polling interval (ms)
  POLL_INTERVAL: 4000,

  // XLM decimals (Stellar uses 7 decimal places)
  XLM_DECIMALS: 10_000_000n,

  // Minimum donation (1 XLM in stroops)
  MIN_DONATION: 1,
};
