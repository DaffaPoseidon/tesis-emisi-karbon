require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { HardhatUserConfig } = require("hardhat/config");

const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 500,
      },
      viaIR: true,
    },
  },
  networks: {
    // localhost: {
    //   url: "http://127.0.0.1:8545",
    // },
    besu: {
      url: "http://127.0.0.1:8545",
      accounts: ["0xd6076fa6963006c7fcfcfc278d9ecbdb5123eb69c4026ff3137631050c940276"], // Seperti private key di genesis.json
      gasPrice: 0,
      gas: 0x1ffffffffffffe,
      chainId: 1337,
    },
  },
};

module.exports = config;