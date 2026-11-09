import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { pisoChain, pisoStablecoinAbi } from '../sdk/dist/sdk/src/index.js';

try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch (e) {
  // Native env fallback
}

/**
 * Emergency Circuit Breaker (Pause / Unpause)
 */
async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const tokenAddress = process.env.STABLECOIN_ADDRESS;
  const action = (process.env.ACTION || 'pause').toLowerCase(); // 'pause' or 'unpause'

  if (!privateKey || !tokenAddress) {
    console.error('Usage: $env:DEPLOYER_PRIVATE_KEY="..."; $env:STABLECOIN_ADDRESS="..."; $env:ACTION="pause"|"unpause"; node scripts/pause.mjs');
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`);
  const rpcUrl = process.env.PISO_RPC_URL || 'https://rpc.pisochain.com';

  const publicClient = createPublicClient({
    chain: pisoChain,
    transport: http(rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain: pisoChain,
    transport: http(rpcUrl),
  });

  const isCurrentlyPaused = await publicClient.readContract({
    address: tokenAddress as `0x${string}`,
    abi: pisoStablecoinAbi,
    functionName: 'paused',
  });

  console.log(`Token Address      : ${tokenAddress}`);
  console.log(`Current State      : ${isCurrentlyPaused ? 'PAUSED' : 'ACTIVE'}`);
  console.log(`Requested Action   : ${action.toUpperCase()}\n`);

  if (action === 'pause' && isCurrentlyPaused) {
    console.log('Contract is already paused.');
    return;
  }

  if (action === 'unpause' && !isCurrentlyPaused) {
    console.log('Contract is already active (unpaused).');
    return;
  }

  const functionName = action === 'pause' ? 'pause' : 'unpause';
  console.log(`Executing ${functionName}() on PISO Chain consensus...`);

  const txHash = await walletClient.writeContract({
    address: tokenAddress as `0x${string}`,
    abi: pisoStablecoinAbi,
    functionName,
  });

  console.log(`Tx Hash: ${txHash}`);
  await publicClient.waitForTransactionReceipt({ hash: txHash });

  console.log(`[SUCCESS] Contract is now ${action === 'pause' ? 'PAUSED' : 'ACTIVE'}!`);
}

main().catch(console.error);
