param(
  [string]$AppUrl = "http://127.0.0.1:4173",
  [string]$DataFile = "data/Joan/data.json"
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path ".playwright-cli" | Out-Null

function Invoke-PlaywrightCli {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  if (Get-Command playwright-cli -ErrorAction SilentlyContinue) {
    & playwright-cli @Arguments
    return
  }

  & npx playwright-cli @Arguments
}

Write-Host "Opening $AppUrl with Playwright CLI..."
Invoke-PlaywrightCli -Arguments @("open", $AppUrl)
Invoke-PlaywrightCli -Arguments @("resize", "960", "1600")
Invoke-PlaywrightCli -Arguments @("snapshot", "--filename=.playwright-cli/verify-open.yaml")
$setInputScript = @"
async page => {
  await page.locator('[data-testid="file-input"]').setInputFiles('$DataFile');
  await page.locator('[data-testid="insights-tree"]').waitFor();
}
"@
Invoke-PlaywrightCli -Arguments @(
  "run-code",
  $setInputScript
)
Invoke-PlaywrightCli -Arguments @("snapshot", "--filename=.playwright-cli/verify-uploaded.yaml")
Invoke-PlaywrightCli -Arguments @("screenshot", "--filename=.playwright-cli/verify-uploaded.png", "--full-page")
Invoke-PlaywrightCli -Arguments @(
  "run-code",
  @"
async page => {
  const hasTree = await page.locator('[data-testid="insights-tree"]').count();
  const hasSuccess = await page.locator('[data-testid="success-state"]').count();

  if (!hasTree || !hasSuccess) {
    throw new Error('Playwright CLI did not detect the rendered insights tree.');
  }
}
"@
)

Invoke-PlaywrightCli -Arguments @("close")

Write-Host "Browser verification passed."
