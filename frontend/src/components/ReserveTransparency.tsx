import React from 'react';

interface ReserveRecord {
  symbol: string;
  tokenAddress: string;
  circulatingSupply: string;
  issuerReportedReservePHP?: string;
  independentlyVerifiedReservePHP?: string;
  issuerReportedReserveUSD?: string;
  independentlyVerifiedReserveUSD?: string;
  coverageRatio: string;
  status: string;
  isIndependentlyVerified: boolean;
  custodian: string;
  auditor: string;
  verificationMethodology: string;
  attestationReportURI: string;
  lastAuditDate: string;
}

interface TransparencyProps {
  reserves: ReserveRecord[];
}

export const ReserveTransparency: React.FC<TransparencyProps> = ({ reserves }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white">Proof of Reserves & Collateral Transparency</h2>
          <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded">
            Independent Verification Engine
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
          PISO Stablecoin Hub requires all institutional issuers to provide transparent collateral verification. 
          To prevent deceptive practices, self-reported reserves are strictly segregated from cryptographically proven 
          or third-party CPA-attested reserves.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reserves.map((rec) => (
          <div
            key={rec.symbol}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400">
                  {rec.symbol}
                </div>
                <div>
                  <div className="text-base font-semibold text-white">{rec.symbol} Reserve Vault</div>
                  <div className="text-xs text-slate-400 font-mono">
                    {rec.tokenAddress.slice(0, 8)}...{rec.tokenAddress.slice(-6)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {rec.coverageRatio} Backed
                </span>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs border-t border-b border-slate-800/80 py-4 my-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Circulating Supply:</span>
                <span className="text-white font-semibold">{rec.circulatingSupply}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Issuer Reported Reserve:</span>
                <span className="text-slate-300">
                  {rec.issuerReportedReservePHP || rec.issuerReportedReserveUSD}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Independently Verified:</span>
                <span className="text-emerald-400 font-semibold">
                  {rec.independentlyVerifiedReservePHP || rec.independentlyVerifiedReserveUSD}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Custodian:</span>
                <span className="text-slate-200">{rec.custodian}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Auditor / Verifier:</span>
                <span className="text-slate-200">{rec.auditor}</span>
              </div>
            </div>

            <div className="text-xs space-y-2">
              <div>
                <span className="text-slate-400 font-medium">Methodology: </span>
                <span className="text-slate-300">{rec.verificationMethodology}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Last Attestation: </span>
                <span className="text-slate-300">{new Date(rec.lastAuditDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <a
                href={rec.attestationReportURI}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1"
              >
                <span>View Cryptographic / CPA Report</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
