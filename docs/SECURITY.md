# Security Policy & Threat Mitigation

## 1. Security Architecture
The `piso-stablecoin-hub` platform adheres to strict institutional and smart contract security standards:
- **Role Isolation:** Default administrative rights (`DEFAULT_ADMIN_ROLE`) are separated from daily operational minter rights (`MINTER_ROLE`) and verification rights (`VERIFIER_ROLE`).
- **Emergency Circuit Breakers:** `Pausable` functionality enables immediate halting of transfers and registrations in the event of an anomaly.
- **Safe Transfers:** All asset transfers utilize OpenZeppelin `SafeERC20` to prevent token locking or silent return false failures.
- **Strict Reserves Verification:** Self-reported reserves can never be marked as independently verified without cryptographic or CPA proof.

## 2. Reporting a Vulnerability
To report a vulnerability or operational anomaly, contact the security team:
- **GitHub:** Submit a private advisory via `https://github.com/314-hash/piso-stablecoin-hub/security/advisories`
- **PGP Security Key:** Provided upon request for confidential vulnerability disclosures.

