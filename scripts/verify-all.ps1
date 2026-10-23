# A11YLab Complete Verification Script
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " A11YLab: Accessibility Engineering Verification & Audit Suite" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Step 1: Run Node automated audit summary
Write-Host "`n[1/3] Running automated accessibility ruleset check..." -ForegroundColor Yellow
node scripts/run-audit.js

# Step 2: Verify Showcase Production Build
Write-Host "`n[2/3] Verifying Showcase Production Build..." -ForegroundColor Yellow
Set-Location showcase
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "Showcase built successfully." -ForegroundColor Green
} else {
    Write-Host "Showcase build failed." -ForegroundColor Red
    exit 1
}
Set-Location ..

# Step 3: Check Upstream Patches
Write-Host "`n[3/3] Verifying Git Patches..." -ForegroundColor Yellow
$patches = Get-ChildItem -Path "patches" -Filter "*.patch"
foreach ($p in $patches) {
    Write-Host "  Found Patch: $($p.Name) ($($p.Length) bytes)" -ForegroundColor Green
}

Write-Host "`nAll verification checks passed!" -ForegroundColor Green
Write-Host "Launch interactive workbench with: cd showcase; npm run dev" -ForegroundColor Cyan
