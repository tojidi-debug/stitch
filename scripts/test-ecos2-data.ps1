$ErrorActionPreference = "Stop"
$catalogPath = Join-Path $PSScriptRoot "ecos2-series.json"
$fetchPath = Join-Path $PSScriptRoot "fetch-ecos-data.ps1"
$planJson = & $fetchPath -SeriesFile $catalogPath -OutputDir "unused" -ValidateOnly
$plan = $planJson | ConvertFrom-Json

if (@($plan).Count -ne 11) { throw "Expected 11 published ECOS2 series, got $(@($plan).Count)." }

$required = @{
  "stock-kospi" = @("802Y001", "D", "0001000")
  "stock-kosdaq" = @("802Y001", "D", "0089000")
  "growth-korea" = @("902Y015", "Q", "KOR")
  "trade-export" = @("402Y014", "M", "*AA", "W")
  "trade-import" = @("401Y015", "M", "*AA", "W")
  "living-living" = @("901Y010", "M", "110")
  "living-fresh" = @("901Y010", "M", "10")
  "supply-total" = @("405Y006", "M", "*A")
  "supply-raw" = @("405Y006", "M", "100A")
  "supply-intermediate" = @("405Y006", "M", "200A")
  "supply-final" = @("405Y006", "M", "300A")
}

foreach ($entry in @($plan)) {
  $key = "$($entry.categoryId)-$($entry.itemId)"
  if (-not $required.ContainsKey($key)) { throw "Unexpected series $key." }
  $actual = @($entry.statCode, $entry.cycle) + @($entry.codes)
  if (($actual -join "|") -ne ($required[$key] -join "|")) {
    throw "Wrong query for ${key}: $($actual -join '|')."
  }
  $required.Remove($key)
}

if ($required.Count -ne 0) { throw "Missing series: $($required.Keys -join ', ')." }
Write-Output "ecos2 data tests passed"
