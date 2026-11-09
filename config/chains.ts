import { defineChain } from 'viem';

/**
 * PISO Chain (L1 EVM-Compatible Network)
 * Chain ID: 2026001 (0x1eea11)
 * Native Token: PISO
 */
export const pisoChain = defineChain({
  id: 2026001,
  name: 'PISO Chain',
  network: 'pisochain',
  nativeCurrency: {
    name: 'PISO',
    symbol: 'PISO',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.pisochain.com'],
    },
    public: {
      http: ['https://rpc.pisochain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PISO Explorer',
      url: 'https://pisochain.com',
    },
  },
  contracts: {
    multicall3: {
      // Multicall3 deployment address on PISO Chain (standard vanity address or deployed helper)
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1,
    },
  },
  testnet: false,
});

