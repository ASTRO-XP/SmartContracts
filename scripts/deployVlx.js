const hre = require("hardhat");

async function main() {
   const Velox = await hre.ethers.getContractFactory("Velox");
   const velox = await Velox.deploy();

   await velox.deployed();

   console.log(`VLX Token deployed to ${velox.address}`);

   // await velox.deployTransaction.wait(4);

   // await hre.run("verify:verify", {
   //    address: velox.address,
   //    contract: "contracts/Velox.sol:Velox",
   //    constructorArguments: [],
   // });
}

main().catch((error) => {
   console.error(error);
   process.exitCode = 1;
});
