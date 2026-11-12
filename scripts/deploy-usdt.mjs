import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWalletClient, createPublicClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { pisoChain } from '../sdk/dist/sdk/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function main() {
  console.log('====================================================');
  console.log(' DEPLOYING DEDICATED CLEAN USDT CONTRACT ON PISO CHAIN');
  console.log('====================================================\n');

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || '0xff2eb7fe521c1e540f1de7e703ff1da9be8d4990c7fd783516507879b3424df1';
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

  const stablecoinArtifactPath = path.resolve(rootDir, 'contracts/artifacts/PisoStablecoin.json');
  const stablecoinArtifact = JSON.parse(fs.readFileSync(stablecoinArtifactPath, 'utf8'));

  console.log(`Deployer Address : ${account.address}`);

  // Deploy USDT contract
  console.log('Deploying Tether USD (Bridged) USDT contract...');
  const txHash = await walletClient.deployContract({
    abi: stablecoinArtifact.abi,
    bytecode: stablecoinArtifact.bytecode,
    args: [
      'Tether USD (Bridged)',
      'USDT',
      6, // 6 decimals standard for USDT
      account.address,
      account.address,
    ],
    gas: 5000000n,
  });

  console.log(`Transaction Hash: ${txHash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  const usdtAddress = receipt.contractAddress;
  console.log(`[CONFIRMED] Dedicated USDT Deployed at: ${usdtAddress}`);

  // Mint initial supply
  console.log('Minting 10,000,000 USDT to deployer...');
  const mintTx1 = await walletClient.writeContract({
    address: usdtAddress,
    abi: stablecoinArtifact.abi,
    functionName: 'mint',
    args: [account.address, parseUnits('10000000', 6)],
    gas: 500000n,
  });
  await publicClient.waitForTransactionReceipt({ hash: mintTx1 });

  // Mint to SafePal test address
  const safePalAddr = '0xE3aFaeC0677A6C34CC190B1f8f68f1d712D45614';
  console.log(`Minting 10,000 USDT to SafePal wallet (${safePalAddr})...`);
  const mintTx2 = await walletClient.writeContract({
    address: usdtAddress,
    abi: stablecoinArtifact.abi,
    functionName: 'mint',
    args: [safePalAddr, parseUnits('10000', 6)],
    gas: 500000n,
  });
  await publicClient.waitForTransactionReceipt({ hash: mintTx2 });
  console.log('[SUCCESS] All mint operations confirmed!');
  console.log(`USDT Contract Address: ${usdtAddress}`);
}

main().catch((err) => {
  console.error('Deployment error:', err);
  process.exit(1);
});
