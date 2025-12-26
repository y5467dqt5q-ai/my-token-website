const hre = require("hardhat");

async function main() {
  // --- НАСТРОЙКИ ---
  // Адрес твоего задеплоенного токена (вставь сюда после деплоя)
  const TOKEN_ADDRESS = "0x17fa1ccE5F0caD23C0805EB854043AD506327763";
  
  // Сколько токенов кладем в пул (500 000 - 50% от эмиссии)
  const TOKEN_AMOUNT = "500000"; 
  
  // Сколько ETH кладем в пул (0.002 ETH - оставляем остальное на газ)
  const ETH_AMOUNT = "0.002";

  // Адрес роутера Uniswap V2 (Mainnet & Sepolia имеют разные адреса!)
  // Это адрес для Ethereum Mainnet
  const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; 
  
  // -----------------

  const [deployer] = await hre.ethers.getSigners();
  console.log("Adding liquidity with account:", deployer.address);

  // 1. Подключаемся к токену
  const Token = await hre.ethers.getContractFactory("MyToken");
  const token = Token.attach(TOKEN_ADDRESS);

  // Конвертируем значения в правильный формат (wei)
  const tokenAmountWei = hre.ethers.parseUnits(TOKEN_AMOUNT, 18);
  const ethAmountWei = hre.ethers.parseEther(ETH_AMOUNT);
  
  // Получаем текущее время для deadline (транзакция должна пройти за 10 минут)
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  // 2. Одобряем роутеру тратить наши токены (Approve)
  console.log(`Approving ${TOKEN_AMOUNT} tokens for Uniswap Router...`);
  const approveTx = await token.approve(UNISWAP_ROUTER_ADDRESS, tokenAmountWei);
  await approveTx.wait();
  console.log("Approved!");

  // 3. Добавляем ликвидность
  // Интерфейс роутера Uniswap
  const routerAbi = [
    "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)"
  ];
  const router = new hre.ethers.Contract(UNISWAP_ROUTER_ADDRESS, routerAbi, deployer);

  console.log("Adding liquidity...");
  const tx = await router.addLiquidityETH(
    TOKEN_ADDRESS,
    tokenAmountWei,
    0, // amountTokenMin (принимаем любое кол-во, для теста ок, в проде лучше считать проскальзывание)
    0, // amountETHMin
    deployer.address,
    deadline,
    { value: ethAmountWei }
  );

  console.log("Transaction sent:", tx.hash);
  await tx.wait();
  
  console.log("Liquidity added successfully!");
  console.log(`Pool created! You can now trade on Uniswap.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
