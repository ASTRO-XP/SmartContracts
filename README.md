# Deployed Smart Contract Details | Testnet - ETH_GOERLI

**_AXP Token Contract Address and Etherscan Link_**

`0x3B574DDa0f88fe5d69f86d96AD928e594d212440`

`https://goerli.etherscan.io/token/0x3B574DDa0f88fe5d69f86d96AD928e594d212440`

**_VLX Token Contract Address_**

`0x90E718EFdD5466185Fd5C34b4409a12CE5C93cC0`

`https://goerli.etherscan.io/token/0x90E718EFdD5466185Fd5C34b4409a12CE5C93cC0`

**_HoloV Core Token Contract Address_**

`0xb8FaEafA5a38748B1954F3D2846E52f3f5403ffA`

`https://goerli.etherscan.io/token/0xb8FaEafA5a38748B1954F3D2846E52f3f5403ffA`

# Developer Notes

-  Do `npm install`

**IMPORTANT**: Rename `.env.example` to `.env` and populate details

**IMPORTANT**: Ensure .env and node_modules are ignored for security

_read todo's in `.env.example` and remove comments once done_

# Pre Deployment

`npx hardhat clean`

# Deployment and Contract Verification

`npx hardhat run scripts/<deployScript.js> --network <chosenNetwork>`

-  Copy the Contract Address from the terminal result and save it for future use
-  Copy and store the Contract ABI from the etherscan verification link and save it for future use
