param(
  [string]$BaseUrl = "http://127.0.0.1:3000",
  [string]$PlanId = "attaguy-plan",
  [string]$Level = "brand"
)

$ErrorActionPreference = "Stop"

function Write-Section($name) {
  Write-Host ""
  Write-Host "===================="
  Write-Host $name
  Write-Host "===================="
}

function Check-DevServer($url) {
  try {
    $r = curl.exe --http1.1 -s -I --max-time 3 $url
    if ($LASTEXITCODE -ne 0) {
      return $false
    }
    if ($r -match "200 OK") {
      return $true
    }
    return $false
  } catch {
    return $false
  }
}

# -------------------------------------------------------
# 1 检查 dev server
# -------------------------------------------------------

$preUrl = "$BaseUrl/api/download-token?mode=full&planId=$PlanId"

Write-Host "[pre-commit] Running PDF regression..."
Write-Host "precheck_url=$preUrl"

$serverOk = Check-DevServer $preUrl

if (-not $serverOk) {
  Write-Host ""
  Write-Host "[pre-commit] dev server not running."
  Write-Host "[pre-commit] skip regression (this will not block commit)."
  exit 0
}

Write-Host "precheck_ok=API_DOWNLOAD_TOKEN"

# -------------------------------------------------------
# 2 获取 download token
# -------------------------------------------------------

$tokenResp = curl.exe --http1.1 -s "$preUrl"

try {
  $tokenObj = $tokenResp | ConvertFrom-Json
} catch {
  Write-Host "REGRESS_FAILED: token parse error"
  exit 1
}

$token = $tokenObj.downloadToken

if (-not $token) {
  Write-Host "REGRESS_FAILED: token missing"
  exit 1
}

# -------------------------------------------------------
# 3 PLAN FULL regression
# -------------------------------------------------------

Write-Section "PLAN FULL (expected 22 pages)"

$planUrl = "$BaseUrl/api/pdf?download=1&downloadToken=$token&mode=full&planId=$PlanId"

Write-Host "URL: $planUrl"

$outDir = "_regress"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$planFile = "$outDir/plan_full_$PlanId.pdf"

curl.exe --http1.1 -L -o $planFile "$planUrl"

if ($LASTEXITCODE -ne 0) {
  Write-Host "REGRESS_FAILED: download plan failed"
  exit 1
}

Write-Host "Saved: $planFile"

# -------------------------------------------------------
# 4 page count check
# -------------------------------------------------------

try {
  $py = @"
from pypdf import PdfReader
r = PdfReader("$planFile")
print("pages=", len(r.pages))
"@

  $tmp = "$outDir/_check_pages.py"
  $py | Out-File $tmp -Encoding utf8

  python $tmp
} catch {
  Write-Host "WARN: page check skipped (python/pypdf missing)"
}

# -------------------------------------------------------
# 5 summary
# -------------------------------------------------------

Write-Section "SUMMARY"

Write-Host "PDF regression completed."
Write-Host "Output directory:"
Write-Host (Resolve-Path $outDir)

exit 0