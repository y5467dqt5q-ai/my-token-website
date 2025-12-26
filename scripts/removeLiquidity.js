const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Removing liquidity with account:", deployer.address);

    // Адреса
    const TOKEN_ADDRESS = "0x17fa1ccE5F0caD23C0805EB854043AD506327763"; // Твой токен
    const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const UNISWAP_FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // Mainnet WETH

    // 1. Находим адрес пула (пары)
    const factory = await ethers.getContractAt("IUniswapV2Factory", UNISWAP_FACTORY_ADDRESS);
    const pairAddress = await factory.getPair(TOKEN_ADDRESS, WETH_ADDRESS);
    
    console.log("Liquidity Pool Address:", pairAddress);

    // 2. Проверяем баланс LP-токенов у нас
    const pair = await ethers.getContractAt("IERC20", pairAddress);
    const lpBalance = await pair.balanceOf(deployer.address);
    
    console.log("Your LP Token Balance:", ethers.formatEther(lpBalance));

    if (lpBalance == 0) {
        console.log("No liquidity to remove!");
        return;
    }

    // 3. Одобряем Router'у забрать наши LP-токены
    console.log("Approving LP tokens...");
    const approveTx = await pair.approve(UNISWAP_ROUTER_ADDRESS, lpBalance);
    await approveTx.wait();
    console.log("Approved!");

    // 4. Удаляем ликвидность (забираем ETH и MTK обратно)
    const router = await ethers.getContractAt("IUniswapV2Router02", UNISWAP_ROUTER_ADDRESS);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 минут

    console.log("Removing ALL liquidity...");
    
    const tx = await router.removeLiquidityETH(
        TOKEN_ADDRESS,
        lpBalance,     // Сколько LP токенов сжигаем (все)
        0,             // Миним. кол-во токенов (0 = принять любые)
        0,             // Миним. кол-во ETH (0 = принять любые)
        deployer.address,
        deadline
    );

    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    
    console.log("Liquidity removed! ETH and Tokens returned to your wallet.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
