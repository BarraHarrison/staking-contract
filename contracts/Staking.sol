// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ERC20 Staking Contract (Foundation)
 * @notice Users stake one ERC20 token to earn rewards in another ERC20 token
 */
contract Staking is ReentrancyGuard, Ownable {
    IERC20 public immutable stakeToken;
    IERC20 public immutable rewardToken;

    uint256 public totalStaked;

    uint256 public rewardRate;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    mapping(address => uint256) public balances;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(
        address _stakeToken,
        address _rewardToken,
        uint256 _rewardRate
    ) Ownable(msg.sender) {
        stakeToken = IERC20(_stakeToken);
        rewardToken = IERC20(_rewardToken);
        rewardRate = _rewardRate;
        lastUpdateTime = block.timestamp;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }

        return
            rewardPerTokenStored +
            ((block.timestamp - lastUpdateTime) * rewardRate * 1e18) /
            totalStaked;
    }


    /**
     * @notice Stake ERC20 tokens
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake zero");

        totalStaked += amount;
        balances[msg.sender] += amount;

        stakeToken.transferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount);
    }

    /**
     * @notice Withdraw staked tokens
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot withdraw zero");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        totalStaked -= amount;
        balances[msg.sender] -= amount;

        stakeToken.transfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }
}
