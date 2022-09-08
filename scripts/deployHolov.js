const hre = require("hardhat");

async function main() {
   const arg1 = "Holo-V";
   const arg2 = "HOLOV";
   const arg3 = "https://gateway.io/ipfs/";
   const HoloVCore = await hre.ethers.getContractFactory("HoloVCore");
   const holoVCore = await HoloVCore.deploy(arg1, arg2, arg3);

   await holoVCore.deployed();

   console.log(
      `HOLOV NFT deployed to ${holoVCore.address} `,
      "constructor arguments: ",
      arg1,
      arg2,
      arg3
   );
   // await holoVCore.deployTransaction.wait(4);

   // await hre.run("verify:verify", {
   //    address: holoVCore.address,
   //    contract: "contracts/HoloVCore.sol:HoloVCore",
   //    constructorArguments: [arg1, arg2, arg3],
   // });
}

main().catch((error) => {
   console.error(error);
   process.exitCode = 1;
});
