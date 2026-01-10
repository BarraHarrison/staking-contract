# ERC20 Staking Contract (Yield Farming Mini-Project)

This project is a fully tested ERC-20 staking protocol built as part of **Week 10 (DeFi / NFT Mechanics)** of my blockchain study roadmap. It demonstrates how users can stake one ERC-20 token and earn rewards in a separate ERC-20 token using time-based yield farming logic.

The focus of this project is **correct reward accounting**, **fair yield distribution**, and **protocol safety**, rather than UI or frontend integration.

---

## 📌 Project Overview

Users can:

* Stake an ERC-20 token (**StakeToken**)
* Earn rewards in a different ERC-20 token (**RewardToken**)
* Withdraw part or all of their stake at any time
* Claim rewards accrued over time
* Participate fairly alongside other stakers

Rewards are distributed **proportionally and time-weighted**, ensuring early stakers earn more and late stakers do not dilute past rewards.

---

## 🧱 Architecture

### Contracts

* **StakeToken.sol**
  ERC-20 token used for staking. Represents the asset being locked in the protocol.

* **RewardToken.sol**
  ERC-20 token used for rewards. Minted and funded into the staking contract.

* **Staking.sol**
  Core staking logic. Tracks balances, rewards, and global accounting. Uses OpenZeppelin’s `ReentrancyGuard` and `Ownable`.

---

## ⚙️ Reward Mechanics (High-Level)

* Rewards are emitted at a constant `rewardRate` (tokens per second)
* A global `rewardPerToken` value tracks accumulated rewards
* Each user stores a snapshot of rewards already accounted for
* Rewards are calculated lazily on interaction (`stake`, `withdraw`, `claim`)

This design:

* Avoids loops
* Scales to many users
* Mirrors real DeFi staking protocols

---

## 🔐 Safety Features

* Reentrancy protection on all state-changing functions
* Zero-value staking prevented
* Over-withdrawals blocked
* Reward claims without accrued rewards reverted
* Defensive accounting using an `updateReward` modifier

---

## 🧪 Test Coverage

The protocol is fully tested using **Hardhat + Mocha + Chai**.

### Implemented Tests

* Stake → wait → claim rewards
* Partial withdrawal without losing accrued rewards
* Multiple stakers with fair yield splitting
* Edge-case protection (invalid actions revert safely)

All tests pass and validate both **core logic** and **failure paths**, ensuring protocol correctness.

---

## 🧠 Key Learning Outcomes

* ERC-20 staking design patterns
* Yield farming and reward distribution logic
* Time-weighted reward accounting
* Multi-user fairness in DeFi protocols
* Writing robust smart-contract tests
* Safe handling of BigNumbers in JavaScript

---

## 🚀 Possible Extensions

* NFT-based reward multipliers (boosted staking)
* Adjustable reward rates
* Emergency withdraw mechanism
* Frontend dashboard (React + ethers.js)
* Deployment to a public testnet (e.g. Sepolia)

---

## 🛠️ Tech Stack

* Solidity ^0.8.x
* Hardhat (v2)
* ethers.js (v5)
* OpenZeppelin Contracts
* Mocha / Chai

---

## 📄 License

MIT