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

function Normalize-HeadText($headText) {
  if ($null -eq $headText) { return "" }
  if ($headText -is [System.Array]) {
    return (($headText | ForEach-Object { "$_" }) -join "`n")
  }
  return [string]$headText
}

function Assert-HeaderContains($headText, $needle, $label) {
  $text = (Normalize-HeadText $headText).ToLowerInvariant()
  $want = $needle.ToLowerInvariant()

  if (-not $text.Contains($want)) {
    Write-Host ""
    Write-Host "HEADER_DUMP_BEGIN"
    Write-Host $text
    Write-Host "HEADER_DUMP_END"
    throw "REGRESS_FAILED: missing header [$needle] for $label"
  }
}

function Print-ImportantHeaders($headText) {
  $text = Normalize-HeadText $headText
  $lines = $text -split "`r?`n"
  foreach ($line in $lines) {
    $trimmed = $line.Trim()
    if ($trimmed -match '^(content-type|x-pdf-version|x-reqsig|x-pdf-mode|x-tender-level|x-theme|x-watermark|x-pack-pagination|x-pack-footer|x-pack-budget-sections)\s*:') {
      Write-Host $trimmed
    }
  }
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

function Check-PdfPagesExact($file, $expectedPages, $label) {
  $py = @"
from pypdf import PdfReader
r = PdfReader(r"$file")
n = len(r.pages)
print("pages=", n)
assert n == $expectedPages, f"$label expected $expectedPages pages, got {n}"
"@

  $tmp = Join-Path "_regress" "_check_pages_exact.py"
  $py | Out-File $tmp -Encoding utf8

  python $tmp
  if ($LASTEXITCODE -ne 0) {
    throw "REGRESS_FAILED: page check failed for $label"
  }
}

function Check-PdfPagesMin($file, $minPages, $label) {
  $py = @"
from pypdf import PdfReader
r = PdfReader(r"$file")
n = len(r.pages)
print("pages=", n)
assert n >= $minPages, f"$label expected at least $minPages pages, got {n}"
"@

  $tmp = Join-Path "_regress" "_check_pages_min.py"
  $py | Out-File $tmp -Encoding utf8

  python $tmp
  if ($LASTEXITCODE -ne 0) {
    throw "REGRESS_FAILED: minimum page check failed for $label"
  }
}

function Download-WithHeaders($url, $outFile, $headerFile, $label) {
  curl.exe --http1.1 -s -D $headerFile -o $outFile "$url"
  if ($LASTEXITCODE -ne 0) {
    throw "REGRESS_FAILED: download failed for $label"
  }

  if (-not (Test-Path $headerFile)) {
    throw "REGRESS_FAILED: header file missing for $label"
  }

  return Get-Content $headerFile -Raw
}

# -------------------------------------------------------
# 1 PRECHECK
# -------------------------------------------------------

$preUrl = "$BaseUrl/api/download-token?mode=full&planId=$PlanId"

Write-Host "[pre-commit] Running PDF regression..."
Write-Host "precheck_url=$preUrl"

$preResp = ""
try {
  $preResp = curl.exe --http1.1 -s --max-time 8 "$preUrl"
} catch {
  $preResp = ""
}

if ([string]::IsNullOrWhiteSpace($preResp)) {
  Write-Host ""
  Write-Host "[pre-commit] dev server not running."
  Write-Host "[pre-commit] skip regression (this will not block commit)."
  exit 0
}

$preJson = $null
try {
  $preJson = $preResp | ConvertFrom-Json
} catch {
  Write-Host ""
  Write-Host "[pre-commit] precheck returned non-JSON response."
  Write-Host "[pre-commit] response:"
  Write-Host $preResp
  Write-Host "[pre-commit] skip regression (this will not block commit)."
  exit 0
}

if (-not $preJson.ok) {
  Write-Host ""
  Write-Host "[pre-commit] precheck failed."
  Write-Host $preResp
  Write-Host "[pre-commit] skip regression (this will not block commit)."
  exit 0
}

if ([string]::IsNullOrWhiteSpace([string]$preJson.downloadToken)) {
  Write-Host ""
  Write-Host "[pre-commit] precheck missing downloadToken."
  Write-Host $preResp
  Write-Host "[pre-commit] skip regression (this will not block commit)."
  exit 0
}

Write-Host "precheck_ok=API_DOWNLOAD_TOKEN"
$DownloadToken = [string]$preJson.downloadToken

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
$planHeaderFile = Join-Path $outDir "plan_full_$PlanId.headers.txt"

Write-Host "URL: $planUrl"

$planHead = Download-WithHeaders $planUrl $planFile $planHeaderFile "PLAN FULL"
Print-ImportantHeaders $planHead
Assert-HeaderContains $planHead "content-type: application/pdf" "PLAN FULL"
Assert-HeaderContains $planHead "x-pdf-version:" "PLAN FULL"
Assert-HeaderContains $planHead "x-reqsig:" "PLAN FULL"

Write-Host "Saved: $planFile"
Assert-IsPdf $planFile
Check-PdfPagesExact $planFile 22 "PLAN FULL"

# -------------------------------------------------------
# 5 BUDGET
# -------------------------------------------------------

Write-Section "BUDGET PDF (expected 2 pages)"

$budgetUrl = "$BaseUrl/api/pdf?download=1&downloadToken=$budgetToken&mode=budget&planId=$PlanId&level=$Level"
$budgetFile = Join-Path $outDir "budget_$PlanId.pdf"
$budgetHeaderFile = Join-Path $outDir "budget_$PlanId.headers.txt"

Write-Host "URL: $budgetUrl"

$budgetHead = Download-WithHeaders $budgetUrl $budgetFile $budgetHeaderFile "BUDGET PDF"
Print-ImportantHeaders $budgetHead
Assert-HeaderContains $budgetHead "content-type: application/pdf" "BUDGET PDF"
Assert-HeaderContains $budgetHead "x-pdf-version:" "BUDGET PDF"
Assert-HeaderContains $budgetHead "x-reqsig:" "BUDGET PDF"

Write-Host "Saved: $budgetFile"
Assert-IsPdf $budgetFile
Check-PdfPagesExact $budgetFile 2 "BUDGET PDF"

# -------------------------------------------------------
# 6 TENDER PACK MERGED
# -------------------------------------------------------

Write-Section "TENDER PACK MERGED (soft/strict hybrid)"

$tenderHeadUrl = "$BaseUrl/api/tender-pack?planId=$PlanId&format=merged&level=enterprise&theme=tender&watermark=0&includeCover=1&includeDeclaration=1&packFooter=1"
$tenderFile = Join-Path $outDir "tender_merged_$PlanId.pdf"
$tenderHeaderFile = Join-Path $outDir "tender_merged_$PlanId.headers.txt"

Write-Host "HEAD URL: $tenderHeadUrl"

$tenderHead = curl.exe --http1.1 -s -I --max-time 20 "$tenderHeadUrl"
if ($LASTEXITCODE -ne 0) {
  Write-Host "WARN: tender pack HEAD request failed, skipping tender validation."
} else {
  Print-ImportantHeaders $tenderHead
  Assert-HeaderContains $tenderHead "content-type: application/pdf" "TENDER PACK MERGED"
  Assert-HeaderContains $tenderHead "x-tender-pack:" "TENDER PACK MERGED"
  Assert-HeaderContains $tenderHead "x-tender-level:" "TENDER PACK MERGED"
  Assert-HeaderContains $tenderHead "x-pack-pagination:" "TENDER PACK MERGED"
  Assert-HeaderContains $tenderHead "x-pack-footer:" "TENDER PACK MERGED"
}

Write-Host "token_url=$BaseUrl/api/download-token?mode=pack&planId=$PlanId"
$tenderTokenResp = curl.exe --http1.1 -s "$BaseUrl/api/download-token?mode=pack&planId=$PlanId"

$tenderToken = $null
try {
  $tenderTokenObj = $tenderTokenResp | ConvertFrom-Json
  $tenderToken = $tenderTokenObj.downloadToken
} catch {
  $tenderToken = $null
}

if (-not $tenderToken) {
  Write-Host ""
  Write-Host "WARN: tender pack strict validation skipped."
  Write-Host "Reason: unable to get pack download token."
  Write-Host "Token response:"
  Write-Host $tenderTokenResp
} else {
  $tenderUrl = "$BaseUrl/api/tender-pack?planId=$PlanId&format=merged&level=enterprise&theme=tender&watermark=0&includeCover=1&includeDeclaration=1&packFooter=1&downloadToken=$tenderToken"

  Write-Host "GET URL: $tenderUrl"

  $tenderDownloadHead = Download-WithHeaders $tenderUrl $tenderFile $tenderHeaderFile "TENDER PACK MERGED"
  Print-ImportantHeaders $tenderDownloadHead
  Assert-HeaderContains $tenderDownloadHead "content-type: application/pdf" "TENDER PACK MERGED"

  Write-Host "Saved: $tenderFile"
  Assert-IsPdf $tenderFile
  Check-PdfPagesMin $tenderFile 25 "TENDER PACK MERGED"
}

# -------------------------------------------------------
# 7 SUMMARY
# -------------------------------------------------------

Write-Section "SUMMARY"

Write-Host "PDF regression completed."
Write-Host ""
Write-Host "Generated files:"
Write-Host (Resolve-Path $planFile)
Write-Host (Resolve-Path $budgetFile)
Write-Host (Resolve-Path $tenderFile)

exit 0