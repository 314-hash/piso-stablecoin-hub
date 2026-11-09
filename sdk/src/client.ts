import { createPublicClient, http, PublicClient } from 'viem';
import { pisoChain } from './chain';

/**
 * Returns a preconfigured public Viem client connected to PISO Chain.
 */
export function getPisoClient(rpcUrl: string = 'https://rpc.pisochain.com'): PublicClient {
  return createPublicClient({
    chain: pisoChain,
    transport: http(rpcUrl, {
      retryCount: 3,
      retryDelay: 1000,
      timeout: 15000,
    }),
  });
}

