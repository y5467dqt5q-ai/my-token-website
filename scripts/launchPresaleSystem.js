const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("🚀 Starting Full Auto-Setup with account:", deployer.address);

    // CONFIG
    const TOKEN_ADDRESS = "0x17fa1ccE5F0caD23C0805EB854043AD506327763";
    
    // --- НАСТРОЙКА ЦЕНЫ ---
    // Цель: Позволить купить на $50,000.
    // Если 1 ETH = $3300. $50,000 = ~15.15 ETH.
    // Если мы хотим продать, например, 450,000 токенов за эти деньги.
    // 450,000 / 15.15 = ~29,700 токенов за 1 ETH.
    // Округлим до 30,000.
    // 1 ETH = 30,000 MTK.
    // Цена токена = $3300 / 30,000 = $0.11
    const RATE = 30000; 

    // 1. Deploy Presale
    console.log("\n1️⃣ Deploying Presale Contract...");
    const Presale = await hre.ethers.getContractFactory("Presale");
    const presale = await Presale.deploy(TOKEN_ADDRESS, RATE);
    console.log("   Tx Hash:", presale.deploymentTransaction().hash);
    console.log("   Waiting for confirmation...");
    
    await presale.waitForDeployment();
    const presaleAddress = await presale.getAddress();
    console.log("✅ Presale deployed at:", presaleAddress);

    // 2. Fund Presale with Tokens
    console.log("\n2️⃣ Funding Presale Contract...");
    const Token = await hre.ethers.getContractFactory("MyToken");
    const token = Token.attach(TOKEN_ADDRESS);
    
    // Check balance
    const balance = await token.balanceOf(deployer.address);
    console.log("   Your Balance:", hre.ethers.formatUnits(balance, 18), "MTK");

    if (balance <= 0n) {
        console.log("⚠️ No tokens to transfer! Skipping funding step.");
    } else {
        // Отправляем ВСЕ доступные токены на контракт продажи, чтобы хватило всем
        console.log(`   Sending ${hre.ethers.formatUnits(balance, 18)} MTK to presale...`);
        
        const tx = await token.transfer(presaleAddress, balance);
        await tx.wait();
        console.log("✅ Tokens transferred successfully!");
    }

    // 3. Update Website
    console.log("\n3️⃣ Updating Website (index.html)...");
    const htmlPath = path.join(__dirname, "../index.html");
    let htmlContent = fs.readFileSync(htmlPath, "utf8");

    // Replace Address
    htmlContent = htmlContent.replace(
        /const PRESALE_ADDRESS = ".*";/, 
        `const PRESALE_ADDRESS = "${presaleAddress}";`
    );

    // Replace Rate
    htmlContent = htmlContent.replace(
        /const RATE = \d+;/, 
        `const RATE = ${RATE};`
    );

    fs.writeFileSync(htmlPath, htmlContent);
    console.log("✅ index.html updated automatically!");

    console.log("\n🎉 ALL DONE! System is live.");
    console.log(`Presale Address: ${presaleAddress}`);
    console.log(`Rate: ${RATE} MTK per ETH`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
