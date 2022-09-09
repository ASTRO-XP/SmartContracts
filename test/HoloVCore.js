const { utils, constants } = require("ethers");
const { expect } = require("chai");
const { keccak256 } = require("ethers/lib/utils");
let contract;
let owner;
let minter;
let pauser;
let mechanic;
let blacksmith;
let playerA;
let playerB;
let playerC;
const testURI = "N897N23FMINUHQN99CYN9238YNM2CM8Y1";
const tokenName = "Holo-V";
const tokenSymbol = "HOLOV";
const astroGateway = "https://gateway.io/ipfs/";
describe("HOLO-V", function () {
   this.beforeEach(async function () {
      [owner, minter, pauser, mechanic, blacksmith, playerA, playerB, playerC] =
         await ethers.getSigners();

      const HoloVCore = await ethers.getContractFactory("HoloVCore");
      const holoVCore = await HoloVCore.deploy(
         tokenName,
         tokenSymbol,
         astroGateway
      );
      contract = await holoVCore.deployed();

      await contract.grantRole(
         keccak256(utils.toUtf8Bytes("MINTER_ROLE")),
         minter.address
      );
      await contract.grantRole(
         keccak256(utils.toUtf8Bytes("PAUSER_ROLE")),
         pauser.address
      );
      await contract.grantRole(
         keccak256(utils.toUtf8Bytes("ASTRO_MECHANIC_ROLE")),
         mechanic.address
      );
      await contract.grantRole(
         keccak256(utils.toUtf8Bytes("ASTRO_BLACKSMITH_ROLE")),
         blacksmith.address
      );
   });

   describe("Deployment", function () {
      it("should have the right token name", async function () {
         expect(await contract.name()).to.equal(tokenName);
      });

      it("should have the right token symbol", async function () {
         expect(await contract.symbol()).to.equal(tokenSymbol);
      });

      it("should have the right base uri", async function () {
         expect(await contract.getAstroGateway()).to.equal(astroGateway);
      });

      it("should have the right owner", async function () {
         expect(
            await contract.hasRole(
               keccak256(utils.toUtf8Bytes("OWNER_ROLE")),
               owner.address
            )
         ).to.equal(true);
      });
      it("should prove owner has the right admin role", async function () {
         expect(
            await contract.getRoleAdmin(
               keccak256(utils.toUtf8Bytes("OWNER_ROLE"))
            )
         ).to.equal(keccak256(utils.toUtf8Bytes("OWNER_ROLE")));
      });
   });

   describe("Transactions", function () {
      it("should allow owner to grant role to an account", async function () {
         expect(
            await contract.hasRole(
               keccak256(utils.toUtf8Bytes("ASTRO_BLACKSMITH_ROLE")),
               playerC.address
            )
         ).to.equal(false);
         await contract.grantRole(
            keccak256(utils.toUtf8Bytes("ASTRO_BLACKSMITH_ROLE")),
            playerC.address
         );
         expect(
            await contract.hasRole(
               keccak256(utils.toUtf8Bytes("ASTRO_BLACKSMITH_ROLE")),
               playerC.address
            )
         ).to.equal(true);
      });
      it("should be able to transfer HOLOV from account A to account B", async function () {
         //call static to get return value
         const mintedID = await contract
            .connect(minter)
            .callStatic.holoProject(playerA.address, testURI);
         //call function for actual execution
         await contract.connect(minter).holoProject(playerA.address, testURI);
         expect(await contract.balanceOf(playerA.address)).to.equal("1");
         expect(await contract.balanceOf(playerB.address)).to.equal("0");
         await contract
            .connect(playerA)
            ["safeTransferFrom(address,address,uint256)"](
               playerA.address,
               playerB.address,
               mintedID
            );
         expect(await contract.balanceOf(playerA.address)).to.equal("0");
         expect(await contract.balanceOf(playerB.address)).to.equal("1");
      });
      it("should let playerA give approval to address B to send on their behalf to playerC", async function () {
         //call static to get return value
         const mintedID = await contract
            .connect(minter)
            .callStatic.holoProject(playerA.address, testURI);
         //call function for actual execution
         await contract.connect(minter).holoProject(playerA.address, testURI);
         expect(await contract.balanceOf(playerA.address)).to.equal("1");
         expect(await contract.balanceOf(playerB.address)).to.equal("0");
         expect(await contract.balanceOf(playerC.address)).to.equal("0");
         await contract.connect(playerA).approve(playerB.address, mintedID);
         await contract
            .connect(playerB)
            ["safeTransferFrom(address,address,uint256)"](
               playerA.address,
               playerC.address,
               mintedID
            );
         expect(await contract.balanceOf(playerA.address)).to.equal("0");
         expect(await contract.balanceOf(playerB.address)).to.equal("0");
         expect(await contract.balanceOf(playerC.address)).to.equal("1");
      });
      it("should properly increment tokenID counter", async function () {
         //static call
         const id1 = await contract
            .connect(minter)
            .callStatic.holoProject(playerA.address, testURI);
         expect(
            await contract
               .connect(minter)
               .callStatic.holoProject(playerA.address, testURI)
         ).to.equal("1");
         //actual
         expect(
            await contract.connect(minter).holoProject(playerA.address, testURI)
         );
         //static call
         const id2 = await contract
            .connect(minter)
            .callStatic.holoProject(playerB.address, "12jklasnd129b7d1289hljn");
         expect(
            await contract
               .connect(minter)
               .callStatic.holoProject(
                  playerB.address,
                  "12jklasnd129b7d1289hljn"
               )
         ).to.equal("2");
         //actual
         expect(
            await contract
               .connect(minter)
               .holoProject(playerB.address, "12jklasnd129b7d1289hljn")
         );
      });
      it("should allow minter to mint HOLOV to address A, B, and C", async function () {
         expect(await contract.balanceOf(playerA.address)).to.equal("0");
         expect(await contract.balanceOf(playerB.address)).to.equal("0");
         expect(await contract.balanceOf(playerC.address)).to.equal("0");
         await contract.connect(minter).holoProject(playerA.address, testURI);
         await contract
            .connect(minter)
            .holoProject(playerB.address, "123asdqw234343easd");
         await contract
            .connect(minter)
            .holoProject(playerC.address, "123asdqadasdgweasd");
         await contract
            .connect(minter)
            .holoProject(playerA.address, "123as25g234dqweasd");
         await contract
            .connect(minter)
            .holoProject(playerB.address, "123asdq2323gweasd");
         await contract
            .connect(minter)
            .holoProject(playerB.address, "asd1c4b12bb4534234");
         expect(await contract.balanceOf(playerA.address)).to.equal("2");
         expect(await contract.balanceOf(playerB.address)).to.equal("3");
         expect(await contract.balanceOf(playerC.address)).to.equal("1");
         expect(await contract.totalSupply()).to.equal("6");
      });
      it("should allow anyone to burn their HOLOV", async function () {
         expect(await contract.balanceOf(playerA.address)).to.equal("0");
         expect(await contract.balanceOf(playerB.address)).to.equal("0");
         expect(await contract.balanceOf(playerC.address)).to.equal("0");
         await contract.connect(minter).holoProject(playerA.address, testURI);
         await contract
            .connect(minter)
            .holoProject(playerB.address, "123asdqw234343easd");
         await contract
            .connect(minter)
            .holoProject(playerC.address, "123asdqadasdgweasd");
         await contract
            .connect(minter)
            .holoProject(playerA.address, "123as25g234dqweasd");
         await contract
            .connect(minter)
            .holoProject(playerB.address, "123asdq2323gweasd");
         await contract
            .connect(minter)
            .holoProject(playerB.address, "asd1c4b12bb4534234");
         expect(await contract.balanceOf(playerA.address)).to.equal("2");
         expect(await contract.balanceOf(playerB.address)).to.equal("3");
         expect(await contract.balanceOf(playerC.address)).to.equal("1");
         expect(await contract.totalSupply()).to.equal("6");
         await contract.connect(playerA).burn(1);
         await contract.connect(playerB).burn(2);
         await contract.connect(playerC).burn(3);
         expect(await contract.balanceOf(playerA.address)).to.equal("1");
         expect(await contract.balanceOf(playerB.address)).to.equal("2");
         expect(await contract.balanceOf(playerC.address)).to.equal("0");
         expect(await contract.totalSupply()).to.equal("3");
      });
      it("should allow app mechanic to enhance - called from app", async function () {
         const mintedID = await contract
            .connect(minter)
            .callStatic.holoProject(playerA.address, testURI);

         await contract.connect(minter).holoProject(playerA.address, testURI);

         expect(await contract.tokenURI(mintedID)).to.equal(
            (await contract.getAstroGateway()) + testURI
         );
         await contract
            .connect(mechanic)
            .upgradeHolov(
               playerA.address,
               mintedID,
               "new lazulith metadata ipfs cid"
            );
         expect(await contract.tokenURI(mintedID)).to.equal(
            (await contract.getAstroGateway()) +
               "new lazulith metadata ipfs cid"
         );
      });
      describe.only("Forging", async function () {
         it("should allow app blacksmith to forge - called from app - meta|NoVLX", async function () {
            //velox instantiation
            const Velox = await ethers.getContractFactory("Velox");
            const velox = await Velox.deploy();
            contractVelox = await velox.deployed();
            await contract.setVelox(contractVelox.address);
            await contractVelox.grantRole(
               keccak256(utils.toUtf8Bytes("AXP_SYS")),
               contract.address
            );
            //mint initial velox
            await contractVelox.mint(
               playerA.address,
               utils.parseEther("50000")
            );
            //test minted velox
            expect(await contractVelox.balanceOf(playerA.address)).to.equal(
               utils.parseEther("50000")
            );
            //static calls
            const mintedID1 = await contract
               .connect(minter)
               .callStatic.holoProject(playerA.address, testURI);
            //actual
            await contract
               .connect(minter)
               .holoProject(playerA.address, testURI);
            //static
            const mintedID2 = await contract
               .connect(minter)
               .callStatic.holoProject(
                  playerA.address,
                  "FND2UNUIjhbh8712893BHJDBJh"
               );
            //actual
            await contract
               .connect(minter)
               .holoProject(playerA.address, "FND2UNUIjhbh8712893BHJDBJh");

            expect(await contract.balanceOf(playerA.address)).to.equal("2");
            expect(await contract.totalSupply()).to.equal(2);
            await contract
               .connect(playerA)
               .setApprovalForAll(blacksmith.address, true);
            //forging
            //static
            const mintedID3 = await contract
               .connect(blacksmith)
               .callStatic.vForge(
                  mintedID1,
                  mintedID2,
                  playerA.address,
                  "new lazulith ipfs cid from game rng metadata factory",
                  0
               );
            //actual
            await contract
               .connect(blacksmith)
               .vForge(
                  mintedID1,
                  mintedID2,
                  playerA.address,
                  "new lazulith ipfs cid from game rng metadata factory",
                  0
               );
            expect(await contract.balanceOf(playerA.address)).to.equal("1");
            expect(await contract.totalSupply()).to.equal(1);
            expect(await contract.tokenURI(mintedID3)).to.equal(
               (await contract.getAstroGateway()) +
                  "new lazulith ipfs cid from game rng metadata factory"
            );
            expect(await contractVelox.balanceOf(playerA.address)).to.equal(
               utils.parseEther("50000")
            );
         });
         it("should allow app blacksmith to forge - called from app - non-meta|noVlx", async function () {
            //velox instantiation
            const Velox = await ethers.getContractFactory("Velox");
            const velox = await Velox.deploy();
            contractVelox = await velox.deployed();
            await contract.setVelox(contractVelox.address);
            await contractVelox.grantRole(
               keccak256(utils.toUtf8Bytes("AXP_SYS")),
               contract.address
            );
            //mint initial velox
            await contractVelox.mint(
               playerA.address,
               utils.parseEther("50000")
            );
            //test minted velox
            expect(await contractVelox.balanceOf(playerA.address)).to.equal(
               utils.parseEther("50000")
            );
            //static calls
            const mintedID1 = await contract
               .connect(minter)
               .callStatic.holoProject(playerA.address, testURI);
            //actual
            await contract
               .connect(minter)
               .holoProject(playerA.address, testURI);
            //static
            const mintedID2 = await contract
               .connect(minter)
               .callStatic.holoProject(
                  playerA.address,
                  "FND2UNUIjhbh8712893BHJDBJh"
               );
            //actual
            await contract
               .connect(minter)
               .holoProject(playerA.address, "FND2UNUIjhbh8712893BHJDBJh");

            expect(await contract.balanceOf(playerA.address)).to.equal("2");
            expect(await contract.totalSupply()).to.equal(2);
            await contract
               .connect(playerA)
               .setApprovalForAll(blacksmith.address, true);
            //forging
            //static
            // const mintedID3 = await contract
            //    .connect(blacksmith)
            //    .callStatic.vForge(mintedID1, mintedID2, playerA.address, "test", 56);
            //actual
            await contract
               .connect(blacksmith)
               .vForge(mintedID1, mintedID2, playerA.address, "", 0);
            expect(await contract.balanceOf(playerA.address)).to.equal("0");
            expect(await contract.totalSupply()).to.equal(0);
            // expect(mintedID3).to.equal(0);
            // expect(await contractVelox.balanceOf(playerA.address)).to.equal(
            //    utils.parseEther((50000 - 56).toString)
            // );
         });
         it("should allow app blacksmith to forge - called from app - meta|withVLX - for manual due to hardhat network bug", async function () {
            //velox instantiation
            const Velox = await ethers.getContractFactory("Velox");
            const velox = await Velox.deploy();
            contractVelox = await velox.deployed();
            await contract.setVelox(contractVelox.address);
            await contractVelox.grantRole(
               keccak256(utils.toUtf8Bytes("AXP_SYS")),
               contract.address
            );
            //mint initial velox
            await contractVelox.mint(
               playerA.address,
               utils.parseEther("50000")
            );
            //test minted velox
            expect(await contractVelox.balanceOf(playerA.address)).to.equal(
               utils.parseEther("50000")
            );
            //static calls
            const mintedID1 = await contract
               .connect(minter)
               .callStatic.holoProject(playerA.address, testURI);
            //actual
            await contract
               .connect(minter)
               .holoProject(playerA.address, testURI);
            //static
            const mintedID2 = await contract
               .connect(minter)
               .callStatic.holoProject(
                  playerA.address,
                  "FND2UNUIjhbh8712893BHJDBJh"
               );
            //actual
            await contract
               .connect(minter)
               .holoProject(playerA.address, "FND2UNUIjhbh8712893BHJDBJh");

            expect(await contract.balanceOf(playerA.address)).to.equal("2");
            expect(await contract.totalSupply()).to.equal(2);
            await contract
               .connect(playerA)
               .setApprovalForAll(blacksmith.address, true);
            //forging
            await contract
               .connect(blacksmith)
               .vForge(
                  mintedID1,
                  mintedID2,
                  playerA.address,
                  "new lazulith ipfs cid from game rng metadata factory",
                  256
               );
            expect(await contract.balanceOf(playerA.address)).to.equal("1");
            expect(await contract.totalSupply()).to.equal(1);
            expect(await contractVelox.balanceOf(playerA.address)).to.equal(
               utils.parseEther((50000 - 256).toString())
            );
         });
         it("should allow app blacksmith to forge - called from app - non-meta|withVlx - for manual due to hardhat network bug", async function () {
            //velox instantiation
            const Velox = await ethers.getContractFactory("Velox");
            const velox = await Velox.deploy();
            contractVelox = await velox.deployed();
            await contract.setVelox(contractVelox.address);
            await contractVelox.grantRole(
               keccak256(utils.toUtf8Bytes("AXP_SYS")),
               contract.address
            );
            //mint initial velox
            await contractVelox.mint(
               playerA.address,
               utils.parseEther("50000")
            );
            //test minted velox
            expect(await contractVelox.balanceOf(playerA.address)).to.equal(
               utils.parseEther("50000")
            );
            //static calls
            const mintedID1 = await contract
               .connect(minter)
               .callStatic.holoProject(playerA.address, testURI);
            //actual
            await contract
               .connect(minter)
               .holoProject(playerA.address, testURI);
            //static
            const mintedID2 = await contract
               .connect(minter)
               .callStatic.holoProject(
                  playerA.address,
                  "FND2UNUIjhbh8712893BHJDBJh"
               );
            //actual
            await contract
               .connect(minter)
               .holoProject(playerA.address, "FND2UNUIjhbh8712893BHJDBJh");

            expect(await contract.balanceOf(playerA.address)).to.equal("2");
            expect(await contract.totalSupply()).to.equal(2);
            await contract
               .connect(playerA)
               .setApprovalForAll(blacksmith.address, true);
            // commenting out below code for manual testing due to hardhat bug
            //forging
            //static
            // const mintedID3 = await contract
            //    .connect(blacksmith)
            //    .callStatic.vForge(mintedID1, mintedID2, playerA.address, "", 56);
            // //actual
            // await contract
            //    .connect(blacksmith)
            //    .vForge(mintedID1, mintedID2, playerA.address, "", 56);
            // expect(await contract.balanceOf(playerA.address)).to.equal("0");
            // expect(await contract.totalSupply()).to.equal(0);
            // expect(mintedID3).to.equal(0);
            // expect(await contractVelox.balanceOf(playerA.address)).to.equal(
            //    utils.parseEther((50000 - 56).toString)
            // );
         });
      });
   });

   describe("Access Control", function () {
      it("should not allow safe transfer from when no approval signed", async function () {
         //call static to get return value
         const mintedID = await contract
            .connect(minter)
            .callStatic.holoProject(playerA.address, testURI);
         //call function for actual execution
         await contract.connect(minter).holoProject(playerA.address, testURI);
         expect(await contract.balanceOf(playerA.address)).to.equal("1");
         expect(await contract.balanceOf(playerB.address)).to.equal("0");
         expect(await contract.balanceOf(playerC.address)).to.equal("0");
         // await contract.connect(playerA).approve(playerB.address, mintedID);
         await expect(
            contract
               .connect(playerB)
               ["safeTransferFrom(address,address,uint256)"](
                  playerA.address,
                  playerC.address,
                  mintedID
               )
         ).to.be.revertedWith("ERC721: caller is not token owner nor approved");
         expect(await contract.balanceOf(playerA.address)).to.equal("1");
         expect(await contract.balanceOf(playerB.address)).to.equal("0");
         expect(await contract.balanceOf(playerC.address)).to.equal("0");
      });
      it("should not be able to transfer token they do not own", async function () {
         //call static to get return value
         const mintedID = await contract
            .connect(minter)
            .callStatic.holoProject(playerA.address, testURI);
         //call function for actual execution
         await contract.connect(minter).holoProject(playerA.address, testURI);
         const mintedID2 = await contract
            .connect(minter)
            .callStatic.holoProject(playerC.address, "1asd1fnjk1");
         //call function for actual execution
         await contract
            .connect(minter)
            .holoProject(playerC.address, "1asd1fnjk1");

         expect(await contract.balanceOf(playerA.address)).to.equal("1");
         expect(await contract.balanceOf(playerB.address)).to.equal("0");
         await expect(
            contract
               .connect(playerA)
               ["safeTransferFrom(address,address,uint256)"](
                  playerA.address,
                  playerB.address,
                  2
               )
         ).to.be.revertedWith("ERC721: caller is not token owner nor approved");
      });
      it("should not be able to token that does not exist", async function () {
         //call static to get return value
         const mintedID = await contract
            .connect(minter)
            .callStatic.holoProject(playerA.address, testURI);
         //call function for actual execution
         await contract.connect(minter).holoProject(playerA.address, testURI);
         expect(await contract.balanceOf(playerA.address)).to.equal("1");
         expect(await contract.balanceOf(playerB.address)).to.equal("0");
         await expect(
            contract
               .connect(playerA)
               ["safeTransferFrom(address,address,uint256)"](
                  playerA.address,
                  playerB.address,
                  2
               )
         ).to.be.revertedWith("ERC721: invalid token ID");
         expect(await contract.balanceOf(playerA.address)).to.equal("1");
         expect(await contract.balanceOf(playerB.address)).to.equal("0");
      });
      it("should not allow to transfer to zero address", async function () {
         //call static to get return value
         const mintedID = await contract
            .connect(minter)
            .callStatic.holoProject(playerA.address, testURI);
         //call function for actual execution
         await contract.connect(minter).holoProject(playerA.address, testURI);
         expect(await contract.balanceOf(playerA.address)).to.equal("1");
         expect(await contract.balanceOf(playerB.address)).to.equal("0");
         await expect(
            contract
               .connect(playerA)
               ["safeTransferFrom(address,address,uint256)"](
                  playerA.address,
                  constants.AddressZero,
                  1
               )
         ).to.be.revertedWith("ERC721: transfer to the zero address");
         expect(await contract.balanceOf(playerA.address)).to.equal("1");
         expect(await contract.balanceOf(playerB.address)).to.equal("0");
      });
      it("should not allow anyone grant or revoke a role", async function () {
         await expect(
            contract
               .connect(playerA)
               .revokeRole(
                  keccak256(utils.toUtf8Bytes("ASTRO_BLACKSMITH_ROLE")),
                  blacksmith.address
               )
         ).to.be.revertedWith(
            "AccessControl: account " +
               playerA.address.toLowerCase() +
               " is missing role " +
               keccak256(utils.toUtf8Bytes("OWNER_ROLE"))
         );
      });
      it("should not allow to burn other address' HOLOV", async function () {
         await contract.connect(minter).holoProject(playerA.address, testURI);
         await expect(contract.connect(playerB).burn(1)).to.be.revertedWith(
            "ERC721: caller is not token owner nor approved"
         );
      });
      it("should not allow anyone to mint a token if not a minter", async function () {
         expect(await contract.balanceOf(playerA.address)).to.equal("0");
         await expect(
            contract.connect(playerA).holoProject(playerA.address, testURI)
         ).to.be.revertedWith("HOLOV: must be a minter to mint");
         expect(await contract.balanceOf(playerA.address)).to.equal("0");
         expect(await contract.totalSupply()).to.equal("0");
      });
      it("should not allow anyone to enhance if not the game(astroMechanic)", async function () {
         const mintedID = await contract
            .connect(minter)
            .callStatic.holoProject(playerA.address, testURI);

         await contract.connect(minter).holoProject(playerA.address, testURI);

         expect(await contract.tokenURI(mintedID)).to.equal(
            (await contract.getAstroGateway()) + testURI
         );
         await expect(
            contract
               .connect(playerB)
               .upgradeHolov(
                  playerA.address,
                  mintedID,
                  "new lazulith metadata ipfs cid"
               )
         ).to.be.revertedWith("HOLOV: must be an Astro Mechanic to Enhance");
         expect(await contract.tokenURI(mintedID)).to.equal(
            (await contract.getAstroGateway()) + testURI
         );
      });
      it("should not allow anyone to vForge if not the game(astroBlacksmith)", async function () {
         //velox instantiation
         const Velox = await ethers.getContractFactory("Velox");
         const velox = await Velox.deploy();
         contractVelox = await velox.deployed();
         await contract.setVelox(contractVelox.address);
         await contractVelox.grantRole(
            keccak256(utils.toUtf8Bytes("AXP_SYS")),
            contract.address
         );
         //mint initial velox
         await contractVelox.mint(playerA.address, utils.parseEther("50000"));
         //test minted velox
         expect(await contractVelox.balanceOf(playerA.address)).to.equal(
            utils.parseEther("50000")
         );
         //static calls
         const mintedID1 = await contract
            .connect(minter)
            .callStatic.holoProject(playerA.address, testURI);
         //actual
         await contract.connect(minter).holoProject(playerA.address, testURI);
         //static
         const mintedID2 = await contract
            .connect(minter)
            .callStatic.holoProject(
               playerA.address,
               "FND2UNUIjhbh8712893BHJDBJh"
            );
         //actual
         await contract
            .connect(minter)
            .holoProject(playerA.address, "FND2UNUIjhbh8712893BHJDBJh");

         expect(await contract.balanceOf(playerA.address)).to.equal("2");
         expect(await contract.totalSupply()).to.equal(2);
         await contract
            .connect(playerA)
            .setApprovalForAll(blacksmith.address, true);
         //forging
         //actual
         await expect(
            contract
               .connect(mechanic)
               .vForge(
                  mintedID1,
                  mintedID2,
                  playerA.address,
                  "new lazulith ipfs cid from game rng metadata factory",
                  0
               )
         ).to.be.revertedWith("HOLOV: must be an Astro Blacksmith to vForge");
         expect(await contract.balanceOf(playerA.address)).to.equal("2");
         expect(await contract.totalSupply()).to.equal(2);
         expect(await contractVelox.balanceOf(playerA.address)).to.equal(
            utils.parseEther("50000")
         );
      });
   });
});
