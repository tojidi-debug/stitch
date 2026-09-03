param(
  [string]$OutputDir = "./public/ecos-data",
  [string]$StartDate = "20200101",
  [string]$BackendBaseUrl = "",
  [string[]]$CategoryIds = @(),
  [string]$SeriesFile = "$PSScriptRoot/ecos-series.json",
  [ValidateRange(1, 1000)][int]$PageSize = 1000,
  [switch]$ValidateOnly
)

$ErrorActionPreference = "Stop"
$series = Get-Content -LiteralPath $SeriesFile -Raw | ConvertFrom-Json

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
  if ($cycle -eq "Q") {
    $startQuarter = [Math]::Ceiling(([int]$startDate.Substring(4, 2)) / 3)
    $endQuarter = [Math]::Ceiling($endDate.Month / 3)
    return @([pscustomobject]@{ Start = "$($startDate.Substring(0, 4))Q$startQuarter"; End = "$($endDate.Year)Q$endQuarter" })
  }
  if ($cycle -eq "A") {
    return @([pscustomobject]@{ Start = $startDate.Substring(0, 4); End = $endDate.ToString("yyyy") })
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

function Get-QueryPlan($catalog) {
  $plan = @()
  foreach ($category in $catalog) {
    if ($CategoryIds.Count -gt 0 -and $CategoryIds -notcontains [string]$category.id) { continue }
    foreach ($rawItem in @($category.items)) {
      if ($rawItem -is [string]) {
        $itemId = [string]$rawItem
        $codes = @([string]$rawItem)
        $statCode = [string]$category.statCode
        $fileBase = "$($category.id)-$(Get-SafeCode $itemId)"
      } else {
        $itemId = [string]$rawItem.id
        $codes = @($rawItem.codes | ForEach-Object { [string]$_ })
        $statCode = if ($rawItem.statCode) { [string]$rawItem.statCode } else { [string]$category.statCode }
        $fileBase = if ($rawItem.file) { [string]$rawItem.file } else { "$($category.id)-$(Get-SafeCode $itemId)" }
      }
      $plan += [pscustomobject]@{
        categoryId = [string]$category.id
        itemId = $itemId
        statCode = $statCode
        cycle = [string]$category.cycle
        codes = $codes
        fileBase = $fileBase
      }
    }
  }
  return $plan
}

$queryPlan = @(Get-QueryPlan $series)
if ($ValidateOnly) {
  $queryPlan | ConvertTo-Json -Depth 5 -Compress
  exit 0
}

$apiKey = $env:ECOS_API_KEY
if ([string]::IsNullOrWhiteSpace($BackendBaseUrl) -and [string]::IsNullOrWhiteSpace($apiKey)) {
  throw "ECOS_API_KEY or BackendBaseUrl is required."
}

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
$today = Get-Date
$generatedAt = $today.ToUniversalTime().ToString("o")
$fileCount = 0

foreach ($query in $queryPlan) {
    $windows = Get-Windows ([string]$query.cycle) $StartDate $today
    $rowMap = @{}
    foreach ($window in $windows) {
      $rangeStart = $window.Start
      $rangeEnd = $window.End
      $encodedCodes = @($query.codes | ForEach-Object { [Uri]::EscapeDataString([string]$_) })

      if (-not [string]::IsNullOrWhiteSpace($BackendBaseUrl)) {
        $queryString = "stat_code=$($query.statCode)&cycle=$($query.cycle)&start=$rangeStart&end=$rangeEnd"
        for ($codeIndex = 0; $codeIndex -lt $encodedCodes.Count; $codeIndex++) {
          $queryString += "&item_code$($codeIndex + 1)=$($encodedCodes[$codeIndex])"
        }
        $url = "$BackendBaseUrl/api/search?$queryString"
        $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 60
        if ($response.error -and -not $response.rows) { throw $response.error }
        foreach ($row in @($response.rows)) {
          if ($row.time) { $rowMap[[string]$row.time] = [string]$row.value }
        }
      } else {
        $codePath = $encodedCodes -join "/"
        $pageStart = 1
        do {
          $pageEnd = $pageStart + $PageSize - 1
          $url = "https://ecos.bok.or.kr/api/StatisticSearch/$apiKey/json/kr/$pageStart/$pageEnd/$($query.statCode)/$($query.cycle)/$rangeStart/$rangeEnd/$codePath/"
          $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 60
          if ($response.RESULT.CODE) { throw "$($response.RESULT.CODE): $($response.RESULT.MESSAGE)" }
          foreach ($row in @($response.StatisticSearch.row)) {
            if ($row.TIME) { $rowMap[[string]$row.TIME] = [string]$row.DATA_VALUE }
          }
          $totalCount = [int]($response.StatisticSearch.list_total_count)
          $pageStart += $PageSize
        } while ($pageStart -le $totalCount)
      }
    }

    $compactRows = @($rowMap.GetEnumerator() | Sort-Object Name | ForEach-Object { ,@([string]$_.Name, [string]$_.Value) })
    $payload = [ordered]@{
      generatedAt = $generatedAt
      statCode = [string]$query.statCode
      itemCode = [string]$query.codes[0]
      queryCodes = @($query.codes)
      cycle = [string]$query.cycle
      rows = $compactRows
    }
    $filePath = Join-Path $OutputDir "$($query.fileBase).json"
    $json = $payload | ConvertTo-Json -Depth 5 -Compress
    [IO.File]::WriteAllText($filePath, $json, [Text.UTF8Encoding]::new($false))
    $fileCount++
    Write-Output "Generated $filePath ($($compactRows.Count) rows)"
}

$publishedFileCount = @(Get-ChildItem -LiteralPath $OutputDir -Filter '*.json' | Where-Object { $_.Name -ne 'manifest.json' }).Count
$manifest = [ordered]@{
  generatedAt = $generatedAt
  startDate = $StartDate
  endDate = $today.ToString("yyyyMMdd")
  fileCount = $publishedFileCount
  categories = @($series | ForEach-Object { [string]$_.id })
}
$manifestJson = $manifest | ConvertTo-Json -Compress
[IO.File]::WriteAllText((Join-Path $OutputDir 'manifest.json'), $manifestJson, [Text.UTF8Encoding]::new($false))
Write-Output "Published dataset contains $publishedFileCount ECOS data files."
