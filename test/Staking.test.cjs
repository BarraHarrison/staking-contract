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
        expect(remainingRewards.isZero()).to.equal(true);
    });


    it("allows partial withdrawal while keeping correct rewards", async function () {
        await stakeToken.connect(user).approve(staking.address, STAKE_AMOUNT);
        await staking.connect(user).stake(STAKE_AMOUNT);

        await ethers.provider.send("evm_increaseTime", [10]);
        await ethers.provider.send("evm_mine");

        const withdrawAmount = STAKE_AMOUNT.div(2);
        await staking.connect(user).withdraw(withdrawAmount);

        await ethers.provider.send("evm_increaseTime", [10]);
        await ethers.provider.send("evm_mine");
        await staking.connect(user).claimReward();

        const rewardBalance = await rewardToken.balanceOf(user.address);
        expect(rewardBalance.gt(0)).to.equal(true);

        const remainingStake = await staking.balances(user.address);
        expect(remainingStake.eq(STAKE_AMOUNT.sub(withdrawAmount))).to.equal(true);

        const remainingRewards = await staking.earned(user.address);
        expect(remainingRewards.isZero()).to.equal(true);
    });

    it("splits rewards correctly between multiple stakers", async function () {
        const [, userA, userB] = await ethers.getSigners();

        const stakeA = ethers.utils.parseEther("100");
        const stakeB = ethers.utils.parseEther("100");

        await stakeToken.transfer(userA.address, stakeA);
        await stakeToken.transfer(userB.address, stakeB);

        await stakeToken.connect(userA).approve(staking.address, stakeA);
        await stakeToken.connect(userB).approve(staking.address, stakeB);

        await staking.connect(userA).stake(stakeA);
        await ethers.provider.send("evm_increaseTime", [10]);
        await ethers.provider.send("evm_mine");

        await staking.connect(userB).stake(stakeB);
        await ethers.provider.send("evm_increaseTime", [10]);
        await ethers.provider.send("evm_mine");

        await staking.connect(userA).claimReward();
        await staking.connect(userB).claimReward();

        const rewardA = await rewardToken.balanceOf(userA.address);
        const rewardB = await rewardToken.balanceOf(userB.address);

        expect(rewardA.gt(0)).to.equal(true);
        expect(rewardB.gt(0)).to.equal(true);

        expect(rewardA.gt(rewardB)).to.equal(true);
    });

    it("reverts on invalid staking and reward actions", async function () {
        await expect(
            staking.connect(user).stake(0)
        ).to.be.reverted

        await expect(
            staking.connect(user).withdraw(ethers.utils.parseEther("1"))
        ).to.be.reverted

        await expect(
            staking.connect(user).claimReward()
        ).to.be.reverted
    });

});
