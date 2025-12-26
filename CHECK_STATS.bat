@echo off
echo Checking Statistics...
call npx hardhat run scripts/checkStats.js --network mainnet
pause
