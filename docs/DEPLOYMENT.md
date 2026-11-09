# Zero-Funding Deployment Guide

This guide details running `piso-stablecoin-hub` locally or self-hosting on zero-cost infrastructure.

## 1. Prerequisites
- Node.js `v20.x` or `v22.x+`
- Git
- Windows 10 Pro / Linux / macOS

---

## 2. Quickstart (Local Development)

### Step 1: Install Dependencies
```powershell
npm install
```

### Step 2: Build the TypeScript SDK
```powershell
npx tsc --project sdk/tsconfig.json
```

### Step 3: Run the Live Verification Suite
```powershell
node tests/integration-test.mjs
```

### Step 4: Start the Backend API
```powershell
cd backend
npx tsx src/index.ts
```

### Step 5: Start the Frontend Dashboard
```powershell
cd frontend
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 3. Production Deployment (Zero-Cost Hosting)
- **Frontend:** Build with `npm run build` inside `frontend/` and deploy the `dist/` directory to **GitHub Pages**, **Cloudflare Pages**, or **Vercel** on their free tiers.
- **Backend & Indexer:** Deploy to a lightweight self-hosted Linux VPS or free-tier container running Node.js and SQLite.
- **RPC:** Uses public endpoint `https://rpc.pisochain.com` with zero query fees.
