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
 * PISO Stablecoin Minting Utility
 * Allows accounts with MINTER_ROLE to expand circulating supply to match bank reserves.
 */
async function main() {
  console.log('====================================================');
  console.log(' PISO STABLECOIN HUB: MINTING PIPELINE');
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
    console.log('Example: $env:STABLECOIN_ADDRESS="0x..."');
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`);
  const recipient = process.env.RECIPIENT_ADDRESS || account.address;
  const amountStr = process.env.MINT_AMOUNT || '50000000'; // Default 50M
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

  // Query token decimals & symbol
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

  const currentSupply = await publicClient.readContract({
    address: tokenAddress,
    abi: pisoStablecoinAbi,
    functionName: 'totalSupply',
  });

  const parsedAmount = parseUnits(amountStr, decimals);

  console.log(`Token Contract   : ${tokenAddress} (${symbol})`);
  console.log(`Current Supply   : ${(Number(currentSupply) / 10 ** decimals).toLocaleString()} ${symbol}`);
  console.log(`Minter Address   : ${account.address}`);
  console.log(`Recipient        : ${recipient}`);
  console.log(`Minting Amount   : ${Number(amountStr).toLocaleString()} ${symbol}\n`);

  console.log('[1/2] Broadcasting mint transaction to PISO Chain...');
  const txHash = await walletClient.writeContract({
    address: tokenAddress,
    abi: pisoStablecoinAbi,
    functionName: 'mint',
    args: [recipient, parsedAmount],
  });

  console.log(`      Tx Hash: ${txHash}`);
  console.log('[2/2] Awaiting block confirmation on PISO Chain consensus...');
  await publicClient.waitForTransactionReceipt({ hash: txHash });

  const newSupply = await publicClient.readContract({
    address: tokenAddress,
    abi: pisoStablecoinAbi,
    functionName: 'totalSupply',
  });

  console.log(`\n[SUCCESS] Successfully minted ${Number(amountStr).toLocaleString()} ${symbol}!`);
  console.log(`New Total Supply : ${(Number(newSupply) / 10 ** decimals).toLocaleString()} ${symbol}`);
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Fatal minting error:', err);
  process.exit(1);
});
