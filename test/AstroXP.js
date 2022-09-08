const { utils, constants } = require("ethers");
const { expect } = require("chai");
let contract;
const axpInitAmount = 100000000;
const axpTokenName = "Astro XP";
const axpTokenSymbol = "AXP";
let owner;
let addressA;
let addressB;
let addressC;
describe("AXP", function () {
   this.beforeEach(async function () {
      [owner, addressA, addressB, addressC] = await ethers.getSigners();

      const AstroXP = await ethers.getContractFactory("AstroXP");
      const astroXP = await AstroXP.deploy(axpInitAmount);
      contract = await astroXP.deployed();
   });
   describe("Deployment", async function () {
      it("Should have the right amount of tokens deployed", async function () {
         expect(await contract.totalSupply()).to.equal(
            utils.parseEther(axpInitAmount.toString())
         );
      });

      it("Should have the right token name", async function () {
         expect(await contract.name()).to.equal(axpTokenName);
      });

      it("Should have the right token symbol", async function () {
         expect(await contract.symbol()).to.equal(axpTokenSymbol);
      });
   });
   describe("Transactions", async function () {
      it("should let owner spread tokens to addressA and addressB using transfer()", async function () {
         await contract.transfer(addressA.address, utils.parseEther("500000"));
         await contract.transfer(addressB.address, utils.parseEther("600000"));
         expect(await contract.balanceOf(addressA.address)).to.equal(
            utils.parseEther("500000")
         );
         expect(await contract.balanceOf(addressB.address)).to.equal(
            utils.parseEther("600000")
         );
         expect(await contract.balanceOf(owner.address)).to.equal(
            utils.parseEther((axpInitAmount - 600000 - 500000).toString())
         );
      });
      it("should let addressA transfer funds to addressB", async function () {
         await contract.transfer(addressA.address, utils.parseEther("500000"));
         await contract
            .connect(addressA)
            .transfer(addressB.address, utils.parseEther("100050"));
         expect(await contract.balanceOf(addressA.address)).to.equal(
            utils.parseEther((500000 - 100050).toString())
         );
         expect(await contract.balanceOf(addressB.address)).to.equal(
            utils.parseEther("100050")
         );
      });
      it("should let addressA give approval to address B to send on their behalf to addressC", async function () {
         await contract.transfer(addressA.address, utils.parseEther("200000"));
         await contract
            .connect(addressA)
            .approve(addressB.address, utils.parseEther("100700"));
         await contract
            .connect(addressB)
            .transferFrom(
               addressA.address,
               addressC.address,
               utils.parseEther("100700")
            );

         expect(await contract.balanceOf(addressA.address)).to.equal(
            utils.parseEther((200000 - 100700).toString())
         );
         expect(await contract.balanceOf(addressC.address)).to.equal(
            utils.parseEther("100700")
         );
         expect(await contract.balanceOf(addressB.address)).to.equal(
            utils.parseEther("0")
         );
      });
   });
   describe("Access Control", async function () {
      it("should not allow transfer from when no approval signed", async function () {
         await contract.transfer(addressA.address, utils.parseEther("200000"));
         // addressB tries to use transferFrom without signature or approval from addressA
         await expect(
            contract
               .connect(addressB)
               .transferFrom(
                  addressA.address,
                  addressC.address,
                  utils.parseEther("100700")
               )
         ).to.be.revertedWith("ERC20: insufficient allowance");

         expect(await contract.balanceOf(addressA.address)).to.equal(
            utils.parseEther("200000")
         );
         expect(await contract.balanceOf(addressC.address)).to.equal(
            utils.parseEther("0")
         );
         expect(await contract.balanceOf(addressB.address)).to.equal(
            utils.parseEther("0")
         );
      });
      it("should not be able to transfer amount less that their remaining balance", async function () {
         await contract.transfer(addressA.address, utils.parseEther("200000"));
         await expect(
            contract
               .connect(addressA)
               .transfer(addressB.address, utils.parseEther("200001"))
         ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
         expect(await contract.balanceOf(addressA.address)).to.equal(
            utils.parseEther("200000")
         );
         expect(await contract.balanceOf(addressB.address)).to.equal(
            utils.parseEther("0")
         );
      });
      it("should not allow to transfer to zero address", async function () {
         await expect(
            contract.transfer(constants.AddressZero, utils.parseEther("150000"))
         ).to.be.revertedWith("ERC20: transfer to the zero address");
      });
   });
});
