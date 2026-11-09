import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { isAddress, parseUnits } from 'viem';
import { pisoStablecoinAbi } from '../../../../sdk/src/abis';

interface TransferModalProps {
  token: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  } | null;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ token, onClose }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { isConnected } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  if (!token) return null;

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!isAddress(recipient)) {
      setValidationError('Recipient must be a valid 0x Ethereum address');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError('Please enter a valid transfer amount greater than 0');
      return;
    }

    try {
      const parsedAmount = parseUnits(amount, token.decimals);
      writeContract({
        address: token.address as `0x${string}`,
        abi: pisoStablecoinAbi,
        functionName: 'transfer',
        args: [recipient as `0x${string}`, parsedAmount],
      });
    } catch (err: any) {
      setValidationError(err?.message || 'Transaction submission failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold text-white mb-1">
          Transfer {token.symbol}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Send institutional stablecoins on PISO Chain (Chain ID: 2026001)
        </p>

        {validationError && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800/50 rounded-lg text-xs text-red-300">
            {validationError}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800/50 rounded-lg text-xs text-red-300 font-mono break-all">
            {error.message}
          </div>
        )}

        {isConfirmed && (
          <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800/50 rounded-lg text-xs text-emerald-300">
            Transaction confirmed! Tx Hash: {hash?.slice(0, 10)}...{hash?.slice(-8)}
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Recipient Address (PISO L1)
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Amount ({token.symbol})
            </label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="pt-2">
            {!isConnected ? (
              <div className="text-center text-xs text-amber-400 p-2 bg-amber-950/30 rounded border border-amber-900/40">
                Please connect your Web3 wallet first.
              </div>
            ) : (
              <button
                type="submit"
                disabled={isPending || isConfirming}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-xs transition shadow-lg shadow-emerald-950"
              >
                {isPending ? 'Check Wallet...' : isConfirming ? 'Confirming on PISO Chain...' : `Send ${token.symbol}`}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

