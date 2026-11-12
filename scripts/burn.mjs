import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWalletClient, createPublicClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { pisoChain, pisoStablecoinAbi } from '../sdk/dist/sdk/src/index.js';

try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch (e) {
  // Native env fallback
}

/**
 * PISO Stablecoin Burning Utility
 * Permanently removes tokens from circulation when fiat redemptions are processed.
 */
async function main() {
  console.log('====================================================');
  console.log(' PISO STABLECOIN HUB: REDEMPTION & BURN PIPELINE');
  console.log(' Target: PISO Chain (Chain ID: 2026001)');
  console.log('====================================================\n');

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    console.error('[ABORT] DEPLOYER_PRIVATE_KEY environment variable is required.');
    process.exit(1);
  }

  const tokenAddress = process.env.STABLECOIN_ADDRESS;
  if (!tokenAddress) {
    console.error('[ABORT] STABLECOIN_ADDRESS environment variable is required.');
    process.exit(1);
  }

  const amountStr = process.env.BURN_AMOUNT;
  if (!amountStr) {
    console.error('[ABORT] BURN_AMOUNT environment variable is required.');
    console.log('Example: $env:BURN_AMOUNT="1000000"');
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

  const decimals = await publicClient.readContract({
    address: tokenAddress,
    abi: pisoStablecoinAbi,
    functionName: 'decimals',
  });

  const symbol = await publicClient.readContract({
    address: tokenAddress,
    abi: pisoStablecoinAbi,
    functionName: 'symbol',
  });

  const balance = await publicClient.readContract({
    address: tokenAddress,
    abi: pisoStablecoinAbi,
    functionName: 'balanceOf',
    args: [account.address],
  });

  const currentSupply = await publicClient.readContract({
    address: tokenAddress,
    abi: pisoStablecoinAbi,
    functionName: 'totalSupply',
  });

  const parsedAmount = parseUnits(amountStr, decimals);

  if (balance < parsedAmount) {
    console.error(`[ABORT] Insufficient token balance to burn.`);
    console.error(`Account Balance : ${(Number(balance) / 10 ** decimals).toLocaleString()} ${symbol}`);
    console.error(`Attempted Burn  : ${Number(amountStr).toLocaleString()} ${symbol}`);
    process.exit(1);
  }

  console.log(`Token Contract   : ${tokenAddress} (${symbol})`);
  console.log(`Current Supply   : ${(Number(currentSupply) / 10 ** decimals).toLocaleString()} ${symbol}`);
  console.log(`Burner Address   : ${account.address}`);
  console.log(`Burn Amount      : ${Number(amountStr).toLocaleString()} ${symbol}\n`);

  console.log('[1/2] Broadcasting burn transaction to PISO Chain...');
  const txHash = await walletClient.writeContract({
    address: tokenAddress,
    abi: pisoStablecoinAbi,
    functionName: 'burn',
    args: [parsedAmount],
  });

  console.log(`      Tx Hash: ${txHash}`);
  console.log('[2/2] Awaiting block confirmation on PISO Chain consensus...');
  await publicClient.waitForTransactionReceipt({ hash: txHash });

  const newSupply = await publicClient.readContract({
    address: tokenAddress,
    abi: pisoStablecoinAbi,
    functionName: 'totalSupply',
  });

  console.log(`\n[SUCCESS] Successfully burned ${Number(amountStr).toLocaleString()} ${symbol}!`);
  console.log(`New Total Supply : ${(Number(newSupply) / 10 ** decimals).toLocaleString()} ${symbol}`);
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Fatal burning error:', err);
  process.exit(1);
});
