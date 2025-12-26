@echo off
setlocal
echo ========================================================
echo       GITHUB SITE UPDATER
echo ========================================================
echo.
echo This script will upload your latest changes to GitHub.
echo.

:: Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Git is not installed. Please install Git for Windows.
    pause
    exit /b
)

:: Initialize if needed
if not exist .git (
    echo Initializing Git repository...
    git init
    git branch -M main
)

:: Add all files
echo Adding files...
git add .
git commit -m "Update site: mobile support, marketing banner, presale config"

:: Check remote
git remote get-url origin >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo We need to link your GitHub repository.
    echo Please enter your GitHub Repository URL 
    echo (Example: https://github.com/YourName/your-repo.git)
    echo.
    set /p REPO_URL="Repository URL: "
    git remote add origin %REPO_URL%
) else (
    echo Repository already linked.
)

:: Push
echo.
echo Uploading to GitHub...
git push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SUCCESS! Your site is updating.
    echo Changes will be live in 1-2 minutes.
) else (
    echo.
    echo ❌ ERROR. Please check your internet or permissions.
)

pause
