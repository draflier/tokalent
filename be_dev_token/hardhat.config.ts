import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";
//import {} from "etherscan/apiKey";

import dotenv from 'dotenv';


dotenv.config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.7.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
    ],
  },
  networks: {
    // hardhat: {
    //   gas: 9000000000,
    //   blockGasLimit: 9000000000,
    //   allowUnlimitedContractSize: true,
    // },
    // localhost: {
    //   url: "http://127.0.0.1:8545",
    //   gas: 150000000,
    //   blockGasLimit: 150000000,
    //   allowUnlimitedContractSize: true,
    //   throwOnTransactionFailures: true,
    //   throwOnCallFailures: true,
    //   accounts: ["59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"]
    // },
    ganache: {
      url: "http://127.0.0.1:7545",
      gas: 20000000000,
      // blockGasLimit: 6721975,
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      timeout: 1800000,
      allowUnlimitedContractSize: true,
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    },
    truffdash: {
      url: "http://localhost:24012/rpc",
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      timeout: 1800000,
      allowUnlimitedContractSize: true,
      
    },

    mumbai: {
      url: "https://matic-mumbai.chainstacklabs.com",
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      timeout: 1800000,
      allowUnlimitedContractSize: true,
      //blockGasLimit: 15000000000,
      //gas: 30000000,
      //gasLimit: 1500000000,
      accounts: {mnemonic: process.env.MNEMONIC},
    },

    bnbtestnet: {
      url: "https://data-seed-prebsc-1-s3.binance.org:8545/",
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      timeout: 1800000,
      allowUnlimitedContractSize: true,
      //blockGasLimit: 15000000000,
      //gas: 30000000,
      //gasLimit: 1500000000,
      accounts: {mnemonic: process.env.MNEMONIC},
    },

    polygon_mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
    },
  },
  etherscan: {
    apiKey: process.env.MUMBAI,	
    /* 
    apiKey: {
      arbitrumGoerli: process.env.ARBITRUMGOERLI,
      polygonMumbai: process.env.MUMBAI,
      goerli: process.env.GOERLI,
      bnbTestnet: process.env.BNBTESTNET,
    }
    */
  },
};

export default config;
