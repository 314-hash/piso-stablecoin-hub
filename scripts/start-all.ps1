<#
.SYNOPSIS
    Starts the PISO Stablecoin Hub local development environment on Windows 10 Pro.
.DESCRIPTION
    Launches the backend REST API on port 3001 and the frontend Vite dashboard on port 3000.
#>

$ErrorActionPreference = "Stop"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " PISO STABLECOIN HUB: WINDOWS WORKSPACE LAUNCHER" -ForegroundColor Cyan
Write-Host " Target: PISO Chain (Chain ID: 2026001)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Quick RPC Health Verification
Write-Host "`n[1/3] Testing PISO Chain RPC connection..." -ForegroundColor Yellow
$rpcPayload = '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
try {
    $res = Invoke-RestMethod -Uri "https://rpc.pisochain.com" -Method Post -Body $rpcPayload -ContentType "application/json" -TimeoutSec 5
    $block = [Convert]::ToInt64($res.result, 16)
    Write-Host "[OK] Connected to PISO Chain! Current block: #$block" -ForegroundColor Green
} catch {
    Write-Warning "Could not reach https://rpc.pisochain.com directly: $($_.Exception.Message)"
}

# 2. Start Backend API in a separate job/process
Write-Host "`n[2/3] Starting Backend API on http://localhost:3001..." -ForegroundColor Yellow
$backendJob = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd backend && npx tsx src/index.ts" -PassThru -NoNewWindow

# 3. Start Frontend Dashboard
Write-Host "`n[3/3] Starting Frontend Dashboard on http://localhost:3000..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to terminate both servers when finished.`n" -ForegroundColor DarkGray

try {
    Set-Location -Path "frontend"
    npm run dev
} finally {
    if ($backendJob -and !$backendJob.HasExited) {
        Write-Host "Shutting down backend process..." -ForegroundColor Gray
        Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue
    }
}

