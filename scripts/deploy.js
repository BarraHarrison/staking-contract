import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with account:", deployer.address);
    console.log("Deployer balance:", (await deployer.getBalance()).toString());

    const StakeToken = await ethers.getContractFactory("StakeToken");
    const stakeToken = await StakeToken.deploy(
        ethers.utils.parseEther("1000000")
    );
    await stakeToken.deployed();

    const stakeTokenAddress = await stakeToken.address();
    console.log("StakeToken deployed to:", stakeTokenAddress);

    const RewardToken = await ethers.getContractFactory("RewardToken");
    const rewardToken = await RewardToken.deploy();
    await rewardToken.deployed();

    const rewardTokenAddress = await rewardToken.address();
    console.log("RewardToken deployed to:", rewardTokenAddress);

    const rewardRate = ethers.utils.parseEther("1");

    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(
        stakeTokenAddress,
        rewardTokenAddress,
        rewardRate
    );
    await staking.deployed();

    const stakingAddress = await staking.address();
    console.log("Staking contract deployed to:", stakingAddress);

    const rewardFundingAmount = ethers.utils.parseEther("100000");

    const mintTx = await rewardToken.mint(
        stakingAddress,
        rewardFundingAmount
    );
    await mintTx.wait();

    console.log("Staking contract funded with rewards");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
