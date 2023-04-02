import "@nomicfoundation/hardhat-chai-matchers";
import {expect} from "chai";
import { ethers,run } from "hardhat";

const m_AccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDZmN2QzQkQwNzUxMjcxY0FCRjA4OTdCOTM0NDdGMmQxYmJDNzFENGMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjYzNDU0NjE0MTksIm5hbWUiOiJkcmFmc29sbiJ9.qP_s6O1o7zCLujyD_BkvrAg-mMt6WycbbpulmWqEYVI';
const m_JsonRootPath = '/home/wsldev01/dev/xalts_questions/question_2/smartcontract/metadata/json/';
//const m_strOwnerAddr = '0x3126081ee598F6658eF6b1aA6A067484759DE4cA';

let m_addrFtRewardContract = '';
let m_addrFtLpContract = '';
let m_addrStakeContract = '';

describe("1 party stake / withdraw", function () {
  it("Deplopying Reward contract", async function () {
  let accounts = await ethers.getSigners();
  //console.log(accounts);
  //console.log(accounts[0].address);
  let ftRewardContractFactory = await ethers.getContractFactory("DAR20Token");
  let ftRewardContract = await ftRewardContractFactory.deploy();
  await ftRewardContract.deployTransaction.wait(7);
  await ftRewardContract.deployed();

  try{
    await run("verify:verify", { address: ftRewardContract.address, constructorArguments: [], contract: "contracts/dar_20.sol:DAR20Token" });
  }catch(e){
      console.log(e);
  }

  console.log("FT Reward Contract deployed to:", ftRewardContract.address);
  console.log("FT Reward Contract owner address:", accounts[0].address);
  m_addrFtRewardContract = ftRewardContract.address;

  expect(await ftRewardContract.owner()).equal(accounts[0].address);
  });

  it("Deplopying Lp contract", async function () {
    let accounts = await ethers.getSigners();
    //console.log(accounts);
    //console.log(accounts[0].address);
    let ftLpContractFactory = await ethers.getContractFactory("DALP20Token");
    let ftLpContract = await ftLpContractFactory.deploy();
    await ftLpContract.deployTransaction.wait(7);
    await ftLpContract.deployed();
  
    try{
      await run("verify:verify", { address: ftLpContract.address, constructorArguments: [], contract: "contracts/dalp_20.sol:DALP20Token" });
    }catch(e){
        console.log(e);
    }
  
    console.log("FT Lp Contract deployed to:", ftLpContract.address);
    console.log("FT Lp Contract owner address:", accounts[0].address);
    m_addrFtLpContract = ftLpContract.address;
  
    expect(await ftLpContract.owner()).equal(accounts[0].address);
  });

  it("Deplopying Staking Rewards contract", async function () {
      let accounts = await ethers.getSigners();
      //console.log(accounts);
      //console.log(accounts[0].address);
      let ContractFactory = await ethers.getContractFactory("StakingRewards");
      let Contract = await ContractFactory.deploy(m_addrFtRewardContract,m_addrFtLpContract);
      await Contract.deployTransaction.wait(7);
      await Contract.deployed();
    
      try{
        await run("verify:verify", { address: Contract.address, constructorArguments: [m_addrFtRewardContract,m_addrFtLpContract], contract: "contracts/stakingRewards.sol:StakingRewards" });
      }catch(e){
          console.log(e);
      }
    
      console.log("Staking Rewards Contract deployed to:", Contract.address);
      console.log("Staking Rewards Contract owner address:", accounts[0].address);
      m_addrStakeContract = Contract.address;
    
      expect(await Contract.owner()).equal(accounts[0].address);
  });


  it("Mint LP to staker", async function () {
    let accounts = await ethers.getSigners();
    let Ft = await ethers.getContractAt("DALP20Token", m_addrFtLpContract);
    let Ft2 = await Ft.connect(accounts[1]);
    //console.log(await Ft2.balanceOf(accounts[1].address))
    let objTxn = await Ft2.mint(accounts[1].address,ethers.utils.parseEther("1005").toString());
    await objTxn.wait();
    //console.log(await Ft2.balanceOf(accounts[1].address))
    expect (await Ft2.balanceOf(accounts[1].address)).equal(ethers.utils.parseEther("1005"));
    //expect (objTxn).reverted("Ownable: caller is not the owner");
  });

  it("Mint Rewards to stake contract", async function () {
    let accounts = await ethers.getSigners();
    let Ft = await ethers.getContractAt("DAR20Token", m_addrFtRewardContract);
    //let Ft2 = await Ft.connect(accounts[1]);
    //console.log(await Ft2.balanceOf(accounts[1].address))
    let objTxn = await Ft.mint(accounts[0].address,ethers.utils.parseEther("1000").toString());
    await objTxn.wait();
    
    objTxn = await Ft.transfer(m_addrStakeContract,ethers.utils.parseEther("1000").toString());
    await objTxn.wait();

    //console.log(await Ft2.balanceOf(accounts[1].address))
    expect (await Ft.balanceOf(m_addrStakeContract)).equal(ethers.utils.parseEther("1000"));
    //expect (objTxn).reverted("Ownable: caller is not the owner");
  });

  it("Set Staking Duration", async function () {
    
    let contractStake = await ethers.getContractAt("StakingRewards", m_addrStakeContract);
    
    let objTxn = await contractStake.setRewardsDuration(1000);
    await objTxn.wait(5);

    //expect (objTxn).reverted("Ownable: caller is not the owner");
  });

  it("Notify Reward Amount to set reward rate", async function () {
    
    let contractStake = await ethers.getContractAt("StakingRewards", m_addrStakeContract);
    
    let objTxn = await contractStake.notifyRewardAmount(ethers.utils.parseEther("1000").toString());
    await objTxn.wait(5);
    console.log(await contractStake.getRewardRate())
    expect (await contractStake.getRewardRate()).gt(ethers.utils.parseEther("0"));
  });

  it("Approve tokens for staking rewards contract", async function () {
    let accounts = await ethers.getSigners();
    let Ft = await ethers.getContractAt("DALP20Token", m_addrFtLpContract);
    let Ft2 = await Ft.connect(accounts[1]);
    let objTxn = await Ft2.approve(m_addrStakeContract,ethers.utils.parseEther("1000").toString());
    await objTxn.wait(5);
    expect (await Ft2.allowance(accounts[1].address,m_addrStakeContract)).equal(ethers.utils.parseEther("1000"));
    //expect (objTxn).reverted("Ownable: caller is not the owner");
  });

  it("Staking 1000 DALP20", async function () {
    let accounts = await ethers.getSigners();
    let contractStake = await ethers.getContractAt("StakingRewards", m_addrStakeContract);
    let contractStake2 = await contractStake.connect(accounts[1]);
    let objTxn = await contractStake2.stake(ethers.utils.parseEther("1000").toString());
    await objTxn.wait(5);
    expect (await contractStake2.balanceOf(accounts[1].address)).equal(ethers.utils.parseEther("1000"));

    let Ft = await ethers.getContractAt("DALP20Token", m_addrFtLpContract);
    let Ft2 = await Ft.connect(accounts[1]);
    expect (await Ft2.balanceOf(accounts[1].address)).equal(ethers.utils.parseEther("5"));
    //expect (objTxn).reverted("Ownable: caller is not the owner");
  });

  it("Check for how much is earned", async function () {
    let accounts = await ethers.getSigners();
    let contractStake = await ethers.getContractAt("StakingRewards", m_addrStakeContract);
    let contractStake2 = await contractStake.connect(accounts[1]);
    let objEarned = await contractStake2.earned(accounts[1].address);
    console.log(objEarned);
    expect (objEarned).gt(ethers.utils.parseEther("0"));
    //expect (objTxn).reverted("Ownable: caller is not the owner");
  });



  it("Withdraw Staked LP", async function () {
    let accounts = await ethers.getSigners();
    let contractStake = await ethers.getContractAt("StakingRewards", m_addrStakeContract);
    let contractStake2 = await contractStake.connect(accounts[1]);
    let objTxn = await contractStake2.withdraw(ethers.utils.parseEther("1000").toString());
    await objTxn.wait(5);
    expect ((await contractStake2.balanceOf(accounts[1].address)).toNumber()).equal(ethers.utils.parseEther("0"));

    let Ft = await ethers.getContractAt("DALP20Token", m_addrFtLpContract);
    let Ft2 = await Ft.connect(accounts[1]);
    expect (await Ft2.balanceOf(accounts[1].address)).equal(ethers.utils.parseEther("1005"))
    //expect (objTxn).reverted("Ownable: caller is not the owner");
  });

  it("Get Rewards", async function () {
    let accounts = await ethers.getSigners();
    let Ft = await ethers.getContractAt("DAR20Token", m_addrFtRewardContract);
    let Ft2 = await Ft.connect(accounts[1]);
    expect ((await Ft2.balanceOf(accounts[1].address))).equal(ethers.utils.parseEther("0"));
    
    let contractStake = await ethers.getContractAt("StakingRewards", m_addrStakeContract);
    let contractStake2 = await contractStake.connect(accounts[1]);
    let objTxn = await contractStake2.getReward();
    await objTxn.wait(5);
    //expect (contractStake2.balanceOf(accounts[1].address)).equal(ethers.utils.parseEther("1000"));
    expect ((await Ft2.balanceOf(accounts[1].address))).gt(ethers.utils.parseEther("0"))
    //expect (objTxn).reverted("Ownable: caller is not the owner");
  });





});
