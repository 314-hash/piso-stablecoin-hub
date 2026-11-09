import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { pisoChain } from '../../../config/chains';

export const wagmiConfig = createConfig({
  chains: [pisoChain],
  connectors: [
    injected({
      target: 'metaMask',
      shimDisconnect: true,
    }),
  ],
  transports: {
    [pisoChain.id]: http('https://rpc.pisochain.com', {
      timeout: 10000,
      retryCount: 3,
    }),
  },
});
