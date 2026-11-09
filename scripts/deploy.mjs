import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { pisoChain } from '../sdk/dist/sdk/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch (e) {
  // Native fallback
}

/**
 * PISO Chain Deployment Pipeline
 * Deploys TokenRegistry.sol and PisoStablecoin.sol to live consensus
 */
async function main() {
  console.log('====================================================');
  console.log(' PISO STABLECOIN HUB: DEPLOYMENT PIPELINE');
  console.log(' Target: PISO Chain (Chain ID: 2026001)');
  console.log('====================================================\n');

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    console.error('[ABORT] DEPLOYER_PRIVATE_KEY environment variable is required.');
    console.log('Example: $env:DEPLOYER_PRIVATE_KEY="0xabcdef..."\n');
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

  const balance = await publicClient.getBalance({ address: account.address });
  const blockNumber = await publicClient.getBlockNumber();

  console.log(`Deployer Address : ${account.address}`);
  console.log(`Deployer Balance : ${(Number(balance) / 1e18).toFixed(4)} PISO`);
  console.log(`Current Block    : #${blockNumber}\n`);

  if (balance === 0n) {
    console.error('[ABORT] Deployer account has 0 PISO balance. Fund account with native PISO gas.');
    process.exit(1);
  }

  // Load compiled artifacts
  const registryArtifactPath = path.resolve(rootDir, 'contracts/artifacts/TokenRegistry.json');
  const stablecoinArtifactPath = path.resolve(rootDir, 'contracts/artifacts/PisoStablecoin.json');

  if (!fs.existsSync(registryArtifactPath) || !fs.existsSync(stablecoinArtifactPath)) {
    console.log('Artifacts missing. Compiling contracts now...');
    const { execSync } = await import('child_process');
    execSync('node scripts/compile-contracts.mjs', { stdio: 'inherit' });
  }

  const registryArtifact = JSON.parse(fs.readFileSync(registryArtifactPath, 'utf8'));
  const stablecoinArtifact = JSON.parse(fs.readFileSync(stablecoinArtifactPath, 'utf8'));

  // 1. Deploy TokenRegistry
  console.log('[1/3] Deploying TokenRegistry contract...');
  const registryTxHash = await walletClient.deployContract({
    abi: registryArtifact.abi,
    bytecode: registryArtifact.bytecode,
    args: [account.address], // initialAdmin
  });
  console.log(`      Transaction broadcast: ${registryTxHash}`);
  const registryReceipt = await publicClient.waitForTransactionReceipt({ hash: registryTxHash });
  const tokenRegistryAddress = registryReceipt.contractAddress;
  console.log(`      [CONFIRMED] TokenRegistry deployed at: ${tokenRegistryAddress}\n`);

  // 2. Deploy reference PisoStablecoin (PISO-PHP Pegged Token)
  console.log('[2/3] Deploying reference PisoStablecoin (PISOP)...');
  const stablecoinTxHash = await walletClient.deployContract({
    abi: stablecoinArtifact.abi,
    bytecode: stablecoinArtifact.bytecode,
    args: [
      'PISO Philippine Peso Stablecoin',
      'PISOP',
      18, // decimals
      account.address, // initialAdmin
      account.address, // initialMinter
    ],
  });
  console.log(`      Transaction broadcast: ${stablecoinTxHash}`);
  const stablecoinReceipt = await publicClient.waitForTransactionReceipt({ hash: stablecoinTxHash });
  const stablecoinAddress = stablecoinReceipt.contractAddress;
  console.log(`      [CONFIRMED] PisoStablecoin deployed at: ${stablecoinAddress}\n`);

  // 3. Register token on TokenRegistry
  console.log('[3/3] Registering PISOP on TokenRegistry...');
  const registerTxHash = await walletClient.writeContract({
    address: tokenRegistryAddress,
    abi: registryArtifact.abi,
    functionName: 'registerToken',
    args: [
      stablecoinAddress,
      'PISO Reserve Foundation',
      'https://pisochain.com',
      'https://pisochain.com/transparency',
      'PISO Native L1',
      0, // NATIVE_ISSUED
    ],
  });
  await publicClient.waitForTransactionReceipt({ hash: registerTxHash });
  console.log(`      [CONFIRMED] Token successfully registered! Register Tx: ${registerTxHash}\n`);

  console.log('====================================================');
  console.log(' DEPLOYMENT COMPLETE');
  console.log(` TokenRegistry   : ${tokenRegistryAddress}`);
  console.log(` PisoStablecoin  : ${stablecoinAddress}`);
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Fatal deployment error:', err);
  process.exit(1);
});
