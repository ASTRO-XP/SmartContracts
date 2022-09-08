# Deployed Smart Contract Details | Testnet - ETH_GOERLI

**_AXP Token Contract Address and Etherscan Link_**

`0xC4962B9269C8466FD897FaCD2E12C270911A544B`

`https://goerli.etherscan.io/token/0xC4962B9269C8466FD897FaCD2E12C270911A544B`

**_VLX Token Contract Address_**

`0x128D6674F83BdBc02e29A3306685D9aBEbE6B3B0`

`https://goerli.etherscan.io/token/0x128D6674F83BdBc02e29A3306685D9aBEbE6B3B0`

**_HoloV Core Token Contract Address_**

`0x6C645819A4c384A583317199eb0A1a33a8a681FB`

`https://goerli.etherscan.io/token/0x6C645819A4c384A583317199eb0A1a33a8a681FB`

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
