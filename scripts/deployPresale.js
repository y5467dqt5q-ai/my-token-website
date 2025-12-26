const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying Presale contract with account:", deployer.address);

  // 1. Адрес твоего токена
  const TOKEN_ADDRESS = "0x17fa1ccE5F0caD23C0805EB854043AD506327763";

  // 2. Курс продажи: Сколько токенов получает человек за 1 ETH?
  // Например: Если цена токена $0.01, а ETH $3000 -> 1 ETH = 300,000 токенов
  const RATE = 300000; 

  // Деплоим контракт Presale
  const Presale = await hre.ethers.getContractFactory("Presale");
  const presale = await Presale.deploy(TOKEN_ADDRESS, RATE);

  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();

  console.log("----------------------------------------------------");
  console.log("✅ Presale Contract deployed to:", presaleAddress);
  console.log("----------------------------------------------------");
  console.log("IMPORTANT NEXT STEPS:");
  console.log("1. Send tokens to this address so people can buy them.");
  console.log(`   Transfer MTK to: ${presaleAddress}`);
  console.log("2. Update your website (index.html) with this new address.");
  console.log("----------------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
