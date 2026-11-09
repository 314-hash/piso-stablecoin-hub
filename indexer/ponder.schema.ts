import { createSchema } from '@ponder/core';

export default createSchema((p) => ({
  Token: p.createTable({
    id: p.string(), // Token contract address
    name: p.string(),
    symbol: p.string(),
    decimals: p.int(),
    issuerName: p.string(),
    issuerWebsite: p.string(),
    reserveProofURI: p.string(),
    originalNetwork: p.string(),
    provenance: p.int(),
    isVerified: p.boolean(),
    isDeprecated: p.boolean(),
    isPaused: p.boolean(),
    totalSupply: p.bigint(),
    totalMinted: p.bigint(),
    totalBurned: p.bigint(),
    holderCount: p.int(),
    registeredAt: p.bigint(),
    verifiedAt: p.bigint(),
  }),

  AccountBalance: p.createTable({
    id: p.string(), // ${tokenAddress}-${accountAddress}
    tokenAddress: p.string(),
    accountAddress: p.string(),
    balance: p.bigint(),
    lastTransferTimestamp: p.bigint(),
  }),

  TransferEvent: p.createTable({
    id: p.string(), // txHash-logIndex
    tokenAddress: p.string(),
    from: p.string(),
    to: p.string(),
    value: p.bigint(),
    blockNumber: p.bigint(),
    timestamp: p.bigint(),
    transactionHash: p.string(),
  }),

  MintEvent: p.createTable({
    id: p.string(),
    tokenAddress: p.string(),
    minter: p.string(),
    to: p.string(),
    amount: p.bigint(),
    blockNumber: p.bigint(),
    timestamp: p.bigint(),
    transactionHash: p.string(),
  }),

  BurnEvent: p.createTable({
    id: p.string(),
    tokenAddress: p.string(),
    burner: p.string(),
    from: p.string(),
    amount: p.bigint(),
    blockNumber: p.bigint(),
    timestamp: p.bigint(),
    transactionHash: p.string(),
  }),

  DailyAnalytics: p.createTable({
    id: p.string(), // ${tokenAddress}-${YYYY-MM-DD}
    tokenAddress: p.string(),
    date: p.string(),
    transferCount: p.int(),
    dailyVolume: p.bigint(),
    netSupplyChange: p.bigint(),
  }),
}));
