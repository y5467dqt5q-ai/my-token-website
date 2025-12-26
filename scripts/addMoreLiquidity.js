const hre = require("hardhat");

async function main() {
  // --- НАСТРОЙКИ ---
  // Адрес твоего токена
  const TOKEN_ADDRESS = "0x17fa1ccE5F0caD23C0805EB854043AD506327763";
  
  // Сколько токенов ты хочешь добавить (например, 100 000)
  const TOKEN_AMOUNT_TO_ADD = "100000"; 
  
  // Сколько ETH ты хочешь добавить (должно соответствовать текущей цене!)
  // Если цена изменилась, скрипт сам вернет лишнее, но нужно иметь достаточно ETH.
  // Сейчас мы ставим примерное значение.
  const ETH_AMOUNT_TO_ADD = "0.01"; 

  const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; 
  // -----------------

  const [deployer] = await hre.ethers.getSigners();
  console.log("Adding MORE liquidity with account:", deployer.address);

  const Token = await hre.ethers.getContractFactory("MyToken");
  const token = Token.attach(TOKEN_ADDRESS);

  const tokenAmountWei = hre.ethers.parseUnits(TOKEN_AMOUNT_TO_ADD, 18);
  const ethAmountWei = hre.ethers.parseEther(ETH_AMOUNT_TO_ADD);
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 min

  // Проверяем баланс ETH
  const ethBalance = await hre.ethers.provider.getBalance(deployer.address);
  if (ethBalance < ethAmountWei) {
    console.error(`Ошибка: Недостаточно ETH. У тебя ${hre.ethers.formatEther(ethBalance)}, нужно ${ETH_AMOUNT_TO_ADD}`);
    return;
  }

  // Одобряем токены
  console.log(`Approving ${TOKEN_AMOUNT_TO_ADD} tokens...`);
  const approveTx = await token.approve(UNISWAP_ROUTER_ADDRESS, tokenAmountWei);
  await approveTx.wait();
  console.log("Approved!");

  // Добавляем
  const routerAbi = [
    "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)"
  ];
  const router = new hre.ethers.Contract(UNISWAP_ROUTER_ADDRESS, routerAbi, deployer);

  console.log("Adding liquidity to pool...");
  
  // Используем amountMin = 0 для простоты (владелец добавляет свою ликвидность)
  // В продакшене для больших сумм лучше вычислять slippage
  const tx = await router.addLiquidityETH(
    TOKEN_ADDRESS,
    tokenAmountWei,
    0, 
    0, 
    deployer.address,
    deadline,
    { value: ethAmountWei }
  );

  console.log("Transaction sent:", tx.hash);
  await tx.wait();
  console.log("Success! Liquidity added.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
