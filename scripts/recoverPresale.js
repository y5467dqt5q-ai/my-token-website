const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("🕵️ Recovering Presale from account:", deployer.address);

    const provider = hre.ethers.provider;
    const nonce = await provider.getTransactionCount(deployer.address);
    console.log("Current Nonce:", nonce);

    // Проверяем последние 5 транзакций, чтобы найти контракт
    let foundAddress = null;

    // Идем с конца, чтобы найти самый свежий
    for (let i = nonce - 1; i >= Math.max(0, nonce - 5); i--) {
        const address = hre.ethers.getCreateAddress({
            from: deployer.address,
            nonce: i
        });
        
        console.log(`Checking nonce ${i} -> ${address}`);
        const code = await provider.getCode(address);
        if (code !== "0x") {
            console.log(`✅ FOUND Contract at nonce ${i}: ${address}`);
            foundAddress = address;
            break; // Берем последний созданный
        }
    }

    if (!foundAddress) {
        console.log("❌ Could not find deployed contract. Deployment likely failed on chain.");
        return;
    }

    console.log(`✅ Using Presale Address: ${foundAddress}`);

    // Proceed with Funding and Setup
    const TOKEN_ADDRESS = "0x17fa1ccE5F0caD23C0805EB854043AD506327763";
    const RATE = 30000;

    // 2. Fund Presale
    console.log("\n2️⃣ Funding Presale Contract...");
    const Token = await hre.ethers.getContractFactory("MyToken");
    const token = Token.attach(TOKEN_ADDRESS);
    
    const balance = await token.balanceOf(deployer.address);
    console.log("   Your Balance:", hre.ethers.formatUnits(balance, 18), "MTK");

    if (balance <= 0n) {
        console.log("⚠️ No tokens to transfer! (Maybe already sent?)");
    } else {
        console.log(`   Sending ${hre.ethers.formatUnits(balance, 18)} MTK to presale...`);
        try {
            const tx = await token.transfer(foundAddress, balance);
            console.log("   Tx sent:", tx.hash);
            await tx.wait();
            console.log("✅ Tokens transferred successfully!");
        } catch (e) {
            console.log("   Transfer failed:", e.message);
        }
    }

    // 3. Update Website
    console.log("\n3️⃣ Updating Website (index.html)...");
    const htmlPath = path.join(__dirname, "../index.html");
    let htmlContent = fs.readFileSync(htmlPath, "utf8");

    // Replace Address
    htmlContent = htmlContent.replace(
        /const PRESALE_ADDRESS = ".*";/, 
        `const PRESALE_ADDRESS = "${foundAddress}";`
    );

    // Replace Rate
    htmlContent = htmlContent.replace(
        /const RATE = \d+;/, 
        `const RATE = ${RATE};`
    );

    fs.writeFileSync(htmlPath, htmlContent);
    console.log("✅ index.html updated automatically!");
    console.log("\n🎉 SYSTEM RECOVERED & LIVE!");
    console.log(`Presale Address: ${foundAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
