@echo off
echo ========================================================
echo !!! WARNING: EMERGENCY WITHDRAWAL SYSTEM !!!
echo ========================================================
echo.
echo This will withdraw EVERYTHING from everywhere:
echo 1. Remove Liquidity from Uniswap (ETH + Tokens)
echo 2. Withdraw ETH (Profits) from Presale Contract
echo 3. Withdraw Unsold Tokens from Presale Contract
echo.
echo ALL FUNDS WILL BE SENT TO YOUR WALLET.
echo.
echo Press any key to CONTINUE or close this window to CANCEL.
pause

echo.
echo -------------------------------------
echo STEP 1: Removing Liquidity from Uniswap...
echo -------------------------------------
call npx hardhat run scripts/removeLiquidity.js --network mainnet

echo.
echo -------------------------------------
echo STEP 2: Withdrawing Funds from Presale...
echo -------------------------------------
call npx hardhat run scripts/withdrawPresale.js --network mainnet

echo.
echo ========================================================
echo ✅ ALL OPERATIONS COMPLETED. CHECK YOUR WALLET.
echo ========================================================
pause
