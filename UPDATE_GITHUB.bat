@echo off
setlocal
echo ========================================================
echo       GITHUB SITE UPDATER
echo ========================================================
echo.
echo Uploading changes to: https://github.com/y5467dqt5q-ai/my-token-website
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

:: Set Remote
echo Setting remote repository...
git remote remove origin >nul 2>nul
git remote add origin https://github.com/y5467dqt5q-ai/my-token-website.git

:: Push
echo.
echo Uploading to GitHub...
echo (A window may open asking you to sign in to GitHub)
git push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SUCCESS! Your site is updating.
    echo Changes will be live in 1-2 minutes at:
    echo https://y5467dqt5q-ai.github.io/my-token-website/
) else (
    echo.
    echo ❌ ERROR. Could not upload.
    echo NOTE: If you are signed in as 'Roman-tarasovv', please sign out or switch to 'y5467dqt5q-ai'.
)

pause
