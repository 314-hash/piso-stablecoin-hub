# PISO Stablecoin Hub Architecture Specification

## 1. System Overview

`piso-stablecoin-hub` is a sovereign financial infrastructure platform engineered for PISO Chain (Chain ID: `2026001`, Hex: `0x1eea11`). It provides on-chain token registries, real-time event indexing, collateral transparency monitoring, and institutional wallet connectivity.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PISO STABLECOIN HUB                             │
├─────────────────┬───────────────────┬──────────────────┬───────────────┤
│ SMART CONTRACTS │ INDEXER ENGINE    │ BACKEND / API    │ FRONTEND UI   │
│ - TokenRegistry │ - Ponder Core     │ - Hono Framework │ - React / Vite│
│ - PisoStablecoin│ - Event Handlers  │ - Health Monitor │ - Wagmi / Viem│
│ - AccessControl │ - Holder Balances │ - Reserve Feed   │ - Tailwind CSS│
└─────────────────┴───────────────────┴──────────────────┴───────────────┘
```

## 2. Core Components

### A. Smart Contracts (`contracts/`)
1. **`TokenRegistry.sol`**: Governed on-chain catalog of verified stablecoins. Features role-based verification (`VERIFIER_ROLE`), emergency circuit breaking (`Pausable`), reentrancy protection, and ERC-20 metadata introspection.
2. **`PisoStablecoin.sol`**: OpenZeppelin v5-based reference institutional stablecoin with role-isolated minting (`MINTER_ROLE`), burn accounting, emergency pauses, and safe token rescue (`SafeERC20`).

### B. Indexer Engine (`indexer/`)
- Powered by `@ponder/core`.
- Listens to PISO Chain RPC (`https://rpc.pisochain.com`).
- Indexes `Transfer`, `Mint`, `Burn`, and `TokenRegistered` events.
- Maintains atomic holder balances and daily transaction volume aggregates without cloud SaaS costs.

### C. Backend API (`backend/`)
- Modular Hono server running on Node.js.
- Exposes RESTful endpoints for network health, token registry metadata, circulating supply, and reserve attestations.

### D. Frontend Interface (`frontend/`)
- Single-page application built with React, Vite, Wagmi v2, and Tailwind CSS.
- One-click "Add PISO Chain to MetaMask" RPC injector.
- Proof of Reserves transparency dashboard segregating verified and self-reported collateral.

### E. TypeScript SDK (`sdk/`)
- Reusable library exporting typed ABIs, client constructors, and custom chain definitions (`pisoChain`).
