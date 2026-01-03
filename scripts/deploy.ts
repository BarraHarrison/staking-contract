import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with account:", deployer.address);

    const StakeToken = await ethers.getContractFactory("StakeToken");
    const stakeToken = await StakeToken.deploy(
        ethers.parseEther("1000000")
    );
    await stakeToken.waitForDeployment();

    console.log("StakeToken deployed to:", await stakeToken.getAddress());

    const RewardToken = await ethers.getContractFactory("RewardToken");
    const rewardToken = await RewardToken.deploy();
    await rewardToken.waitForDeployment();

    console.log("RewardToken deployed to:", await rewardToken.getAddress());

    const rewardRate = ethers.parseEther("1");

    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(
        await stakeToken.getAddress(),
        await rewardToken.getAddress(),
        rewardRate
    );
    await staking.waitForDeployment();

    console.log("Staking contract deployed to:", await staking.getAddress());

    const rewardAmount = ethers.parseEther("100000");

    const mintTx = await rewardToken.mint(
        await staking.getAddress(),
        rewardAmount
    );
    await mintTx.wait();

    console.log("Staking contract funded with rewards");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
