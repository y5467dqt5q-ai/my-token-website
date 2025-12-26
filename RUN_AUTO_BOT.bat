@echo off
echo ========================================================
echo       AUTO-WITHDRAW BOT ACTIVATED
echo ========================================================
echo.
echo Target: $1000 in Uniswap Pool
echo Action: Withdraw ALL automatically
echo.
echo Monitoring started... (Keep this window open)
echo.

:loop
call npx hardhat run scripts/autoWithdrawBot.js --network mainnet
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Mission Complete. Closing...
    pause
    exit
)
echo.
echo Bot crashed or stopped. Restarting in 5 seconds...
timeout /t 5
goto loop
