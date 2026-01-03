// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
@openzeppelin/contracts/utils/ReentrancyGuard.sol
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ERC20 Staking Contract (Foundation)
 * @notice Users stake one ERC20 token to earn rewards in another ERC20 token
 */
contract Staking is ReentrancyGuard, Ownable {
    IERC20 public immutable stakeToken;
    IERC20 public immutable rewardToken;

    uint256 public totalStaked;

    mapping(address => uint256) public balances;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(
        address _stakeToken,
        address _rewardToken
    ) Ownable(msg.sender) {
        stakeToken = IERC20(_stakeToken);
        rewardToken = IERC20(_rewardToken);
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
