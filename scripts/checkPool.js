const hre = require("hardhat");

async function main() {
  const TOKEN_ADDRESS = "0x17fa1ccE5F0caD23C0805EB854043AD506327763"; // Твой токен
  const UNISWAP_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"; // Uniswap V2 Factory
  const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH Mainnet

  const factoryAbi = ["function getPair(address tokenA, address tokenB) external view returns (address pair)"];
  const pairAbi = [
    "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function token0() external view returns (address)",
    "function token1() external view returns (address)"
  ];

  const [deployer] = await hre.ethers.getSigners();
  const factory = new hre.ethers.Contract(UNISWAP_FACTORY, factoryAbi, deployer);

  console.log("Checking pool for token:", TOKEN_ADDRESS);
  const pairAddress = await factory.getPair(TOKEN_ADDRESS, WETH_ADDRESS);

  if (pairAddress === hre.ethers.ZeroAddress) {
    console.log("Pool does not exist yet.");
    return;
  }

  console.log("Pool address:", pairAddress);

  const pair = new hre.ethers.Contract(pairAddress, pairAbi, deployer);
  const reserves = await pair.getReserves();
  const token0 = await pair.token0();
  
  let reserveETH, reserveToken;

  if (token0.toLowerCase() === WETH_ADDRESS.toLowerCase()) {
    reserveETH = reserves.reserve0;
    reserveToken = reserves.reserve1;
  } else {
    reserveToken = reserves.reserve0;
    reserveETH = reserves.reserve1;
  }

  const ethInPool = hre.ethers.formatEther(reserveETH);
  const tokensInPool = hre.ethers.formatUnits(reserveToken, 18); // Assuming 18 decimals

  console.log(`\n--- Current Liquidity ---`);
  console.log(`ETH in pool: ${ethInPool} ETH`);
  console.log(`MTK in pool: ${tokensInPool} MTK`);

  const ethPrice = 3300; // Примерная цена ETH $3300
  const poolValueUsd = parseFloat(ethInPool) * ethPrice * 2;
  console.log(`Approx Pool Value: $${poolValueUsd.toFixed(2)}`);

  // Расчет для покупки на $50,000
  // Constant Product Formula: (x + dx)(y - dy) = xy
  // Price Impact depends on size of dx relative to x.
  // To keep slippage low (<10%), dx should be < 5% of x (roughly).
  // So if buy is $50k, Pool ETH (x) should be > $500k to have low slippage.
  // Or at least $100k for "high but possible" slippage.

  console.log(`\n--- Requirement for $50k Buy ---`);
  console.log(`To allow a $50k buy with reasonable slippage (e.g. 10-20%):`);
  console.log(`You need roughly $250,000+ USD worth of ETH in the pool.`);
  console.log(`That is about ${(250000/ethPrice).toFixed(1)} ETH.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
