require("@nomicfoundation/hardhat-toolbox");

const dotenv = require("dotenv");
dotenv.config();

module.exports = {
   solidity: {
      version: "0.8.9",
      settings: {
         optimizer: {
            enabled: true,
            runs: 2000,
         },
      },
   },
   networks: {
      goerli: {
         url: process.env.ETH_TEST_GOERLI,
         accounts: [process.env.PRIVATE_KEY],
      },
      ethereum: {
         url: process.env.ETH_MAIN,
         accounts: [process.env.PRIVATE_KEY],
      },
   },
   etherscan: {
      apiKey: process.env.API_KEY,
   },
};
