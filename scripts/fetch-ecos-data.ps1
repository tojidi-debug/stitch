param(
  [string]$OutputDir = "./public/ecos-data",
  [string]$StartDate = "20200101",
  [string]$BackendBaseUrl = "",
  [string[]]$CategoryIds = @()
)

$ErrorActionPreference = "Stop"
$apiKey = $env:ECOS_API_KEY
if ([string]::IsNullOrWhiteSpace($BackendBaseUrl) -and [string]::IsNullOrWhiteSpace($apiKey)) {
  throw "ECOS_API_KEY or BackendBaseUrl is required."
}

$series = Get-Content -LiteralPath "$PSScriptRoot/ecos-series.json" -Raw | ConvertFrom-Json
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
$today = Get-Date
$generatedAt = $today.ToUniversalTime().ToString("o")
$fileCount = 0

function Get-SafeCode([string]$code) {
  return [regex]::Replace($code, '[^A-Za-z0-9_-]', {
    param($match)
    return "_" + [int][char]$match.Value
  })
}

function Get-Windows([string]$cycle, [string]$startDate, [datetime]$endDate) {
  if ($cycle -eq "M") {
    return @([pscustomobject]@{ Start = $startDate.Substring(0, 6); End = $endDate.ToString("yyyyMM") })
  }

  $windows = @()
  $startYear = [int]$startDate.Substring(0, 4)
  $endYear = $endDate.Year
  for ($year = $startYear; $year -le $endYear; $year += 2) {
    $windowStart = if ($year -eq $startYear) { $startDate } else { "${year}0101" }
    $windowEndYear = [Math]::Min($year + 1, $endYear)
    $windowEnd = if ($windowEndYear -eq $endYear) { $endDate.ToString("yyyyMMdd") } else { "${windowEndYear}1231" }
    $windows += [pscustomobject]@{ Start = $windowStart; End = $windowEnd }
  }
  return $windows
}

foreach ($category in $series) {
  if ($CategoryIds.Count -gt 0 -and $CategoryIds -notcontains [string]$category.id) { continue }
  $windows = Get-Windows ([string]$category.cycle) $StartDate $today

  foreach ($itemCode in $category.items) {
    $rowMap = @{}
    foreach ($window in $windows) {
      $rangeStart = $window.Start
      $rangeEnd = $window.End
      $encodedItem = [Uri]::EscapeDataString([string]$itemCode)

      if (-not [string]::IsNullOrWhiteSpace($BackendBaseUrl)) {
        $url = "$BackendBaseUrl/api/search?stat_code=$($category.statCode)&item_code=$encodedItem&cycle=$($category.cycle)&start=$rangeStart&end=$rangeEnd"
        $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 60
        if ($response.error -and -not $response.rows) { throw $response.error }
        foreach ($row in @($response.rows)) {
          if ($row.time) { $rowMap[[string]$row.time] = [string]$row.value }
        }
      } else {
        $url = "https://ecos.bok.or.kr/api/StatisticSearch/$apiKey/json/kr/1/1000/$($category.statCode)/$($category.cycle)/$rangeStart/$rangeEnd/$encodedItem/"
        $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 60
        if ($response.RESULT.CODE) { throw "$($response.RESULT.CODE): $($response.RESULT.MESSAGE)" }
        foreach ($row in @($response.StatisticSearch.row)) {
          if ($row.TIME) { $rowMap[[string]$row.TIME] = [string]$row.DATA_VALUE }
        }
      }
    }

    $compactRows = @($rowMap.GetEnumerator() | Sort-Object Name | ForEach-Object { ,@([string]$_.Name, [string]$_.Value) })
    $payload = [ordered]@{
      generatedAt = $generatedAt
      statCode = [string]$category.statCode
      itemCode = [string]$itemCode
      cycle = [string]$category.cycle
      rows = $compactRows
    }
    $safeCode = Get-SafeCode ([string]$itemCode)
    $filePath = Join-Path $OutputDir "$($category.id)-$safeCode.json"
    $json = $payload | ConvertTo-Json -Depth 5 -Compress
    [IO.File]::WriteAllText($filePath, $json, [Text.UTF8Encoding]::new($false))
    $fileCount++
    Write-Output "Generated $filePath ($($compactRows.Count) rows)"
  }
}

$publishedFileCount = @(Get-ChildItem -LiteralPath $OutputDir -Filter '*.json' | Where-Object { $_.Name -ne 'manifest.json' }).Count
$manifest = [ordered]@{
  generatedAt = $generatedAt
  startDate = $StartDate
  endDate = $today.ToString("yyyyMMdd")
  fileCount = $publishedFileCount
}
$manifestJson = $manifest | ConvertTo-Json -Compress
[IO.File]::WriteAllText((Join-Path $OutputDir 'manifest.json'), $manifestJson, [Text.UTF8Encoding]::new($false))
Write-Output "Published dataset contains $publishedFileCount ECOS data files."