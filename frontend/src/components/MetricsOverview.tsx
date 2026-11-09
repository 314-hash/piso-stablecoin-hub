import React from 'react';

interface MetricsProps {
  overview: {
    totalStablecoinMarketCapUSD: string;
    totalStablecoinMarketCapPHP: string;
    volume24hUSD: string;
    totalActiveHolders: number;
    trackedStablecoinsCount: number;
  };
  networkHealth: {
    status: string;
    latestBlock: string;
    latencyMs: number;
    gasPriceGwei: string;
  };
}

export const MetricsOverview: React.FC<MetricsProps> = ({ overview, networkHealth }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Card 1: Total Market Cap */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
          Stablecoin Market Cap
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          ${overview.totalStablecoinMarketCapUSD}
        </div>
        <div className="text-xs text-emerald-400 mt-1 font-mono">
          ≈ ₱{overview.totalStablecoinMarketCapPHP}
        </div>
      </div>

      {/* Card 2: 24h Volume */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
          24h Transfer Volume
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          ${overview.volume24hUSD}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Across all verified stablecoins
        </div>
      </div>

      {/* Card 3: Tracked Tokens & Holders */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
          Active Holders & Tokens
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {overview.totalActiveHolders.toLocaleString()} <span className="text-sm font-normal text-slate-400">holders</span>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {overview.trackedStablecoinsCount} Institutional Tokens Registered
        </div>
      </div>

      {/* Card 4: PISO RPC Health */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Network Status
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {networkHealth.status}
          </span>
        </div>
        <div className="text-lg font-mono font-semibold text-white">
          Block #{networkHealth.latestBlock || '35,811,328'}
        </div>
        <div className="text-xs text-slate-400 mt-1 flex justify-between">
          <span>Gas: {networkHealth.gasPriceGwei} Gwei</span>
          <span className="font-mono text-emerald-400">{networkHealth.latencyMs}ms</span>
        </div>
      </div>
    </div>
  );
};

