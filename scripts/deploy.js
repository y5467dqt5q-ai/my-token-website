const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const token = await hre.ethers.deployContract("MyToken", [], {
    gasLimit: 3000000, // Устанавливаем лимит газа вручную, чтобы избежать ошибки оценки
  });

  await token.waitForDeployment();

  console.log("Token deployed to:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
