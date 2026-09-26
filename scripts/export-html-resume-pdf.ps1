[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string[]]$InputPath,

    [string]$OutputPath,

    [ValidateRange(0, 999)]
    [int]$ExpectedPages = 0,

    [string]$BrowserPath,

    [switch]$NoPageCheck
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$runtimeRoot = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime"
$nodeExe = Join-Path $runtimeRoot "dependencies\node\bin\node.exe"
$playwrightModule = Join-Path $runtimeRoot "dependencies\node\node_modules\playwright"
$pdfInfoExe = Join-Path $runtimeRoot "dependencies\native\poppler\Library\bin\pdfinfo.exe"
$driver = Join-Path $PSScriptRoot "export-html-resume-pdf.cjs"

if (-not (Test-Path -LiteralPath $nodeExe -PathType Leaf)) {
    throw "未找到 Codex 自带的 Node.js：$nodeExe`n本脚本要求电脑上已安装 Codex，并至少用 Codex 打开本项目一次，以完成本地运行环境初始化。`n如果不用脚本，可以在浏览器中打开简历并按 Ctrl+P 手动导出 PDF。"
}
if (-not (Test-Path -LiteralPath $playwrightModule -PathType Container)) {
    throw "未找到 Codex 自带的 Playwright：$playwrightModule`n本脚本要求电脑上已安装 Codex，并至少用 Codex 打开本项目一次，以完成本地运行环境初始化。`n如果不用脚本，可以在浏览器中打开简历并按 Ctrl+P 手动导出 PDF。"
}
if (-not (Test-Path -LiteralPath $driver -PathType Leaf)) {
    throw "缺少导出驱动文件：$driver"
}

if ([string]::IsNullOrWhiteSpace($BrowserPath)) {
    $browserCandidates = @(
        (Join-Path ${env:ProgramFiles(x86)} "Microsoft\Edge\Application\msedge.exe"),
        (Join-Path $env:ProgramFiles "Microsoft\Edge\Application\msedge.exe"),
        (Join-Path $env:LOCALAPPDATA "Microsoft\Edge\Application\msedge.exe")
    )
    $BrowserPath = $browserCandidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
}
elseif (-not [IO.Path]::IsPathRooted($BrowserPath)) {
    $BrowserPath = [IO.Path]::GetFullPath((Join-Path (Get-Location) $BrowserPath))
}

if ([string]::IsNullOrWhiteSpace($BrowserPath) -or -not (Test-Path -LiteralPath $BrowserPath -PathType Leaf)) {
    throw "未找到 Microsoft Edge。可使用 -BrowserPath 显式指定 msedge.exe。"
}

$resolvedInputs = @()
foreach ($item in @($InputPath)) {
    if ([string]::IsNullOrWhiteSpace($item)) { continue }
    $resolvedInputs += (Resolve-Path -LiteralPath $item).Path
}

if (-not [string]::IsNullOrWhiteSpace($OutputPath)) {
    if ($resolvedInputs.Count -ne 1) {
        throw "-OutputPath 只能与一个 -InputPath 同时使用。"
    }
    if (-not [IO.Path]::IsPathRooted($OutputPath)) {
        $OutputPath = [IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputPath))
    }
}

$env:CODEX_PLAYWRIGHT_MODULE = $playwrightModule
$env:RESUME_BROWSER_PATH = $BrowserPath
$env:PDFINFO_PATH = if (Test-Path -LiteralPath $pdfInfoExe -PathType Leaf) { $pdfInfoExe } else { "" }

$arguments = @($driver)
if ($resolvedInputs.Count -eq 0) {
    $arguments += @("--scan-root", (Join-Path $repoRoot "output\HTMLOutput"))
}
else {
    foreach ($item in $resolvedInputs) {
        $arguments += @("--input", $item)
    }
}
if (-not [string]::IsNullOrWhiteSpace($OutputPath)) {
    $arguments += @("--output", $OutputPath)
}
if ($ExpectedPages -gt 0) {
    $arguments += @("--expected-pages", $ExpectedPages.ToString())
}
if ($NoPageCheck) {
    $arguments += "--no-page-check"
}

Write-Host "使用浏览器：$BrowserPath"
Write-Host "使用 Codex Playwright：$playwrightModule"
& $nodeExe @arguments

if ($LASTEXITCODE -ne 0) {
    throw "PDF 导出或页数检查失败，退出码：$LASTEXITCODE"
}
