# PISO Stablecoin Hub (`piso-stablecoin-hub`)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chain ID: 2026001](https://img.shields.io/badge/PISO%20Chain-2026001-047857.svg)](https://pisochain.com)
[![Status: Tested](https://img.shields.io/badge/Live%20RPC%20Tests-Passing-brightgreen.svg)](https://rpc.pisochain.com)

**Enterprise-grade Open-Source Stablecoin Infrastructure, Token Registry, Event Indexing, and Proof of Reserves for PISO Chain Layer 1.**

---

## 1. Network Specification

* **Blockchain:** PISO Chain (Layer 1 EVM Compatible)
* **Chain ID:** `2026001` (`0x1eea11`)
* **Native Token:** `PISO` (18 decimals)
* **RPC Endpoint:** `https://rpc.pisochain.com`
* **Explorer & Portal:** `https://pisochain.com`
* **Organization:** `314-hash`

---

## 2. System Architecture

```
piso-stablecoin-hub/
├── config/             # PISO Chain metadata & EIP-155 JSON
├── contracts/          # OpenZeppelin v5 TokenRegistry & PisoStablecoin
├── indexer/            # Ponder event indexing & holder accounting
├── backend/            # Hono REST API & health monitoring
├── frontend/           # React, Wagmi v2, Viem & Tailwind dashboard
├── sdk/                # Pre-compiled TypeScript SDK with typed ABIs
├── tests/              # Foundry suites & live Node.js RPC verification
└── docs/               # Architecture, API, Security & Deployment manuals
```

---

## 3. Quickstart & Verification

### Run Live RPC & Contract Verification Suite
```powershell
node tests/integration-test.mjs
```

### Start Local Backend API
```powershell
cd backend
npx tsx src/index.ts
```

### Launch Frontend Dashboard
```powershell
cd frontend
npm run dev
```

---

## 4. Key Capabilities

* **On-Chain Token Registry:** Governed catalog for verified fiat-backed, algorithmic, or bridged stablecoins on PISO Chain.
* **Proof of Reserves Dashboard:** Strict segregation between self-reported issuer collateral and cryptographically or CPA-verified bank reserves.
* **High-Performance Event Indexer:** Ponder-powered local indexing tracking transfers, holder distributions, and daily volume rollups.
* **1-Click Web3 Connectivity:** Native Viem & Wagmi integration with automated `wallet_addEthereumChain` prompts for MetaMask.
* **Zero Subscription Overhead:** Engineered to operate completely on open-source, self-hosted, and free infrastructure tiers.

---

## 5. License Compliance & Attribution

This project is licensed under the [MIT License](LICENSE). Third-party open-source components (OpenZeppelin, Ponder, Viem, Wagmi, Foundry, Ethereum-Lists, Blockscout, Uniswap) are acknowledged in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

