# scripts/regress-pdf.ps1
# Regress PDFs for ai-solution-app (Plan22 + Budget saas/enterprise/government)

param(
  [string]$BaseUrl = "http://localhost:3000",
  [string]$PlanId = "attaguy-plan",
  [string]$OutDir = ".\_regress",
  [int]$TimeoutSec = 90,
  [string]$DevDownloadToken = "DEV_MODE_TOKEN",
  [string]$DownloadToken = "",
  [string]$Level = "brand"
)

if ($env:SKIP_PDF_REGRESS -eq "1") {
  Write-Host "[pre-commit] SKIP_PDF_REGRESS=1, skipping regression."
  exit 0
}

$ErrorActionPreference = "Stop"
$didDownload = $false

# ---- PRECHECK ----
$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $ProjectRoot

$PyInfo = Join-Path $PSScriptRoot "pdf_info.py"
$PyContains = Join-Path $PSScriptRoot "pdf_assert_contains.py"
$PyHashes = Join-Path $PSScriptRoot "pdf_hashes.py"

if (!(Test-Path $PyInfo)) { throw "missing python script: $PyInfo" }
if (!(Test-Path $PyContains)) { throw "missing python script: $PyContains" }
if (!(Test-Path $PyHashes)) { throw "missing python script: $PyHashes" }

# verify python + pypdf
& python -c "import sys; import pypdf; print('PY_OK', sys.executable)" | Out-Null

function Ensure-Dir([string]$dir) {
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
}

function Q([hashtable]$qs) {
  $keys = $qs.Keys | Sort-Object
  ($keys | ForEach-Object { "{0}={1}" -f $_, [uri]::EscapeDataString([string]$qs[$_]) }) -join "&"
}

