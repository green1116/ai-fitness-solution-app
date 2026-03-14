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
    if ($LASTEXITCODE -ne 0) { return $false }
    return ($r -match "200 OK")
  } catch {
    return $false
  }
}

function Get-DownloadToken($mode, $planId, $baseUrl) {
  $url = "$baseUrl/api/download-token?mode=$mode&planId=$planId"
  Write-Host "token_url=$url"

  $resp = curl.exe --http1.1 -s "$url"
  if ($LASTEXITCODE -ne 0) {
    throw "REGRESS_FAILED: token request failed for mode=$mode"
  }

  try {
    $obj = $resp | ConvertFrom-Json
  } catch {
    Write-Host $resp
    throw "REGRESS_FAILED: token parse error for mode=$mode"
  }

  if (-not $obj.downloadToken) {
    Write-Host $resp
    throw "REGRESS_FAILED: token missing for mode=$mode"
  }

  return $obj.downloadToken
}

function Assert-IsPdf($file) {
  if (-not (Test-Path $file)) {
    throw "REGRESS_FAILED: file not found: $file"
  }

  $bytes = [System.IO.File]::ReadAllBytes((Resolve-Path $file))
  if ($bytes.Length -lt 5) {
    throw "REGRESS_FAILED: file too small: $file"
  }

  $header = [System.Text.Encoding]::ASCII.GetString($bytes[0..4])
  if ($header -ne "%PDF-") {
    Write-Host ""
    Write-Host "NON_PDF_RESPONSE_BEGIN"
    try {
      Get-Content $file -TotalCount 20
    } catch {
      Write-Host "(unable to print file content)"
    }
    Write-Host "NON_PDF_RESPONSE_END"
    throw "REGRESS_FAILED: response is not a PDF: $file"
  }
}

function Check-PdfPages($file, $expectedPages, $label) {
  $py = @"
from pypdf import PdfReader
r = PdfReader(r"$file")
print("pages=", len(r.pages))
assert len(r.pages) == $expectedPages, f"$label expected $expectedPages pages, got {len(r.pages)}"
"@

  $tmp = Join-Path "_regress" "_check_pages.py"
  $py | Out-File $tmp -Encoding utf8

  python $tmp
  if ($LASTEXITCODE -ne 0) {
    throw "REGRESS_FAILED: page check failed for $label"
  }
}

# -------------------------------------------------------
# 1 PRECHECK
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
# 2 PREPARE OUTPUT
# -------------------------------------------------------

$outDir = "_regress"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# -------------------------------------------------------
# 3 GET TOKENS
# -------------------------------------------------------

$planToken = Get-DownloadToken "full" $PlanId $BaseUrl
$budgetToken = Get-DownloadToken "budget" $PlanId $BaseUrl

# -------------------------------------------------------
# 4 PLAN FULL
# -------------------------------------------------------

Write-Section "PLAN FULL (expected 22 pages)"

$planUrl = "$BaseUrl/api/pdf?download=1&downloadToken=$planToken&mode=full&planId=$PlanId"
$planFile = Join-Path $outDir "plan_full_$PlanId.pdf"

Write-Host "URL: $planUrl"

curl.exe --http1.1 -L -o $planFile "$planUrl"
if ($LASTEXITCODE -ne 0) {
  throw "REGRESS_FAILED: download plan failed"
}

Write-Host "Saved: $planFile"
Assert-IsPdf $planFile
Check-PdfPages $planFile 22 "PLAN FULL"

# -------------------------------------------------------
# 5 BUDGET
# -------------------------------------------------------

Write-Section "BUDGET PDF (expected 2 pages)"

$budgetUrl = "$BaseUrl/api/pdf?download=1&downloadToken=$budgetToken&mode=budget&planId=$PlanId&level=$Level"
$budgetFile = Join-Path $outDir "budget_$PlanId.pdf"

Write-Host "URL: $budgetUrl"

curl.exe --http1.1 -L -o $budgetFile "$budgetUrl"
if ($LASTEXITCODE -ne 0) {
  throw "REGRESS_FAILED: download budget failed"
}

Write-Host "Saved: $budgetFile"
Assert-IsPdf $budgetFile
Check-PdfPages $budgetFile 2 "BUDGET PDF"

# -------------------------------------------------------
# 6 SUMMARY
# -------------------------------------------------------

Write-Section "SUMMARY"

Write-Host "PDF regression completed."
Write-Host ""
Write-Host "Generated files:"
Write-Host (Resolve-Path $planFile)
Write-Host (Resolve-Path $budgetFile)

exit 0