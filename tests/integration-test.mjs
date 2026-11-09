import { createPublicClient, http, encodeFunctionData } from 'viem';
import { pisoChain, tokenRegistryAbi, pisoStablecoinAbi } from '../sdk/dist/sdk/src/index.js';

async function runTests() {
  console.log('====================================================');
  console.log(' PISO STABLECOIN HUB: LIVE VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: PISO Chain RPC Connectivity
  try {
    const client = createPublicClient({
      chain: pisoChain,
      transport: http('https://rpc.pisochain.com', { timeout: 10000 }),
    });

    const chainId = await client.getChainId();
    const blockNumber = await client.getBlockNumber();

    if (chainId === 2026001) {
      console.log(`[PASS] PISO Chain RPC connection verified: Chain ID ${chainId}`);
      console.log(`       Current Block Height: #${blockNumber}`);
      passed++;
    } else {
      console.error(`[FAIL] Unexpected Chain ID returned: ${chainId}`);
      failed++;
    }
  } catch (err) {
    console.error(`[FAIL] RPC connection error:`, err.message);
    failed++;
  }

  // Test 2: Token Registry ABI Encoding
  try {
    const encoded = encodeFunctionData({
      abi: tokenRegistryAbi,
      functionName: 'registerToken',
      args: [
        '0x1821F246a27287a2187E1D634B8883030fA14731',
        'PISO Reserve Foundation',
        'https://pisochain.com',
        'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
        'PISO Native L1',
        0, // NATIVE_ISSUED
      ],
    });

    if (encoded.startsWith('0x')) {
      console.log('[PASS] TokenRegistry.registerToken calldata encoding verified');
      passed++;
    } else {
      console.error('[FAIL] Encoding failed');
      failed++;
    }
  } catch (err) {
    console.error('[FAIL] TokenRegistry encoding error:', err.message);
    failed++;
  }

  // Test 3: PisoStablecoin ABI Encoding (Mint / Burn / Pause)
  try {
    const mintData = encodeFunctionData({
      abi: pisoStablecoinAbi,
      functionName: 'mint',
      args: ['0x1821F246a27287a2187E1D634B8883030fA14731', 50000000000000000000000000n],
    });

    const pauseData = encodeFunctionData({
      abi: pisoStablecoinAbi,
      functionName: 'pause',
    });

    if (mintData.startsWith('0x') && pauseData.startsWith('0x')) {
      console.log('[PASS] PisoStablecoin mint & pause calldata encoding verified');
      passed++;
    } else {
      failed++;
    }
  } catch (err) {
    console.error('[FAIL] PisoStablecoin encoding error:', err.message);
    failed++;
  }

  console.log('\n----------------------------------------------------');
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log('----------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
