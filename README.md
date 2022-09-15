# Deployed Smart Contract Details | Testnet - ETH_GOERLI

**_AXP Token Contract Address and Etherscan Link_**

`0x5B7673Feb72d105e0B14e4296550006b712233C1`

`https://goerli.etherscan.io/token/0x5B7673Feb72d105e0B14e4296550006b712233C1`

**_VLX Token Contract Address_**

`0x171fA72D1360bB90b8D6b1531542B097E9E20774`

`https://goerli.etherscan.io/token/0x171fA72D1360bB90b8D6b1531542B097E9E20774`

**_HoloV Core Token Contract Address_**

`0x0e11B9ccf970359aCAe48768DaF95de2f403A0D2`

`https://goerli.etherscan.io/token/0x0e11B9ccf970359aCAe48768DaF95de2f403A0D2`

# Developer Notes

- Do `npm install`

**IMPORTANT**: Rename `.env.example` to `.env` and populate details

**IMPORTANT**: Ensure .env and node_modules are ignored for security

_read todo's in `.env.example` and remove comments once done_

# Pre Deployment

`npx hardhat clean`

# Deployment and Contract Verification

`npx hardhat run scripts/<deployScript.js> --network <chosenNetwork>`

- Copy the Contract Address from the terminal result and save it for future use
- Copy and store the Contract ABI from the etherscan verification link and save it for future use
