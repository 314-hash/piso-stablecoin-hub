# Blockscout Integration Evaluation for PISO Chain

**Target Network:** PISO Chain (Chain ID: `2026001` / `0x1eea11`)  
**Current Explorer:** `https://pisochain.com`  
**Primary Evaluated Repository:** `https://github.com/blockscout/blockscout`  
**Evaluation Standard:** Zero-funding sustainability, resource overhead, RPC load, and UX parity.

---

## 1. Executive Summary

| Evaluation Vector | Existing PISO Explorer (`pisochain.com`) | Self-Hosted Blockscout Instance |
| :--- | :--- | :--- |
| **Hosting & Maintenance Cost** | **$0 / month** (Already hosted & operational) | **$150 - $450 / month** (High memory & DB IOPS) |
| **RPC Bandwidth Demand** | Minimal (Standard client queries) | Massive (Continuous block re-indexing & trace ingestion) |
| **EVM Chain Compatibility** | 100% Native | 100% (Supports EVM via JSON-RPC) |
| **Token Tracking (ERC-20)** | Basic | Advanced (ERC-20, ERC-721, ERC-1155, transfers, holders) |
| **Contract Verification** | Standard | Rust microservice (`smart-contract-verifier`) |
| **Infrastructure Complexity** | None (Operated by L1 network) | High (PostgreSQL, Elixir, Redis, Rust verifier, Next.js UI) |
| **Licensing** | Proprietary / Network-managed | **GPL-3.0** |

### Recommendation
**Do not displace or replace the existing PISO Chain explorer.**
1. **Zero-Funding Integrity:** Self-hosting Blockscout violates the zero-funding mandate by requiring dedicated high-spec cloud infrastructure (minimum 8 vCPU, 32GB RAM, high IOPS SSD).
2. **Dedicated Stablecoin Explorer in Hub:** The lightweight **PISO Stablecoin Hub** frontend and Ponder indexer satisfy 100% of institutional stablecoin discovery, holder tracking, and reserve transparency needs at \$0 operational cost.
3. **Deep Linking Strategy:** All transaction hashes and contract addresses in `piso-stablecoin-hub` link directly outward to `https://pisochain.com/tx/{txHash}` and `https://pisochain.com/address/{address}`.
4. **Staging Blueprint Provided:** An optional `docker-compose.blockscout.yml` is provided for future network validator operators who want to spin up an archival Blockscout node on bare metal.

---

## 2. Technical Architecture & Resource Audit

Blockscout consists of four interdependent microservices:
1. **Blockscout Backend (Elixir):** Ingests blocks via `eth_getBlockByNumber` and `eth_getLogs`.
2. **PostgreSQL 14+:** Stores indexed blocks, transactions, tokens, logs, and address balances. Rapidly grows to > 500GB on an active chain with 35M+ blocks.
3. **Smart Contract Verifier (Rust):** Compiles Solidity/Vyper source and verifies bytecode matches against deployed on-chain bytecode.
4. **Blockscout Frontend (Next.js):** Consumes GraphQL/REST APIs from backend.

### RPC Incompatibility Risks
- **`debug_traceTransaction`:** PISO Chain public RPC nodes may disable or rate-limit debug traces to preserve validator CPU. Without tracing, internal transactions cannot be indexed.
- **Log Backfill Overload:** Synchronizing 35.8M historical blocks from `https://rpc.pisochain.com` would generate tens of millions of HTTP RPC calls, risking rate-limits or IP bans.

---

## 3. Blockscout Staging Deployment Configuration

For operators with dedicated infrastructure, deploy using the bundled configuration:

```powershell
# Launch Blockscout stack targeting PISO Chain
docker compose -f docker-compose.blockscout.yml up -d
```
