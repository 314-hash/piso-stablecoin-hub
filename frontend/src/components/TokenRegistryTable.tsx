import React, { useState } from 'react';

interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  issuerName: string;
  issuerWebsite: string;
  originalNetwork: string;
  provenance: string;
  isVerified: boolean;
  holderCount: number;
  dailyVolume: string;
  reserveProofURI: string;
}

interface TableProps {
  tokens: Token[];
  onSelectToken: (token: Token) => void;
}

export const TokenRegistryTable: React.FC<TableProps> = ({ tokens, onSelectToken }) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const formatSupply = (supply: string, decimals: number) => {
    const raw = BigInt(supply);
    const divisor = BigInt(10 ** decimals);
    const whole = raw / divisor;
    return whole.toLocaleString();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Registered PISO Stablecoins</h2>
          <p className="text-xs text-slate-400">
            Curated list of audited and active stablecoins on PISO Chain Layer 1
          </p>
        </div>
        <div className="text-xs text-slate-400">
          Showing {tokens.length} verified assets
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 font-medium border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Asset</th>
              <th className="py-3.5 px-4">Contract Address</th>
              <th className="py-3.5 px-4">Total Supply</th>
              <th className="py-3.5 px-4">Provenance</th>
              <th className="py-3.5 px-4">Issuer</th>
              <th className="py-3.5 px-4">Holders</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {tokens.map((token) => (
              <tr key={token.address} className="hover:bg-slate-800/40 transition">
                <td className="py-4 px-4 font-sans">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                      {token.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-semibold text-white flex items-center space-x-1.5">
                        <span>{token.name}</span>
                        {token.isVerified && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-sans">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{token.symbol} · {token.decimals} Decimals</div>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center space-x-1.5">
                    <span>{token.address.slice(0, 6)}...{token.address.slice(-4)}</span>
                    <button
                      onClick={() => handleCopy(token.address)}
                      className="text-slate-400 hover:text-slate-200 transition p-1"
                      title="Copy contract address"
                    >
                      {copiedAddress === token.address ? '✓' : '📋'}
                    </button>
                  </div>
                </td>

                <td className="py-4 px-4 font-semibold text-slate-200">
                  {formatSupply(token.totalSupply, token.decimals)} {token.symbol}
                </td>

                <td className="py-4 px-4 font-sans">
                  <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                    {token.originalNetwork}
                  </span>
                </td>

                <td className="py-4 px-4 font-sans">
                  <a
                    href={token.issuerWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline"
                  >
                    {token.issuerName}
                  </a>
                </td>

                <td className="py-4 px-4">
                  {token.holderCount.toLocaleString()}
                </td>

                <td className="py-4 px-4 text-right font-sans">
                  <button
                    onClick={() => onSelectToken(token)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded border border-slate-700 transition"
                  >
                    Transfer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

