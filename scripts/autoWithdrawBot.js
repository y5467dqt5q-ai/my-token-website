const hre = require("hardhat");
const { ethers } = require("hardhat");
const readline = require('readline');

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("🕵️ STARTED: Liquidity Watcher & Manual Withdraw System");
    console.log("-----------------------------------------------------");
    console.log("Monitoring pool with account:", deployer.address);
    console.log("\n⚠️  INSTRUCTIONS:");
    console.log("1. The bot will show the pool balance every 10 seconds.");
    console.log("2. When you are ready to sell, PRESS [ENTER] key.");
    console.log("3. The bot will immediately withdraw 100% of liquidity.");
    console.log("-----------------------------------------------------\n");

    // CONFIGURATION
    const CHECK_INTERVAL_MS = 10000; // Проверять каждые 10 секунд
    const TOKEN_ADDRESS = "0x17fa1ccE5F0caD23C0805EB854043AD506327763";
    const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; 
    const UNISWAP_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    const UNISWAP_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    // Contract Interfaces
    const ROUTER_ABI = [
        "function removeLiquidityETH(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external returns (uint amountToken, uint amountETH)"
    ];
    const FACTORY_ABI = [
        "function getPair(address tokenA, address tokenB) external view returns (address pair)"
    ];
    const ERC20_ABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function approve(address spender, uint256 value) returns (bool)"
    ];

    const router = await ethers.getContractAt(ROUTER_ABI, UNISWAP_ROUTER);
    const factory = await ethers.getContractAt(FACTORY_ABI, UNISWAP_FACTORY);
    const pairAddress = await factory.getPair(TOKEN_ADDRESS, WETH_ADDRESS);
    
    console.log("Target Pool Address:", pairAddress);
    const pair = await ethers.getContractAt(ERC20_ABI, pairAddress);
    
    const ETH_PRICE_USD = 3300; 

    // Setup Manual Trigger
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let isWithdrawing = false;
    let confirmationPending = false;

    const withdrawAll = async () => {
        if (isWithdrawing) return;
        isWithdrawing = true;
        console.log("\n🚨 TRIGGERED! INITIATING WITHDRAWAL... 🚨");
        
        try {
            // 2. Withdraw Everything
            const lpBalance = await pair.balanceOf(deployer.address);
            if (lpBalance == 0n) {
                console.log("❌ Error: No LP tokens found on your wallet. Cannot withdraw.");
                process.exit(1);
            }

            console.log("Approving router...");
            await (await pair.approve(UNISWAP_ROUTER, lpBalance)).wait();

            console.log("Removing Liquidity...");
            const deadline = Math.floor(Date.now() / 1000) + 60 * 5;
            const tx = await router.removeLiquidityETH(
                TOKEN_ADDRESS,
                lpBalance,
                0, 0,
                deployer.address,
                deadline
            );

            console.log("✅ SUCCESS! Transaction hash:", tx.hash);
            console.log("Waiting for confirmation...");
            await tx.wait();
            console.log("💰 Money secured in your wallet.");
            process.exit(0);
        } catch (error) {
            console.error("❌ Withdrawal Failed:", error);
            process.exit(1);
        }
    };

    rl.on('line', () => {
        withdrawAll();
    });

    // Monitoring Loop
    while (true) {
        if (isWithdrawing) break; // Stop loop if triggered

        try {
            // 1. Check Pool Balance
            const wethToken = await ethers.getContractAt(ERC20_ABI, WETH_ADDRESS);
            const wethBalance = await wethToken.balanceOf(pairAddress);
            const ethInPool = parseFloat(ethers.formatEther(wethBalance));
            
            const valueInUsd = ethInPool * ETH_PRICE_USD;

            const timestamp = new Date().toLocaleTimeString();
            console.log(`[${timestamp}] Pool ETH: ${ethInPool.toFixed(4)} ($${valueInUsd.toFixed(2)}) | Press [ENTER] to withdraw`);

        } catch (error) {
            console.error("Error in loop:", error.message);
        }

        // Wait before next check
        await new Promise(r => setTimeout(r, CHECK_INTERVAL_MS));
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
