const { utils, constants } = require('ethers')
const { expect } = require('chai')
const { keccak256 } = require('ethers/lib/utils')
let contract
let owner
let addressA
let addressB
let addressC
let holovCore
const vlxTokenName = 'Velox'
const vlxTokenSymbol = 'VLX'
describe('VLX', function () {
  this.beforeEach(async function () {
    ;[
      owner,
      addressA,
      addressB,
      addressC,
      holovCore,
    ] = await ethers.getSigners()

    const Velox = await ethers.getContractFactory('Velox')
    const velox = await Velox.deploy()
    contract = await velox.deployed()
  })

  describe('Deployment', function () {
    it('should have the right token name', async function () {
      expect(await contract.name()).to.equal(vlxTokenName)
    })

    it('should have the right token symbol', async function () {
      expect(await contract.symbol()).to.equal(vlxTokenSymbol)
    })

    it('should have the right owner', async function () {
      expect(
        await contract.hasRole(
          keccak256(utils.toUtf8Bytes('OWNER_ROLE')),
          owner.address,
        ),
      ).to.equal(true)
    })
    it('should prove that owner has the MINTER_BURNER_ROLE', async function () {
      expect(
        await contract.hasRole(
          keccak256(utils.toUtf8Bytes('MINTER_BURNER_ROLE')),
          owner.address,
        ),
      ).to.equal(true)
    })
    it('should have the right decimals (zero | 0)', async function () {
      expect(await contract.decimals()).to.equal(0)
    })
  })

  describe('Transactions', function () {
    it('should be able to transfer VLX from account A to account B', async function () {
      await contract.mint(addressA.address, utils.parseEther('50000'))
      await contract
        .connect(addressA)
        .transfer(addressB.address, utils.parseEther('10000'))
      expect(await contract.balanceOf(addressA.address)).to.equal(
        utils.parseEther((50000 - 10000).toString()),
      )
      expect(await contract.balanceOf(addressB.address)).to.equal(
        utils.parseEther('10000'),
      )
    })
    it('should let addressA give approval to address B to send on their behalf to addressC', async function () {
      await contract.mint(addressA.address, utils.parseEther('200000'))
      await contract
        .connect(addressA)
        .approve(addressB.address, utils.parseEther('100700'))
      await contract
        .connect(addressB)
        .transferFrom(
          addressA.address,
          addressC.address,
          utils.parseEther('100700'),
        )

      expect(await contract.balanceOf(addressA.address)).to.equal(
        utils.parseEther((200000 - 100700).toString()),
      )
      expect(await contract.balanceOf(addressC.address)).to.equal(
        utils.parseEther('100700'),
      )
      expect(await contract.balanceOf(addressB.address)).to.equal(
        utils.parseEther('0'),
      )
    })
    it('should allow owner (as minter) to mint VLX to address A, B, and C', async function () {
      await contract.mint(addressA.address, utils.parseEther('200000'))
      await contract.mint(addressB.address, utils.parseEther('300000'))
      await contract.mint(addressC.address, utils.parseEther('400000'))

      expect(await contract.balanceOf(addressA.address)).to.equal(
        utils.parseEther('200000'),
      )
      expect(await contract.balanceOf(addressB.address)).to.equal(
        utils.parseEther('300000'),
      )
      expect(await contract.balanceOf(addressC.address)).to.equal(
        utils.parseEther('400000'),
      )
      expect(await contract.totalSupply()).to.equal(
        utils.parseEther((200000 + 300000 + 400000).toString()),
      )
    })
    it('should allow anyone to burn their VLX', async function () {
      await contract.mint(owner.address, utils.parseEther('100000'))
      await contract.mint(addressA.address, utils.parseEther('200000'))
      await contract.mint(addressB.address, utils.parseEther('300000'))
      await contract.mint(addressC.address, utils.parseEther('400000'))

      expect(await contract.totalSupply()).to.equal(
        utils.parseEther((100000 + 200000 + 300000 + 400000).toString()),
      )

      await contract.connect(owner).burn(utils.parseEther('500'))
      await contract.connect(addressA).burn(utils.parseEther('1000'))
      await contract.connect(addressB).burn(utils.parseEther('1500'))
      await contract.connect(addressC).burn(utils.parseEther('11500'))

      expect(await contract.balanceOf(owner.address)).to.equal(
        utils.parseEther((100000 - 500).toString()),
      )
      expect(await contract.balanceOf(addressA.address)).to.equal(
        utils.parseEther((200000 - 1000).toString()),
      )
      expect(await contract.balanceOf(addressB.address)).to.equal(
        utils.parseEther((300000 - 1500).toString()),
      )
      expect(await contract.balanceOf(addressC.address)).to.equal(
        utils.parseEther((400000 - 11500).toString()),
      )

      expect(await contract.totalSupply()).to.equal(
        utils.parseEther(
          (
            100000 +
            200000 +
            300000 +
            400000 -
            (500 + 1000 + 1500 + 11500)
          ).toString(),
        ),
      )
    })
    it('should allow owner to add signers to whitelist addresses', async function () {
      await contract.addSigner(addressA.address)
      expect(await contract.signers(addressA.address)).to.equal(true)
    })
    it('should allow owner to remove signiers in the signers mapping', async function () {
      await contract.addSigner(addressA.address)
      expect(await contract.signers(addressA.address)).to.equal(true)
      await contract.removeSigner(addressA.address)
      expect(await contract.signers(addressA.address)).to.equal(false)
    })
    it('should allow any verified signature to claim-mint VLX - manual', async function () {
      await contract.addSigner(addressA.address)
      const txId = '2'
      const amount = 1
      await expect(
        contract.claim(
          addressA.address, //valid address manually added in signers
          txId, //transaction manually added to claimTransactions mapping
          amount, //valid amount
          120, //dummy param v
          keccak256(utils.toUtf8Bytes('Test123')), //dummy param r
          keccak256(utils.toUtf8Bytes('456789z')), //dummy param s
        ),
      ).to.be.revertedWith('Velox: Signer is not valid') //bypass and manual mint
      await contract.mint(addressA.address, utils.parseEther(amount.toString()))
      expect(await contract.balanceOf(addressA.address)).to.equal(
        utils.parseEther(amount.toString()),
      )
    })
  })

  describe('Access Control', function () {
    it('should not allow transfer from when no approval signed', async function () {
      await contract.mint(addressA.address, utils.parseEther('200000'))
      // addressB tries to use transferFrom without signature or approval from addressA
      await expect(
        contract
          .connect(addressB)
          .transferFrom(
            addressA.address,
            addressC.address,
            utils.parseEther('100700'),
          ),
      ).to.be.revertedWith('ERC20: insufficient allowance')

      expect(await contract.balanceOf(addressA.address)).to.equal(
        utils.parseEther('200000'),
      )
      expect(await contract.balanceOf(addressC.address)).to.equal(
        utils.parseEther('0'),
      )
      expect(await contract.balanceOf(addressB.address)).to.equal(
        utils.parseEther('0'),
      )
    })
    it('should not be able to transfer amount less that their remaining balance', async function () {
      await contract.mint(addressA.address, utils.parseEther('200000'))
      await expect(
        contract
          .connect(addressA)
          .transfer(addressB.address, utils.parseEther('200001')),
      ).to.be.revertedWith('ERC20: transfer amount exceeds balance')
      expect(await contract.balanceOf(addressA.address)).to.equal(
        utils.parseEther('200000'),
      )
      expect(await contract.balanceOf(addressB.address)).to.equal(
        utils.parseEther('0'),
      )
    })
    it('should not allow to transfer to zero address', async function () {
      await expect(
        contract.transfer(constants.AddressZero, utils.parseEther('150000')),
      ).to.be.revertedWith('ERC20: transfer to the zero address')
    })
    it('should not allow anyone to add and remove signers if not the owner', async function () {
      await expect(
        contract.connect(addressB).addSigner(addressC.address),
      ).to.be.rejectedWith('VLX: must be the owner')
      await expect(
        contract.connect(addressB).removeSigner(addressC.address),
      ).to.be.rejectedWith('VLX: must be the owner')
    })
    it("should not allow to burn other address' vlx", async function () {
      await contract.mint(addressA.address, utils.parseEther('100000'))
      //no additional parameter to put other wallet address but yourself
      await contract.connect(addressA).burn(utils.parseEther('50000'))
    })
    it('should not allow to claim VLX with invalid claimer', async function () {
      await expect(
        contract.claim(
          constants.AddressZero,
          '2',
          1,
          120,
          keccak256(utils.toUtf8Bytes('Test123')),
          keccak256(utils.toUtf8Bytes('456789z')),
        ),
      ).to.be.revertedWith('Velox: Invalid claimer')
    })
    it('should not allow to claim VLX with invalid amount', async function () {
      await expect(
        contract.claim(
          addressA.address,
          '2',
          0,
          120,
          keccak256(utils.toUtf8Bytes('Test123')),
          keccak256(utils.toUtf8Bytes('456789z')),
        ),
      ).to.be.revertedWith('Velox: Invalid amount')
    })
    it('should not allow to claim VLX with invalid signer', async function () {
      await expect(
        contract.claim(
          addressA.address,
          '2',
          1,
          120,
          keccak256(utils.toUtf8Bytes('Test123')),
          keccak256(utils.toUtf8Bytes('456789z')),
        ),
      ).to.be.revertedWith('Velox: Signer is not valid')
    })
    it('should not allow to claim VLX with invalid transactionID - manual', async function () {
      //will be manually tested since we need to get past signature verification
    })
  })
})
