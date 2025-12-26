const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("📊 CALCULATING PROJECT STATISTICS...");
    console.log("-----------------------------------------------------");

    // ADRESSES
    const PRESALE_ADDRESS = "0x761180A11665Ef96C6FcCD6d9e3E5349B9EA6Cd0";
    const TOKEN_ADDRESS = "0x17fa1ccE5F0caD23C0805EB854043AD506327763";
    const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const UNISWAP_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

    // 1. PRESALE STATS (Direct Sales)
    const ethBalancePresale = await ethers.provider.getBalance(PRESALE_ADDRESS);
    const ethPresale = parseFloat(ethers.formatEther(ethBalancePresale));

    // 2. UNISWAP STATS (Trading Pool)
    const factory = await ethers.getContractAt(["function getPair(address,address) view returns (address)"], UNISWAP_FACTORY);
    const pairAddress = await factory.getPair(TOKEN_ADDRESS, WETH_ADDRESS);
    
    const weth = await ethers.getContractAt(["function balanceOf(address) view returns (uint256)"], WETH_ADDRESS);
    const wethBalancePool = await weth.balanceOf(pairAddress);
    const ethPool = parseFloat(ethers.formatEther(wethBalancePool));

    // Approximate Price (Static for display, or could fetch)
    const ETH_PRICE = 3300; 

    console.log(`\n💰 SOURCE 1: PRESALE (Direct Buys)`);
    console.log(`   ETH Collected:  ${ethPresale.toFixed(4)} ETH`);
    console.log(`   USD Value:      $${(ethPresale * ETH_PRICE).toFixed(2)}`);

    console.log(`\n🦄 SOURCE 2: UNISWAP (Liquidity Pool)`);
    console.log(`   ETH in Pool:    ${ethPool.toFixed(4)} ETH`);
    console.log(`   USD Value:      $${(ethPool * ETH_PRICE).toFixed(2)}`);

    console.log(`\n=====================================================`);
    console.log(`💵 TOTAL LIQUID ASSETS (Available to Withdraw):`);
    console.log(`   ${(ethPresale + ethPool).toFixed(4)} ETH  (~ $${((ethPresale + ethPool) * ETH_PRICE).toFixed(2)})`);
    console.log(`=====================================================`);

    console.log("\nNOTE: Real trading volume (turnover 24h) is best viewed on DexScreener.");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
