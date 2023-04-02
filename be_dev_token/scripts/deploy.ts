import { ethers,run } from "hardhat";
//import {DA20Token } from "../typechain-types/contracts/DA20Token";

let m_addrFtContract = '';


async function main() {
  await deployToken();
}

async function deployToken()
{
  let accounts = await ethers.getSigners();
  //console.log(accounts);
  //console.log(accounts[0].address);
  let ftContractFactory = await ethers.getContractFactory("DA20Token");
  let ftContract = await ftContractFactory.deploy();
  await ftContract.deployTransaction.wait(7);
  await ftContract.deployed();

  try{
    await run("verify:verify", { address: ftContract.address, constructorArguments: [], contract: "contracts/da_20.sol:DA20Token" });
  }catch(e){
      console.log(e);
  }

  console.log("FT Contract deployed to:", ftContract.address);
  console.log("FT Contract owner address:", accounts[0].address);
  m_addrFtContract = ftContract.address;
}




// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
