const hre = require("hardhat");

async function main() {
  const TOKEN_ADDRESS = "0x17fa1ccE5F0caD23C0805EB854043AD506327763";
  const [deployer] = await hre.ethers.getSigners();
  console.log("Account:", deployer.address);

  const Token = await hre.ethers.getContractFactory("MyToken");
  const token = Token.attach(TOKEN_ADDRESS);

  const owner = await token.owner();
  console.log("Contract Owner:", owner);

  const balance = await token.balanceOf(deployer.address);
  console.log("My Balance:", hre.ethers.formatUnits(balance, 18));

  const totalSupply = await token.totalSupply();
  console.log("Total Supply:", hre.ethers.formatUnits(totalSupply, 18));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
