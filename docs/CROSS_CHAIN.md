# Cross-Chain Interoperability Research

## 1. Objective
Enable sovereign stablecoins (such as USDT, USDC, or PISOP) to seamlessly bridge between PISO Chain and external EVM / non-EVM ecosystems (Ethereum, TRON, BNB Chain, Arbitrum, Optimism, Base).

## 2. Protocol Comparison

| Protocol | Onboarding Model | Latency | Validator / Security Model | Feasibility for PISO Chain |
| :--- | :--- | :--- | :--- | :--- |
| **Hyperlane** | **Permissionless** | ~1-3 mins | Modular Interchain Security Modules (ISMs) | **Immediate / Recommended** |
| **LayerZero v2** | Permissioned / Custom | ~2-5 mins | Decentralized Verifier Networks (DVNs) | Medium (Requires endpoint config) |
| **Chainlink CCIP** | Enterprise Permissioned | ~10-20 mins| Risk Management Network + DON | Low (Requires enterprise onboarding)|
| **Wormhole** | Permissioned | ~2-5 mins | 19 Guardian Nodes (PoA multi-sig) | Medium (Requires guardian approval)|

## 3. Recommended Phased Deployment

1. **Phase 1 (Permissionless Mailbox):** Deploy Hyperlane `Mailbox.sol` to PISO Chain. Operators run validator agents to sign PISO Chain state attestations.
2. **Phase 2 (Canonical Token Pools):** Deploy lock-and-mint / burn-and-mint token vaults with 24-hour timelocks on large redemption values (> 50,000 tokens) and daily velocity caps.
3. **Phase 3 (Zero-Knowledge Proofs):** Evaluate state-proof verification once ZK light clients are supported on EVM.
