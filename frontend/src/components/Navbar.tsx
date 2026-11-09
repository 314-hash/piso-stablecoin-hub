import React from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { pisoChain } from '../../../../config/chains';

export const Navbar: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isCorrectNetwork = chainId === pisoChain.id;

  const handleAddNetwork = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${pisoChain.id.toString(16)}`,
              chainName: pisoChain.name,
              nativeCurrency: pisoChain.nativeCurrency,
              rpcUrls: [pisoChain.rpcUrls.default.http[0]],
              blockExplorerUrls: [pisoChain.blockExplorers.default.url],
            },
          ],
        });
      } catch (err) {
        console.error('Failed to add PISO Chain to wallet:', err);
      }
    } else {
      alert('Please install MetaMask or an EVM-compatible Web3 wallet.');
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-lg">
            ₱
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-lg text-white">PISO Stablecoin Hub</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                L1 Hub
              </span>
            </div>
            <p className="text-xs text-slate-400">Sovereign EVM Stablecoin Infrastructure</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Network Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
            <span className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-slate-300">PISO Chain ({pisoChain.id})</span>
          </div>

          {/* Add to MetaMask Button */}
          <button
            onClick={handleAddNetwork}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 transition flex items-center space-x-1.5"
            title="Add PISO Chain network to MetaMask"
          >
            <span>Add Network</span>
          </button>

          {/* Wallet Connection */}
          {isConnected ? (
            <div className="flex items-center space-x-2">
              <div className="text-xs font-mono bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 text-emerald-400">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <button
                onClick={() => disconnect()}
                className="text-xs bg-red-950/40 hover:bg-red-900/60 text-red-300 px-3 py-2 rounded-lg border border-red-800/50 transition"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition shadow-lg shadow-emerald-950"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
