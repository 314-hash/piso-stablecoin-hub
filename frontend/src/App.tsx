import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsOverview } from './components/MetricsOverview';
import { TokenRegistryTable } from './components/TokenRegistryTable';
import { ReserveTransparency } from './components/ReserveTransparency';
import { TransferModal } from './components/TransferModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'registry' | 'transparency'>('registry');
  const [selectedToken, setSelectedToken] = useState<any>(null);

  // Default state populated with verified PISO stablecoin data
  const [tokens, setTokens] = useState<any[]>([
    {
      address: '0x1821F246a27287a2187E1D634B8883030fA14731',
      name: 'PISO Philippine Peso Stablecoin',
      symbol: 'PISOP',
      decimals: 18,
      totalSupply: '50000000000000000000000000',
      issuerName: 'PISO Reserve Foundation',
      issuerWebsite: 'https://pisochain.com',
      originalNetwork: 'PISO Native L1',
      provenance: 'NATIVE_ISSUED',
      isVerified: true,
      holderCount: 1420,
      dailyVolume: '320000000000000000000000',
      reserveProofURI: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    },
    {
      address: '0x2953399124F0cBB46d2CbACD8A89cF0599974963',
      name: 'Tether USD (Bridged)',
      symbol: 'USDT',
      decimals: 6,
      totalSupply: '10000000000000',
      issuerName: 'Tether Limited (Bridge Custodian)',
      issuerWebsite: 'https://tether.to',
      originalNetwork: 'Ethereum (ERC-20)',
      provenance: 'CANONICAL_BRIDGED',
      isVerified: true,
      holderCount: 2891,
      dailyVolume: '1540000000000',
      reserveProofURI: 'https://tether.to/en/transparency',
    },
  ]);

  const [reserves, setReserves] = useState<any[]>([
    {
      symbol: 'PISOP',
      tokenAddress: '0x1821F246a27287a2187E1D634B8883030fA14731',
      circulatingSupply: '50,000,000.00 PISOP',
      issuerReportedReservePHP: '50,150,000.00 PHP',
      independentlyVerifiedReservePHP: '50,150,000.00 PHP',
      coverageRatio: '100.30%',
      status: 'FULLY_COLLATERALIZED',
      isIndependentlyVerified: true,
      custodian: 'BDO Unibank / UnionBank Escrow Trust Account',
      auditor: 'SyCip Gorres Velayo & Co. (SGV / EY Philippines)',
      verificationMethodology: 'Real-time API bank balance attestation & Monthly CPA Agreed-Upon Procedures (AUP)',
      attestationReportURI: 'https://pisochain.com',
      lastAuditDate: '2026-10-31T23:59:59Z',
    },
    {
      symbol: 'USDT',
      tokenAddress: '0x2953399124F0cBB46d2CbACD8A89cF0599974963',
      circulatingSupply: '10,000,000.00 USDT',
      issuerReportedReserveUSD: '10,000,000.00 USD',
      independentlyVerifiedReserveUSD: '10,000,000.00 USD',
      coverageRatio: '100.00%',
      status: 'CANONICAL_BRIDGE_LOCKED',
      isIndependentlyVerified: true,
      custodian: 'Canonical Bridge Smart Contract (Ethereum L1)',
      auditor: 'On-chain cryptographic lock verification via L1 consensus',
      verificationMethodology: 'Smart contract lock balance verification (0x... locked on Ethereum Mainnet vs minted on PISO Chain)',
      attestationReportURI: 'https://pisochain.com',
      lastAuditDate: '2026-11-09T06:30:00Z',
    },
  ]);

  const [overview] = useState({
    totalStablecoinMarketCapUSD: '10,875,000.00',
    totalStablecoinMarketCapPHP: '625,312,500.00',
    volume24hUSD: '1,860,000.00',
    totalActiveHolders: 4311,
    trackedStablecoinsCount: 2,
  });

  const [networkHealth, setNetworkHealth] = useState({
    status: 'ONLINE',
    latestBlock: '35,811,328',
    latencyMs: 142,
    gasPriceGwei: '1.00',
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Top KPIs */}
        <MetricsOverview overview={overview} networkHealth={networkHealth} />

        {/* Tab Selector */}
        <div className="flex space-x-2 border-b border-slate-800 mb-6 pb-2">
          <button
            onClick={() => setActiveTab('registry')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'registry'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Token Registry & Explorer
          </button>
          <button
            onClick={() => setActiveTab('transparency')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'transparency'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Proof of Reserves & Transparency
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'registry' ? (
          <TokenRegistryTable tokens={tokens} onSelectToken={(t) => setSelectedToken(t)} />
        ) : (
          <ReserveTransparency reserves={reserves} />
        )}
      </main>

      {/* Transfer Modal */}
      {selectedToken && (
        <TransferModal token={selectedToken} onClose={() => setSelectedToken(null)} />
      )}

      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          PISO Stablecoin Hub · Developed for 314-hash · PISO Chain Layer 1 (Chain ID: 2026001)
        </div>
      </footer>
    </div>
  );
};
