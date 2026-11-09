import { Hono } from 'hono';
import { isAddress } from 'viem';

export const tokensRouter = new Hono();

// Curated verified stablecoins on PISO Chain (fallback cache if indexer/contract is starting)
const mockStablecoins = [
  {
    address: '0x1821F246a27287a2187E1D634B8883030fA14731',
    name: 'PISO Philippine Peso Stablecoin',
    symbol: 'PISOP',
    decimals: 18,
    totalSupply: '50000000000000000000000000', // 50M
    issuerName: 'PISO Reserve Foundation',
    issuerWebsite: 'https://pisochain.com',
    originalNetwork: 'PISO Native L1',
    provenance: 'NATIVE_ISSUED',
    isVerified: true,
    isDeprecated: false,
    holderCount: 1420,
    dailyVolume: '320000000000000000000000', // 320k
    reserveProofURI: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  },
  {
    address: '0x2953399124F0cBB46d2CbACD8A89cF0599974963',
    name: 'Tether USD (Bridged)',
    symbol: 'USDT',
    decimals: 6,
    totalSupply: '10000000000000', // 10M
    issuerName: 'Tether Limited (Bridge Custodian)',
    issuerWebsite: 'https://tether.to',
    originalNetwork: 'Ethereum (ERC-20)',
    provenance: 'CANONICAL_BRIDGED',
    isVerified: true,
    isDeprecated: false,
    holderCount: 2891,
    dailyVolume: '1540000000000', // 1.54M
    reserveProofURI: 'https://tether.to/en/transparency',
  },
];

tokensRouter.get('/', (c) => {
  return c.json({
    data: mockStablecoins,
    total: mockStablecoins.length,
    timestamp: new Date().toISOString(),
  });
});

tokensRouter.get('/:address', (c) => {
  const addr = c.req.param('address').toLowerCase();
  if (!isAddress(addr)) {
    return c.json({ error: 'Invalid Ethereum address format' }, 400);
  }

  const token = mockStablecoins.find((t) => t.address.toLowerCase() === addr);
  if (!token) {
    return c.json({ error: 'Stablecoin not found in PISO registry' }, 404);
  }

  return c.json({ data: token });
});

