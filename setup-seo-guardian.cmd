@echo off
setlocal
cd /d "%~dp0"

echo [1/3] Updating package.json scripts...
node scripts\seo\setup-package.mjs
if errorlevel 1 goto :error

echo [2/3] Installing audit dependencies...
call npm.cmd install --save-dev @lhci/cli playwright
if errorlevel 1 goto :error

echo [3/3] Running the first local build...
call npm.cmd run build
if errorlevel 1 goto :error

echo.
echo Peste SEO Guardian setup completed successfully.
echo Local runtime audit will use Microsoft Edge on Windows.
echo GitHub Actions will install Chromium on its cloud runner.
exit /b 0

:error
echo.
echo Setup failed. Review the last error above.
exit /b 1
