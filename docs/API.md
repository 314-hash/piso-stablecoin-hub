# PISO Stablecoin Hub API Documentation

The Hub exposes RESTful endpoints for querying network health, registered stablecoin metadata, supply statistics, and reserve transparency records.

Base URL: `http://localhost:3001/api/v1`

---

## 1. Network Health
* **Endpoint:** `GET /health`
* **Description:** Performs a live RPC latency and block height check against PISO Chain.
* **Response Sample:**
```json
{
  "status": "healthy",
  "network": "PISO Chain",
  "chainId": 2026001,
  "latestBlock": "35811328",
  "gasPriceWei": "1000000000",
  "gasPriceGwei": "1.00",
  "latencyMs": 142,
  "timestamp": "2026-11-09T07:30:00.000Z"
}
```

---

## 2. Token Discovery
* **Endpoint:** `GET /tokens`
* **Description:** Retrieves all curated and active stablecoins on PISO Chain.

* **Endpoint:** `GET /tokens/:address`
* **Description:** Retrieves details for a specific token contract.

---

## 3. Analytics
* **Endpoint:** `GET /analytics/overview`
* **Description:** Returns aggregate market capitalization, 24h volume, and active holder totals.

* **Endpoint:** `GET /analytics/timeseries`
* **Description:** Returns 7-day historical transfer counts and volume USD.

---

## 4. Reserve Transparency
* **Endpoint:** `GET /reserves`
* **Description:** Lists proof-of-reserve records, custodian identities, auditor reports, and collateral coverage percentages.
