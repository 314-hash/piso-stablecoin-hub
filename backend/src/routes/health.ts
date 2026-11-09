import { Hono } from 'hono';
import { createPublicClient, http } from 'viem';
import { pisoChain } from '../../../config/chains';

export const healthRouter = new Hono();

const client = createPublicClient({
  chain: pisoChain,
  transport: http(process.env.PISO_RPC_URL || 'https://rpc.pisochain.com', {
    timeout: 10000,
  }),
});

healthRouter.get('/', async (c) => {
  const startTime = Date.now();
  try {
    const [blockNumber, chainId, gasPrice] = await Promise.all([
      client.getBlockNumber(),
      client.getChainId(),
      client.getGasPrice(),
    ]);

    const latencyMs = Date.now() - startTime;

    return c.json({
      status: 'healthy',
      network: 'PISO Chain',
      chainId: Number(chainId),
      latestBlock: blockNumber.toString(),
      gasPriceWei: gasPrice.toString(),
      gasPriceGwei: (Number(gasPrice) / 1e9).toFixed(2),
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return c.json(
      {
        status: 'unhealthy',
        error: err?.message || 'Failed to query PISO Chain RPC',
        timestamp: new Date().toISOString(),
      },
      503
    );
  }
});

