const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("💰 Withdrawing funds from Presale with account:", deployer.address);

    const PRESALE_ADDRESS = "0x761180A11665Ef96C6FcCD6d9e3E5349B9EA6Cd0";
    
    // Подключаемся к контракту
    const Presale = await hre.ethers.getContractFactory("Presale");
    const presale = Presale.attach(PRESALE_ADDRESS);

    // 1. Проверяем баланс ETH (деньги от продаж)
    const ethBalance = await hre.ethers.provider.getBalance(PRESALE_ADDRESS);
    console.log(`Contract ETH Balance: ${hre.ethers.formatEther(ethBalance)} ETH`);

    if (ethBalance > 0n) {
        console.log("Extracting ETH...");
        const tx = await presale.withdrawETH();
        await tx.wait();
        console.log("✅ ETH withdrawn to your wallet!");
    } else {
        console.log("No ETH to withdraw.");
    }

    // 2. Проверяем баланс Токенов (непроданные остатки)
    const tokenAddress = await presale.token();
    const Token = await hre.ethers.getContractFactory("MyToken");
    const token = Token.attach(tokenAddress);
    
    const tokenBalance = await token.balanceOf(PRESALE_ADDRESS);
    console.log(`Contract Token Balance: ${hre.ethers.formatUnits(tokenBalance, 18)} MTK`);

    if (tokenBalance > 0n) {
        console.log("Extracting Tokens...");
        const tx2 = await presale.withdrawTokens();
        await tx2.wait();
        console.log("✅ Tokens withdrawn to your wallet!");
    } else {
        console.log("No Tokens to withdraw.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
