const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  
  // Сообщение, которое просит подписать Etherscan.
  // ВНИМАНИЕ: Оно должно быть ТОЧНО таким же, до каждого пробела.
  const message = "[Etherscan.io 25/12/2025 22:57:46] I, hereby verify that I am the owner/creator of the address [0x17fa1ccE5F0caD23C0805EB854043AD506327763]";

  console.log("Signing message with account:", signer.address);
  console.log("Message:", message);

  const signature = await signer.signMessage(message);

  console.log("\n--- COPY THE SIGNATURE BELOW ---");
  console.log(signature);
  console.log("--------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
