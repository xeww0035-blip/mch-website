$ErrorActionPreference = 'SilentlyContinue'

$siteUrl = 'http://localhost:3001/'
$projectDirectory = 'C:\Users\mch\Documents\Codex\2026-08-10\codex-next-js-15-typescript-next\work\mch-website'
$npmExecutable = 'C:\Program Files\nodejs\npm.cmd'
$chromeExecutable = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$edgeExecutable = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

function Test-MchWebsite {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $siteUrl -TimeoutSec 1
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

if (-not (Test-MchWebsite)) {
  Start-Process `
    -FilePath $npmExecutable `
    -ArgumentList @('run', 'dev', '--', '--port', '3001') `
    -WorkingDirectory $projectDirectory `
    -WindowStyle Hidden

  for ($attempt = 0; $attempt -lt 40; $attempt += 1) {
    Start-Sleep -Milliseconds 500
    if (Test-MchWebsite) { break }
  }
}

if (Test-Path -LiteralPath $chromeExecutable) {
  Start-Process -FilePath $chromeExecutable -ArgumentList @('--new-window', $siteUrl)
} elseif (Test-Path -LiteralPath $edgeExecutable) {
  Start-Process -FilePath $edgeExecutable -ArgumentList @('--new-window', $siteUrl)
} else {
  Start-Process $siteUrl
}
