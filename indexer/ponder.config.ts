import { createConfig } from '@ponder/core';
import { http } from 'viem';
import { tokenRegistryAbi, pisoStablecoinAbi } from '../sdk/src/abis';

export default createConfig({
  networks: {
    pisochain: {
      chainId: 2026001,
      transport: http(process.env.PISO_RPC_URL || 'https://rpc.pisochain.com', {
        timeout: 15000,
        retryCount: 5,
        retryDelay: 1000,
      }),
      pollingInterval: 2000,
      maxBlockRange: 2000,
      finalityBlockCount: 12,
    },
  },
  contracts: {
    TokenRegistry: {
      network: 'pisochain',
      abi: tokenRegistryAbi,
      address: (process.env.TOKEN_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
      startBlock: Number(process.env.REGISTRY_START_BLOCK || 35800000),
    },
    PisoStablecoin: {
      network: 'pisochain',
      abi: pisoStablecoinAbi,
      address: (process.env.STABLECOIN_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
      startBlock: Number(process.env.STABLECOIN_START_BLOCK || 35800000),
    },
  },
});
