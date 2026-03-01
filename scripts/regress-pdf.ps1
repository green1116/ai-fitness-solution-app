# scripts/regress-pdf.ps1
# Regress PDFs for ai-solution-app (Plan22 + Budget brand/government)
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\scripts\regress-pdf.ps1
#   powershell -ExecutionPolicy Bypass -File .\scripts\regress-pdf.ps1 -BaseUrl "http://127.0.0.1:3000" -PlanId "attaguy-plan"

param(
  [string]$BaseUrl = "http://localhost:3000",
  [string]$PlanId = "attaguy-plan",
  [string]$OutDir = ".\_regress",
  [int]$TimeoutSec = 90
)

$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$dir) {
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
}

function Q([hashtable]$qs) {
  # deterministic ordering for readability
  $keys = $qs.Keys | Sort-Object
  ($keys | ForEach-Object {
    "{0}={1}" -f $_, [uri]::EscapeDataString([string]$qs[$_])
  }) -join "&"
}

function Curl-Head([string]$url) {
  & curl.exe --http1.1 -sS -I --max-time $TimeoutSec $url
}

function Curl-Get([string]$url, [string]$outfile) {
  # -f: fail on HTTP >= 400 (curl will exit non-zero)
  & curl.exe --http1.1 -sS -L --max-time $TimeoutSec -f $url -o $outfile
}

function Pdf-Info([string]$file, [int]$previewChars = 160) {
  & python scripts/pdf_info.py $file $previewChars
}

function Assert-Contains([string]$file, [string[]]$needles) {
  & python scripts/pdf_assert_contains.py $file @needles
}

function Print-Block([string]$title) {
  Write-Host ""
  Write-Host "===================="
  Write-Host $title
  Write-Host "===================="
}

Ensure-Dir $OutDir

# ---------- URLs ----------
$planUrl = "$BaseUrl/api/pdf?" + (Q @{ planId=$PlanId; mode="full"; download="1" })
$budgetBrandUrl = "$BaseUrl/api/pdf?" + (Q @{ planId=$PlanId; mode="budget"; level="brand"; download="1" })
$budgetGovUrl = "$BaseUrl/api/pdf?" + (Q @{ planId=$PlanId; mode="budget"; level="government"; download="1"; docSeq="01" })

$planFile = Join-Path $OutDir ("plan_full_{0}.pdf" -f $PlanId)
$brandFile = Join-Path $OutDir ("budget_brand_{0}.pdf" -f $PlanId)
$govFile = Join-Path $OutDir ("budget_gov_{0}.pdf" -f $PlanId)

# ---------- PLAN FULL ----------
Print-Block "PLAN FULL (expected 22 pages)"
Write-Host "URL: $planUrl"
Write-Host "--- HEAD ---"
Curl-Head $planUrl | Write-Host
Write-Host "--- GET ---"
Curl-Get $planUrl $planFile
Write-Host "Saved: $planFile"
Pdf-Info $planFile
# Hard assertion for your golden baseline
$planPages = & python -c "from pypdf import PdfReader; import sys; print(len(PdfReader(sys.argv[1]).pages))" $planFile
if ([int]$planPages -ne 22) { throw "PLAN pages expected 22, got $planPages" }
Write-Host "assert_ok=PLAN_PAGES_22"

# ---------- BUDGET BRAND ----------
Print-Block "BUDGET BRAND (expected 2 pages)"
Write-Host "URL: $budgetBrandUrl"
Write-Host "--- HEAD ---"
Curl-Head $budgetBrandUrl | Write-Host
Write-Host "--- GET ---"
Curl-Get $budgetBrandUrl $brandFile
Write-Host "Saved: $brandFile"
Pdf-Info $brandFile
$brandPages = & python -c "from pypdf import PdfReader; import sys; print(len(PdfReader(sys.argv[1]).pages))" $brandFile
if ([int]$brandPages -ne 2) { throw "BUDGET brand pages expected 2, got $brandPages" }
Write-Host "assert_ok=BUDGET_BRAND_PAGES_2"

# ---------- BUDGET GOV ----------
Print-Block "BUDGET GOVERNMENT (expected 5 pages + DOCNO/SIG on page1)"
Write-Host "URL: $budgetGovUrl"
Write-Host "--- HEAD ---"
Curl-Head $budgetGovUrl | Write-Host
Write-Host "--- GET ---"
Curl-Get $budgetGovUrl $govFile
Write-Host "Saved: $govFile"
Pdf-Info $govFile
$govPages = & python -c "from pypdf import PdfReader; import sys; print(len(PdfReader(sys.argv[1]).pages))" $govFile
if ([int]$govPages -ne 5) { throw "BUDGET gov pages expected 5, got $govPages" }
Write-Host "assert_ok=BUDGET_GOV_PAGES_5"

# verify the strict gov identifiers exist (DOCNO/SIG patterns)
Assert-Contains $govFile @("AFS-GOV-", "DOCNO:", "SIG:")
Write-Host "assert_ok=BUDGET_GOV_DOCNO_SIG"

Write-Host ""
Write-Host "===================="
Write-Host "DONE"
Write-Host "===================="
Write-Host ""
Write-Host "Output directory:"
Resolve-Path $OutDir
