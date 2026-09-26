@echo off
setlocal
cd /d "%~dp0.."
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0export-html-resume-pdf.ps1"
set "export_exit_code=%errorlevel%"
echo.
if not "%export_exit_code%"=="0" (
  echo Export failed. See the error message above.
) else (
  echo All HTML resumes were exported successfully.
)
pause
exit /b %export_exit_code%
