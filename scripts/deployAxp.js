const hre = require("hardhat");

async function main() {
   const conArgs = 100000000;
   const AstroXP = await hre.ethers.getContractFactory("AstroXP");
   const astroXP = await AstroXP.deploy(conArgs);

   await astroXP.deployed();

   console.log(`AXP Token deployed to ${astroXP.address}`);
   console.log(`Token Constructor Arguments ${conArgs}`);

   await astroXP.deployTransaction.wait(4);

   await hre.run("verify:verify", {
      address: astroXP.address,
      contract: "contracts/AstroXP.sol:AstroXP",
      constructorArguments: [conArgs],
   });
}

main().catch((error) => {
   console.error(error);
   process.exitCode = 1;
});
