const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking contract", function () {
    let stakeToken;
    let rewardToken;
    let staking;
    let owner;
    let user;

    const INITIAL_SUPPLY = ethers.utils.parseEther("1000000");
    const STAKE_AMOUNT = ethers.utils.parseEther("100");
    const REWARD_RATE = ethers.utils.parseEther("1");
    const REWARD_FUND = ethers.utils.parseEther("100000");

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        const StakeToken = await ethers.getContractFactory("StakeToken");
        stakeToken = await StakeToken.deploy(INITIAL_SUPPLY);
        await stakeToken.deployed();

        const RewardToken = await ethers.getContractFactory("RewardToken");
        rewardToken = await RewardToken.deploy();
        await rewardToken.deployed();

        const Staking = await ethers.getContractFactory("Staking");
        staking = await Staking.deploy(
            stakeToken.address,
            rewardToken.address,
            REWARD_RATE
        );
        await staking.deployed();
        await rewardToken.mint(staking.address, REWARD_FUND);
        await stakeToken.transfer(user.address, STAKE_AMOUNT);
    });

    it("allows a user to stake and earn rewards over time", async function () {

        await stakeToken.connect(user).approve(staking.address, STAKE_AMOUNT);
        await staking.connect(user).stake(STAKE_AMOUNT);
        await ethers.provider.send("evm_increaseTime", [10]);
        await ethers.provider.send("evm_mine");

        const earned = await staking.earned(user.address);
        expect(earned.gt(0)).to.equal(true);

        await staking.connect(user).claimReward();

        const rewardBalance = await rewardToken.balanceOf(user.address);
        expect(rewardBalance.gt(0)).to.equal(true);

        const remainingRewards = await staking.earned(user.address);
        expect(remainingRewards).to.equal(0);
    });
});
