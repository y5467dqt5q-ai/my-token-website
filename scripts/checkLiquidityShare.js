const hre = require("hardhat");

async function main() {
  const TOKEN_ADDRESS = "0x17fa1ccE5F0caD23C0805EB854043AD506327763";
  const UNISWAP_FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

  const [deployer] = await hre.ethers.getSigners();
  console.log("Checking liquidity share for:", deployer.address);

  // 1. Get Pair Address
  const factoryAbi = ["function getPair(address tokenA, address tokenB) external view returns (address pair)"];
  const factory = new hre.ethers.Contract(UNISWAP_FACTORY_ADDRESS, factoryAbi, deployer);
  const pairAddress = await factory.getPair(TOKEN_ADDRESS, WETH_ADDRESS);

  if (pairAddress === hre.ethers.ZeroAddress) {
      console.log("Pool does not exist yet.");
      return;
  }
  console.log("Pool Address:", pairAddress);

  // 2. Get Total Supply of LP tokens and User Balance
  const pairAbi = [
      "function totalSupply() external view returns (uint)",
      "function balanceOf(address owner) external view returns (uint)",
      "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
      "function token0() external view returns (address)"
  ];
  const pair = new hre.ethers.Contract(pairAddress, pairAbi, deployer);

  const totalSupply = await pair.totalSupply();
  const userBalance = await pair.balanceOf(deployer.address);

  // 3. Calculate Share
  const share = (Number(userBalance) * 100) / Number(totalSupply);

  console.log("------------------------------------------------");
  console.log(`Total LP Tokens: ${hre.ethers.formatUnits(totalSupply, 18)}`);
  console.log(`Your LP Tokens:  ${hre.ethers.formatUnits(userBalance, 18)}`);
  console.log(`Your Share:      ${share.toFixed(4)}%`);
  console.log("------------------------------------------------");

  if (share > 99.9) {
      console.log("✅ You own 100% of the pool.");
  } else {
      console.log("⚠️ Someone else has added liquidity!");
  }
  
  // Optional: Check Reserves (Value in pool)
  const reserves = await pair.getReserves();
  const token0 = await pair.token0();
  // We don't know if token0 is MTK or WETH without checking, but reserves show amounts
  console.log("Pool Reserves (Raw):", reserves[0].toString(), reserves[1].toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