function Curl-Head-ToFile([string]$url, [string]$hdrFile) {
  $dir = Split-Path $hdrFile -Parent
  if ($dir -and !(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  & curl.exe --http1.1 -sS -I --max-time $TimeoutSec -D $hdrFile -o NUL $url
  return $LASTEXITCODE
}

function Curl-Get-ToFile([string]$url, [string]$hdrFile, [string]$outFile, [switch]$FailOnHttp) {
  $dir1 = Split-Path $hdrFile -Parent
  if ($dir1 -and !(Test-Path $dir1)) { New-Item -ItemType Directory -Path $dir1 | Out-Null }
  $dir2 = Split-Path $outFile -Parent
  if ($dir2 -and !(Test-Path $dir2)) { New-Item -ItemType Directory -Path $dir2 | Out-Null }

  $curlArgs = @("--http1.1","-sS","-L","--max-time",$TimeoutSec,"-D",$hdrFile,"-o",$outFile)
  if ($FailOnHttp) { $curlArgs += "-f" }
  $curlArgs += $url
  & curl.exe @curlArgs
  return $LASTEXITCODE
}

function Get-HttpStatusFromHeaderFile([string]$hdrFile) {
  if (!(Test-Path $hdrFile)) { return 0 }
  # 注意：curl -L 时 header 文件会包含多段 HTTP 响应头，这里必须取最后一段的状态码
  $line = (Get-Content $hdrFile | Select-String -Pattern "^HTTP/\d\.\d\s+(\d{3})" | Select-Object -Last 1)
  if (!$line) { return 0 }
  return [int]$line.Matches.Groups[1].Value
}

function Get-HeaderValue([string]$hdrFile, [string]$name) {
  if (!(Test-Path $hdrFile)) { return $null }
  $pattern = "^(?i){0}:\s*(.+)$" -f [regex]::Escape($name)
  # 同理：可能存在多段 header（重定向等），取最后一次出现更可靠
  $m = Get-Content $hdrFile | Select-String -Pattern $pattern | Select-Object -Last 1
  if (!$m) { return $null }
  return $m.Matches.Groups[1].Value.Trim()
}

function Assert-HttpStatus([string]$hdrFile, [int]$expected) {
  $code = Get-HttpStatusFromHeaderFile $hdrFile
  if ($code -ne $expected) {
    throw "HTTP status expected $expected, got $code (hdr=$hdrFile)"
  }
}

function Assert-TextContains([string]$file, [string]$needle) {
  if (!(Test-Path $file)) { throw "missing file: $file" }
  $txt = Get-Content $file -Raw
  if ($txt -notmatch [regex]::Escape($needle)) {
    throw "expect body contains '$needle' (file=$file)"
  }
}

function Extract-AuditHeaders([string]$hdrFile) {
  $reqsig = (Get-HeaderValue $hdrFile "x-reqsig")
  if (-not $reqsig) { $reqsig = (Get-HeaderValue $hdrFile "x-pack-reqsig") }
  if (-not $reqsig) { $reqsig = (Get-HeaderValue $hdrFile "x-pack-sig") }

  return @{
    status        = (Get-HttpStatusFromHeaderFile $hdrFile)
    x_pdf_mode    = (Get-HeaderValue $hdrFile "x-pdf-mode")
    x_pdf_version = (Get-HeaderValue $hdrFile "x-pdf-version")
    x_engine_fp   = (Get-HeaderValue $hdrFile "x-engine-fp")
    x_reqsig      = $reqsig
    x_tender      = (Get-HeaderValue $hdrFile "x-tender-level")
    x_theme       = (Get-HeaderValue $hdrFile "x-theme")
    x_docseq      = (Get-HeaderValue $hdrFile "x-budget-docseq")
    x_tender_no   = (Get-HeaderValue $hdrFile "x-tender-no")
    x_pack_footer = (Get-HeaderValue $hdrFile "x-pack-footer")
    x_pack_theme  = (Get-HeaderValue $hdrFile "x-pack-theme")
    x_pack_tz     = (Get-HeaderValue $hdrFile "x-pack-tz")
    x_pack_skip   = (Get-HeaderValue $hdrFile "x-pack-skip-first")
    x_pack_ver    = (Get-HeaderValue $hdrFile "x-tender-pack")
    x_pack_pagination = (Get-HeaderValue $hdrFile "x-pack-pagination")
  }
}

function Pdf-Info([string]$file, [int]$previewChars = 160) {
  & python $PyInfo $file $previewChars
}

function Pdf-Hashes([string]$file) {
  $json = & python $PyHashes $file
  return (ConvertFrom-Json $json)
}

function Assert-Contains([string]$file, [string[]]$needles) {
  & python $PyContains $file @needles
}

function Print-Block([string]$title) {
  Write-Host ""
  Write-Host "===================="
  Write-Host $title
  Write-Host "===================="
}

function Get-ResponseHeaderValue($headers, $key) {
  foreach ($k in $headers.Keys) {
    if ($k.ToString().ToLower() -eq $key.ToLower()) { return $headers[$k] }
  }
  return $null
}

function Assert-True($cond, $msg) {
  if (-not $cond) { throw $msg }
}

# ---------- report structs ----------
Ensure-Dir $OutDir

$report = @{
  ts = (Get-Date -Format "o")
  baseUrl = $BaseUrl
  planId = $PlanId
  ok = $true
  failReason = $null
  cases = @()
}

$reportFile = Join-Path $OutDir "report.json"
$diffFile = Join-Path $OutDir "diff.json"
$diffOk = $true
$diff = $null

# ---------- helpers for diff ----------
function Find-CaseByName($cases, [string]$name) {
  foreach ($x in $cases) { if ($x.name -eq $name) { return $x } }
  return $null
}

function Diff-PageHashes($a, $b) {
  $pa = @()
  $pb = @()
  if ($a -and $a.hashes -and $a.hashes.page_text_sha256) { $pa = @($a.hashes.page_text_sha256) }
  if ($b -and $b.hashes -and $b.hashes.page_text_sha256) { $pb = @($b.hashes.page_text_sha256) }

  $max = [Math]::Max($pa.Count, $pb.Count)
  $changed = New-Object System.Collections.Generic.List[int]
  for ($i=0; $i -lt $max; $i++) {
    $ha = if ($i -lt $pa.Count) { [string]$pa[$i] } else { "" }
    $hb = if ($i -lt $pb.Count) { [string]$pb[$i] } else { "" }
    if ($ha -ne $hb) { $changed.Add($i+1) | Out-Null }
  }
  return @($changed)
}

try {
  if ($env:SKIP_PDF_REGRESS -eq "1") {
    Write-Host "[pre-commit] SKIP_PDF_REGRESS=1, skipping regression."
    exit 0
  }

  # --- PRECHECK (lightweight) ---
  $base = $BaseUrl.Trim().TrimEnd("/")
  $base = $base -replace "^http://localhost(?=[:/]|$)", "http://127.0.0.1"
  if ($base -match "^https?://127\.0\.0\.1$") { $base = "$base:3000" }

  $preUrl = "$base/api/download-token?mode=full&planId=$PlanId"
  Write-Host ("precheck_url=" + $preUrl)

  # curl precheck: fast + non-interactive
  $preOut = & curl.exe --http1.1 -sS -L --max-time 8 "$preUrl"
  if ($LASTEXITCODE -ne 0 -or -not $preOut) {
    throw ("[pre-commit] PRECHECK FAIL: cannot reach " + $preUrl + "`n" +
           "Hint: start dev server first: npm run dev")
  }
  Write-Host "precheck_ok=API_DOWNLOAD_TOKEN"

  # ---------- URLs (token-based: 方案1 全部走 /api/download-token) ----------
  function Get-DownloadToken([string]$mode) {
    $u = "$BaseUrl/api/download-token?" + (Q @{ planId=$PlanId; mode=$mode })

    $json = & curl.exe --http1.1 -sS -L --max-time $TimeoutSec $u

    if ($LASTEXITCODE -ne 0) {
      throw ("curl failed (exit={0}) url={1}" -f $LASTEXITCODE, $u)
    }

    if ([string]::IsNullOrWhiteSpace($json)) {
      throw ("empty response from server url={0}" -f $u)
    }

    try {
      $obj = $json | ConvertFrom-Json
    } catch {
      throw ("non-JSON response url={0} body={1}" -f $u, $json)
    }

    if (-not $obj.downloadToken) {
      throw ("missing downloadToken field url={0} body={1}" -f $u, $json)
    }

    return $obj.downloadToken
  }

  # PLAN 用独立的 full token；BUDGET 各用各的 token（不要复用）
  $tokFull = Get-DownloadToken "full"

  $planToken = if ($DownloadToken) { $DownloadToken } else { $tokFull }
  $planUrl = "$BaseUrl/api/pdf?" + (Q @{
    planId=$PlanId; mode="full"; download="1"; downloadToken=$planToken
  })

  $planFile  = Join-Path $OutDir ("plan_full_{0}.pdf" -f $PlanId)
  $brandFile = Join-Path $OutDir ("budget_brand_{0}.pdf" -f $PlanId)
  $entFile   = Join-Path $OutDir ("budget_enterprise_{0}.pdf" -f $PlanId)
  $govFile   = Join-Path $OutDir ("budget_gov_{0}.pdf" -f $PlanId)

  # ---------- PLAN FULL ----------
  $planHeadFile = Join-Path $OutDir ("plan_full_{0}.hdr.txt" -f $PlanId)
  Print-Block "PLAN FULL (expected 22 pages)"
  Write-Host "URL: $planUrl"
  Write-Host "--- HEAD ---"
  $ecH = Curl-Head-ToFile $planUrl $planHeadFile
  if ($ecH -ne 0) { throw "HEAD failed: $planUrl" }
  Get-Content $planHeadFile -TotalCount 30 | Write-Host
  Write-Host "--- GET ---"
  $ecG = Curl-Get-ToFile $planUrl $planHeadFile $planFile -FailOnHttp
  if ($ecG -ne 0) { throw "GET failed: $planUrl" }
  if (!(Test-Path $planFile)) { throw "downloaded file missing after curl: $planFile" }
  Assert-HttpStatus $planHeadFile 200
  if (-not (Get-HeaderValue $planHeadFile "x-pdf-mode")) { throw "missing X-PDF-MODE (plan)" }
  if (-not (Get-HeaderValue $planHeadFile "x-pdf-version")) { throw "missing X-PDF-VERSION (plan)" }
  if (-not (Get-HeaderValue $planHeadFile "x-reqsig")) { throw "missing X-REQSIG (plan)" }
  Write-Host "Saved: $planFile"
  $didDownload = $true
  Pdf-Info $planFile

  $planPages = & python -c "from pypdf import PdfReader; import sys; print(len(PdfReader(sys.argv[1]).pages))" $planFile
  $planBytes = (Get-Item $planFile).Length
  $planOk = ([int]$planPages -eq 22)
  if (-not $planOk) { throw "PLAN pages expected 22, got $planPages" }
  Write-Host "assert_ok=PLAN_PAGES_22"

  $report.cases += @{
    name = "PLAN_FULL"
    ok = $planOk
    pages = [int]$planPages
    bytes = [int]$planBytes
    file = $planFile
    headers = (Extract-AuditHeaders $planHeadFile)
    hashes = (Pdf-Hashes $planFile)
  }

  # ---------- BUDGET BRAND ----------
  $brandHeadFile = Join-Path $OutDir ("budget_brand_{0}.hdr.txt" -f $PlanId)
  $tokBrand = Get-DownloadToken "budget"
  $budgetBrandUrl = "$BaseUrl/api/pdf?" + (Q @{
    planId=$PlanId; mode="budget"; level="brand"; download="1"; downloadToken=$tokBrand
  })
  Print-Block "BUDGET BRAND (expected 2 pages)"
  Write-Host "URL: $budgetBrandUrl"
  Write-Host "--- HEAD ---"
  $ecH = Curl-Head-ToFile $budgetBrandUrl $brandHeadFile
  if ($ecH -ne 0) { throw "HEAD failed: $budgetBrandUrl" }
  Get-Content $brandHeadFile -TotalCount 30 | Write-Host
  Write-Host "--- GET ---"
  $ecG = Curl-Get-ToFile $budgetBrandUrl $brandHeadFile $brandFile -FailOnHttp
  if ($ecG -ne 0) { throw "GET failed: $budgetBrandUrl" }
  if (!(Test-Path $brandFile)) { throw "downloaded file missing after curl: $brandFile" }
  Assert-HttpStatus $brandHeadFile 200
  if (-not (Get-HeaderValue $brandHeadFile "x-pdf-version")) { throw "missing x-pdf-version (budget-brand)" }
  if (-not (Get-HeaderValue $brandHeadFile "x-reqsig")) { throw "missing x-reqsig (budget-brand)" }
  Write-Host "Saved: $brandFile"
  $didDownload = $true
  Pdf-Info $brandFile

  $brandPages = & python -c "from pypdf import PdfReader; import sys; print(len(PdfReader(sys.argv[1]).pages))" $brandFile
  $brandBytes = (Get-Item $brandFile).Length
  $brandOk = ([int]$brandPages -eq 2)
  if (-not $brandOk) { throw "BUDGET brand pages expected 2, got $brandPages" }
  Write-Host "assert_ok=BUDGET_BRAND_PAGES_2"

  $report.cases += @{
    name = "BUDGET_BRAND"
    ok = $brandOk
    pages = [int]$brandPages
    bytes = [int]$brandBytes
    file = $brandFile
    headers = (Extract-AuditHeaders $brandHeadFile)
    hashes = (Pdf-Hashes $brandFile)
  }

  # ---------- BUDGET ENTERPRISE ----------
  $entHeadFile = Join-Path $OutDir ("budget_enterprise_{0}.hdr.txt" -f $PlanId)
  $tokEnt = Get-DownloadToken "budget"
  $budgetEntUrl = "$BaseUrl/api/pdf?" + (Q @{
    planId=$PlanId; mode="budget"; level="enterprise"; download="1"; downloadToken=$tokEnt
  })
  Print-Block "BUDGET ENTERPRISE (expected 7 pages: 2 base + 5 terms)"
  Write-Host "URL: $budgetEntUrl"
  Write-Host "--- HEAD ---"
  $ecH = Curl-Head-ToFile $budgetEntUrl $entHeadFile
  if ($ecH -ne 0) { throw "HEAD failed: $budgetEntUrl" }
  Get-Content $entHeadFile -TotalCount 30 | Write-Host
  Write-Host "--- GET ---"
  $ecG = Curl-Get-ToFile $budgetEntUrl $entHeadFile $entFile -FailOnHttp
  if ($ecG -ne 0) { throw "GET failed: $budgetEntUrl" }
  if (!(Test-Path $entFile)) { throw "downloaded file missing after curl: $entFile" }
  Assert-HttpStatus $entHeadFile 200
  if (-not (Get-HeaderValue $entHeadFile "x-pdf-version")) { throw "missing x-pdf-version (budget-ent)" }
  if (-not (Get-HeaderValue $entHeadFile "x-reqsig")) { throw "missing x-reqsig (budget-ent)" }
  Write-Host "Saved: $entFile"
  $didDownload = $true
  Pdf-Info $entFile

  $entPages = & python -c "from pypdf import PdfReader; import sys; print(len(PdfReader(sys.argv[1]).pages))" $entFile
  $entBytes = (Get-Item $entFile).Length
  $entOk = ([int]$entPages -eq 7)
  if (-not $entOk) { throw "BUDGET enterprise pages expected 7, got $entPages" }
  Write-Host "assert_ok=BUDGET_ENTERPRISE_PAGES_7"

  $report.cases += @{
    name = "BUDGET_ENTERPRISE"
    ok = $entOk
    pages = [int]$entPages
    bytes = [int]$entBytes
    file = $entFile
    headers = (Extract-AuditHeaders $entHeadFile)
    hashes = (Pdf-Hashes $entFile)
  }

  # ---------- BUDGET GOV ----------
  $govHeadFile = Join-Path $OutDir ("budget_gov_{0}.hdr.txt" -f $PlanId)
  $tokGov = Get-DownloadToken "budget"
  $budgetGovUrl = "$BaseUrl/api/pdf?" + (Q @{
    planId=$PlanId; mode="budget"; level="government"; download="1"; docSeq="01"; downloadToken=$tokGov
  })
  Print-Block "BUDGET GOVERNMENT (expected 5 pages + DOCNO/SIG on page1)"
  Write-Host "URL: $budgetGovUrl"
  Write-Host "--- HEAD ---"
  $ecH = Curl-Head-ToFile $budgetGovUrl $govHeadFile
  if ($ecH -ne 0) { throw "HEAD failed: $budgetGovUrl" }
  Get-Content $govHeadFile -TotalCount 30 | Write-Host
  Write-Host "--- GET ---"
  $ecG = Curl-Get-ToFile $budgetGovUrl $govHeadFile $govFile -FailOnHttp
  if ($ecG -ne 0) { throw "GET failed: $budgetGovUrl" }
  if (!(Test-Path $govFile)) { throw "downloaded file missing after curl: $govFile" }
  Assert-HttpStatus $govHeadFile 200
  if (-not (Get-HeaderValue $govHeadFile "x-pdf-version")) { throw "missing x-pdf-version (budget-gov)" }
  if (-not (Get-HeaderValue $govHeadFile "x-reqsig")) { throw "missing x-reqsig (budget-gov)" }
  Write-Host "Saved: $govFile"
  $didDownload = $true
  Pdf-Info $govFile

  $govPages = & python -c "from pypdf import PdfReader; import sys; print(len(PdfReader(sys.argv[1]).pages))" $govFile
  $govBytes = (Get-Item $govFile).Length
  $govOk = ([int]$govPages -eq 5)
  if (-not $govOk) { throw "BUDGET gov pages expected 5, got $govPages" }
  Write-Host "assert_ok=BUDGET_GOV_PAGES_5"

  $govContains = @("AFS-GOV-", "DOCNO:", "SIG:")
  Assert-Contains $govFile $govContains
  Write-Host "assert_ok=BUDGET_GOV_DOCNO_SIG"

  $report.cases += @{
    name = "BUDGET_GOV"
    ok = $govOk
    pages = [int]$govPages
    bytes = [int]$govBytes
    file = $govFile
    contains = $govContains
    headers = (Extract-AuditHeaders $govHeadFile)
    hashes = (Pdf-Hashes $govFile)
  }

  # ---------- PACK MERGED (main) ----------
  $packMainUrl = "$BaseUrl/api/tender-pack?" + (Q @{
    planId=$PlanId; format="merged"; level="enterprise"; theme="tender"; watermark="0";
    includeCover="1"; includeDeclaration="1"; packFooter="1"; download="1"; downloadToken=$DevDownloadToken;
    internal="1"; freezeYmd="20260313"; freezeTenderNo="TENDER-attaguy-plan-20260313"
  })

  $packMainHdr = Join-Path $OutDir ("pack_merged_{0}.hdr.txt" -f $PlanId)
  $packMainPdf = Join-Path $OutDir ("pack_merged_{0}.pdf" -f $PlanId)

  Print-Block "PACK MERGED (main) (expected >= plan pages)"
  Write-Host "URL: $packMainUrl"
  Write-Host "--- HEAD ---"
  $ecH = Curl-Head-ToFile $packMainUrl $packMainHdr
  if ($ecH -ne 0) { throw "HEAD failed: $packMainUrl" }
  Get-Content $packMainHdr -TotalCount 30 | Write-Host

  Write-Host "--- GET ---"
  $ecG = Curl-Get-ToFile $packMainUrl $packMainHdr $packMainPdf -FailOnHttp
  if ($ecG -ne 0) { throw "GET failed: $packMainUrl" }
  Assert-HttpStatus $packMainHdr 200

  if ((Get-HeaderValue $packMainHdr "x-pack-pagination") -ne "1") { throw "PACK expected x-pack-pagination=1" }
  if ((Get-HeaderValue $packMainHdr "x-pack-footer") -ne "1") { throw "PACK expected x-pack-footer=1" }
  if ((Get-HeaderValue $packMainHdr "x-pack-skip-first") -ne "3") { throw "PACK expected x-pack-skip-first=3" }
  Write-Host "assert_ok=PACK_HEADERS_CORE"

  if (!(Test-Path $packMainPdf)) { throw "downloaded file missing: $packMainPdf" }
  Write-Host "Saved: $packMainPdf"
  $didDownload = $true
  Pdf-Info $packMainPdf

  Assert-Contains $packMainPdf @("TENDER-", "AI Fitness Solution")
  Write-Host "assert_ok=PACK_CONTENT_CORE"

  $packPages = & python -c "from pypdf import PdfReader; import sys; print(len(PdfReader(sys.argv[1]).pages))" $packMainPdf
  $packBytes = (Get-Item $packMainPdf).Length
  if ([int]$packPages -lt 22) { throw "PACK merged pages expected >= 22, got $packPages" }
  Write-Host "assert_ok=PACK_MERGED_PAGES_GE_22"

  $report.cases += @{
    name = "PACK_MERGED"
    ok = $true
    pages = [int]$packPages
    bytes = [int]$packBytes
    file = $packMainPdf
    url = $packMainUrl
    headers = (Extract-AuditHeaders $packMainHdr)
    hashes = (Pdf-Hashes $packMainPdf)
  }

  # ---------- BUDGET BRAND (Invoke-WebRequest, expected 2 pages) ----------
  $CompanyName = "Example Corp"
  $CompanySize = 200
  $BudgetTier = "mid"
  $Tz = "Asia/Tokyo"
  $budgetToken = if ($DownloadToken) { $DownloadToken } elseif ($DevDownloadToken) { $DevDownloadToken } else { Get-DownloadToken "budget" }

  Write-Host ""
  Write-Host "===================="
  Write-Host "BUDGET BRAND (Invoke-WebRequest, expected 2 pages)"
  Write-Host "===================="

  $bu = "$BaseUrl/api/pdf?download=1" +
    "&planId=$([uri]::EscapeDataString($PlanId))" +
    "&mode=budget" +
    "&level=$([uri]::EscapeDataString($Level))" +
    "&companyName=$([uri]::EscapeDataString($CompanyName))" +
    "&companySize=$CompanySize" +
    "&budgetTier=$BudgetTier" +
    "&tz=$([uri]::EscapeDataString($Tz))" +
    "&downloadToken=$([uri]::EscapeDataString($budgetToken))"

  Write-Host "URL: $bu"

  $bh = Invoke-WebRequest -Method Head -Uri $bu -UseBasicParsing -TimeoutSec $TimeoutSec
  Assert-True ($bh.StatusCode -eq 200) "BUDGET HEAD not 200"
  Assert-True (Get-ResponseHeaderValue $bh.Headers "X-PDF-MODE") "BUDGET Missing X-PDF-MODE"
  Assert-True (Get-ResponseHeaderValue $bh.Headers "X-PDF-VERSION") "BUDGET Missing X-PDF-VERSION"
  Assert-True (Get-ResponseHeaderValue $bh.Headers "X-REQSIG") "BUDGET Missing X-REQSIG"

  $outBudget = Join-Path $OutDir "budget_invoke_${Level}_${PlanId}.pdf"
  Invoke-WebRequest -Method Get -Uri $bu -OutFile $outBudget -UseBasicParsing -TimeoutSec $TimeoutSec
  Assert-True (Test-Path $outBudget) "Budget pdf not saved"

  $pagesB = & python -c "from pypdf import PdfReader; import sys; print(len(PdfReader(sys.argv[1]).pages))" $outBudget
  $pagesB = [int]$pagesB.Trim()
  Write-Host "Saved: $outBudget"
  $didDownload = $true
  Write-Host "pages=$pagesB"
  Assert-True ($pagesB -eq 2) "Budget pages mismatch: got $pagesB expect 2"
  Write-Host "assert_ok=BUDGET_INVOKE_PAGES_2"

  $report.cases += @{
    name = "BUDGET_BRAND_INVOKE"
    ok = $true
    pages = [int]$pagesB
    bytes = [int](Get-Item $outBudget).Length
    file = $outBudget
    url = $bu
    headers = @{
      status = $bh.StatusCode
      x_pdf_mode = (Get-ResponseHeaderValue $bh.Headers "X-PDF-MODE")
      x_pdf_version = (Get-ResponseHeaderValue $bh.Headers "X-PDF-VERSION")
      x_reqsig = (Get-ResponseHeaderValue $bh.Headers "X-REQSIG")
    }
    hashes = (Pdf-Hashes $outBudget)
  }

  # ---------- TOKEN QUOTA ----------
  Print-Block "TOKEN QUOTA (2nd GET must be 403 TOKEN_QUOTA_EXCEEDED)"

  # FULL quota
  $tf = Get-DownloadToken "full"
  $fullUrl = "$BaseUrl/api/pdf?" + (Q @{ planId=$PlanId; mode="full"; level="enterprise"; theme="tender"; pdfVersionPlan="PLAN_V1"; downloadToken=$tf })
  $full1Hdr = Join-Path $OutDir "quota_full_1.hdr.txt"
  $full2Hdr = Join-Path $OutDir "quota_full_2.hdr.txt"
  $full1Pdf = Join-Path $OutDir "quota_full_1.pdf"
  $full2Body = Join-Path $OutDir "quota_full_2.body.json"

  $ec1 = Curl-Get-ToFile $fullUrl $full1Hdr $full1Pdf -FailOnHttp
  if ($ec1 -ne 0) { throw "FULL first GET failed (exit=$ec1)" }
  Assert-HttpStatus $full1Hdr 200

  $ec2 = Curl-Get-ToFile $fullUrl $full2Hdr $full2Body
  Assert-HttpStatus $full2Hdr 403
  Assert-TextContains $full2Body "TOKEN_QUOTA_EXCEEDED"
  Write-Host "assert_ok=FULL_TOKEN_QUOTA_403"

  $report.cases += @{
    name = "TOKEN_QUOTA_FULL"
    ok = $true
    headers = (Extract-AuditHeaders $full2Hdr)
    url = $fullUrl
    first = @{ headers = (Extract-AuditHeaders $full1Hdr); file = $full1Pdf }
    second = @{ headers = (Extract-AuditHeaders $full2Hdr); bodyFile = $full2Body }
  }

  # BUDGET quota
  $tb = Get-DownloadToken "budget"
  $budgetUrl = "$BaseUrl/api/pdf?" + (Q @{ planId=$PlanId; mode="budget"; level="enterprise"; theme="tender"; pdfVersionBudget="BUDGET_V1"; downloadToken=$tb })
  $b1Hdr = Join-Path $OutDir "quota_budget_1.hdr.txt"
  $b2Hdr = Join-Path $OutDir "quota_budget_2.hdr.txt"
  $b1Pdf = Join-Path $OutDir "quota_budget_1.pdf"
  $b2Body = Join-Path $OutDir "quota_budget_2.body.json"

  $ec1 = Curl-Get-ToFile $budgetUrl $b1Hdr $b1Pdf -FailOnHttp
  if ($ec1 -ne 0) { throw "BUDGET first GET failed (exit=$ec1)" }
  Assert-HttpStatus $b1Hdr 200

  $ec2 = Curl-Get-ToFile $budgetUrl $b2Hdr $b2Body
  Assert-HttpStatus $b2Hdr 403
  Assert-TextContains $b2Body "TOKEN_QUOTA_EXCEEDED"
  Write-Host "assert_ok=BUDGET_TOKEN_QUOTA_403"

  $report.cases += @{
    name = "TOKEN_QUOTA_BUDGET"
    ok = $true
    headers = (Extract-AuditHeaders $b2Hdr)
    url = $budgetUrl
    first = @{ headers = (Extract-AuditHeaders $b1Hdr); file = $b1Pdf }
    second = @{ headers = (Extract-AuditHeaders $b2Hdr); bodyFile = $b2Body }
  }

  # PACK quota
  $tp = Get-DownloadToken "pack"
  $packUrl = "$BaseUrl/api/tender-pack?" + (Q @{ planId=$PlanId; format="merged"; level="enterprise"; theme="tender"; downloadToken=$tp })
  $p1Hdr = Join-Path $OutDir "quota_pack_1.hdr.txt"
  $p2Hdr = Join-Path $OutDir "quota_pack_2.hdr.txt"
  $p1Pdf = Join-Path $OutDir "quota_pack_1.pdf"
  $p2Body = Join-Path $OutDir "quota_pack_2.body.json"

  $ec1 = Curl-Get-ToFile $packUrl $p1Hdr $p1Pdf -FailOnHttp
  if ($ec1 -ne 0) { throw "PACK first GET failed (exit=$ec1)" }
  Assert-HttpStatus $p1Hdr 200

  $ec2 = Curl-Get-ToFile $packUrl $p2Hdr $p2Body
  Assert-HttpStatus $p2Hdr 403
  Assert-TextContains $p2Body "TOKEN_QUOTA_EXCEEDED"
  Write-Host "assert_ok=PACK_TOKEN_QUOTA_403"

  $report.cases += @{
    name = "TOKEN_QUOTA_PACK"
    ok = $true
    headers = (Extract-AuditHeaders $p2Hdr)
    url = $packUrl
    first = @{ headers = (Extract-AuditHeaders $p1Hdr); file = $p1Pdf }
    second = @{ headers = (Extract-AuditHeaders $p2Hdr); bodyFile = $p2Body }
  }

} catch {
  $report.ok = $false
  $report.failReason = $_.Exception.Message
  Write-Host ""
  Write-Host "REGRESS_FAILED: $($report.failReason)"
  throw
} finally {
  # -------- always write report/diff (even on failure) --------
  try {
    Ensure-Dir $OutDir
    $report | ConvertTo-Json -Depth 20 | Set-Content -Path $reportFile -Encoding UTF8
    Write-Host ("Report saved: {0}" -f (Resolve-Path $reportFile))

    $goldenFile = ".\_golden\report.json"
    $diff = @{
      ts = (Get-Date -Format "o")
      golden = $goldenFile
      current = $reportFile
      cases = @()
      ok = $true
    }

    if (Test-Path $goldenFile) {
      $golden = Get-Content $goldenFile -Raw | ConvertFrom-Json

      foreach ($c in $report.cases) {
        if (-not ($c.hashes -and $c.hashes.sha256_pdf)) { continue }
        $g = Find-CaseByName $golden.cases $c.name
        if (-not $g) {
          $diff.ok = $false
          $diff.cases += @{ name=$c.name; status="NEW_CASE"; note="exists in current but not in golden" }
          continue
        }

        $changedPages = Diff-PageHashes $g $c
        $sameText = ($g.hashes.sha256_text -eq $c.hashes.sha256_text)

        $entry = @{
          name = $c.name
          status = if ($sameText) { "UNCHANGED" } else { "CONTENT_CHANGED" }
          text_sha_golden = $g.hashes.sha256_text
          text_sha_current = $c.hashes.sha256_text
          pdf_sha_golden = $g.hashes.sha256_pdf
          pdf_sha_current = $c.hashes.sha256_pdf
          pages_golden = $g.hashes.pages
          pages_current = $c.hashes.pages
          changed_pages = $changedPages
        }

        if (-not $sameText) { $diff.ok = $false }
        $diff.cases += $entry
      }

      $diff | ConvertTo-Json -Depth 20 | Set-Content -Path $diffFile -Encoding UTF8
      Write-Host ("Diff saved: {0}" -f (Resolve-Path $diffFile))
      $diffOk = [bool]$diff.ok

      Write-Host ""
      Write-Host "===================="
      Write-Host "DIFF vs GOLDEN"
      Write-Host "===================="
      foreach ($d in $diff.cases) {
        if ($d.status -eq "UNCHANGED") {
          Write-Host ("{0,-22} | {1}" -f $d.name, "UNCHANGED")
        } else {
          $pg = if ($d.changed_pages -and $d.changed_pages.Count -gt 0) { ($d.changed_pages -join ",") } else { "" }
          Write-Host ("{0,-22} | {1} | pages_changed=[{2}]" -f $d.name, $d.status, $pg)
        }
      }
      Write-Host ("diff_ok={0}" -f $(if ($diffOk) { "YES" } else { "NO" }))
    } else {
      Write-Host ""
      Write-Host "===================="
      Write-Host "DIFF vs GOLDEN"
      Write-Host "===================="
      Write-Host "No golden file found: .\_golden\report.json (skip diff)"
      Write-Host "Tip: Copy-Item .\_regress\report.json .\_golden\report.json -Force"
      $diffOk = $true
    }

    # ---------- CI GATE ----------
    $FailOnDiff = $true
    if ($env:REGRESS_FAIL_ON_DIFF -eq "0") { $FailOnDiff = $false }

    # 1) regress failed -> FAIL (avoid false PASS)
    if (-not $report.ok) {
      Write-Host "CI_GATE=FAIL (REGRESS_FAILED)"
    }
    # 2) regress ok but diff failed -> FAIL
    elseif ($FailOnDiff -and (Test-Path ".\_golden\report.json") -and (-not $diffOk)) {
      Write-Host "CI_GATE=FAIL (DIFF_FAILED)"
    }
    # 3) else -> PASS (only if downloads actually ran)
    else {
      if (-not $didDownload) {
        throw "REGRESS_FAILED: downloads not executed (didDownload=false)"
      }
      Write-Host "CI_GATE=PASS"
    }

    # ---------- HUMAN SUMMARY ----------
    Write-Host ""
    Write-Host "===================="
    Write-Host "SUMMARY"
    Write-Host "===================="

    foreach ($c in $report.cases) {
      $name = $c.name
      $ok = if ($c.ok) { "OK" } else { "FAIL" }
      $pages = if ($c.pages) { $c.pages } else { "-" }
      $bytes = if ($c.bytes) { $c.bytes } else { "-" }
      $status = if ($c.headers -and $c.headers.status) { $c.headers.status } else { "-" }
      $reqsig = if ($c.headers -and $c.headers.x_reqsig) { $c.headers.x_reqsig } else { "-" }

      $hash12 = "-"
      if ($c.hashes -and $c.hashes.sha256_text) { $hash12 = ($c.hashes.sha256_text.Substring(0,12)) }

      $line = "{0,-22} | {1,-4} | pages={2,-3} | bytes={3,-8} | http={4,-3} | sig={5} | sha={6}" -f `
        $name, $ok, $pages, $bytes, $status, $reqsig, $hash12
      Write-Host $line
    }

    Write-Host "===================="
    Write-Host ""
    Write-Host "Output directory:"
    Resolve-Path $OutDir | Write-Host
  } catch {
    Write-Host "WARN: failed to write report/diff in finally: $($_.Exception.Message)"
  }
}