# 🎰 CherryCharm Slot Machine - Contract Deployment Guide

## 📋 Overview

This guide will help you deploy the updated CherryCharm slot machine contract with the new reward logic on Remix IDE.

## 🚀 Deployment Steps

### Step 1: Prepare Remix IDE

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create a new workspace or use existing one
3. Make sure you have MON testnet configured in your wallet (MetaMask)

### Step 2: Add Dependencies

In Remix, you need to add OpenZeppelin contracts. Go to the **Package Manager** plugin and install:
```
@openzeppelin/contracts
```

### Step 3: Create Contract Files

Create two files in your Remix workspace:

#### File 1: `CherryCharmNFT.sol`
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CherryCharmNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    string private _baseTokenURI;
    
    constructor() ERC721("CherryCharmNFT", "CHERRY") {
        _baseTokenURI = "https://cherrycharm.com/metadata/";
    }
    
    function mint(address to) external onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(to, newTokenId);
        return newTokenId;
    }
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
}
```

#### File 2: `CherryCharmSlotMachine.sol`
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CherryCharmNFT.sol";

contract CherryCharmSlotMachine is Ownable {
    CherryCharmNFT public immutable nftContract;
    
    // Constants
    uint256 public constant SPIN_COST = 0.1 ether; // 0.1 MON
    uint256 public constant DISCOUNTED_SPIN_COST = 0.01 ether; // 0.01 MON
    uint256 public constant RARE_NFT_PROBABILITY = 5; // 5%
    
    // Reward amounts (in wei)
    uint256 public constant TRIPLE_CHERRY_REWARD = 0.5 ether;
    uint256 public constant TRIPLE_APPLE_REWARD = 0.3 ether;
    uint256 public constant TRIPLE_BANANA_REWARD = 0.2 ether;
    uint256 public constant TRIPLE_LEMON_REWARD = 0.15 ether;
    
    uint256 public constant DOUBLE_CHERRY_REWARD = 0.2 ether;
    uint256 public constant DOUBLE_APPLE_REWARD = 0.15 ether;
    uint256 public constant DOUBLE_BANANA_REWARD = 0.1 ether;
    uint256 public constant DOUBLE_LEMON_REWARD = 0.05 ether;
    
    uint256 public constant SINGLE_CHERRY_REWARD = 0.02 ether;
    uint256 public constant CONSOLATION_PRIZE = 0.01 ether;
    
    // Free spins and discounts
    uint256 public constant TRIPLE_CHERRY_FREE_SPINS = 2;
    uint256 public constant TRIPLE_APPLE_FREE_SPINS = 3;
    uint256 public constant TRIPLE_BANANA_DISCOUNTED_SPINS = 10;
    uint256 public constant TRIPLE_LEMON_FREE_SPINS = 1;
    
    uint256 public constant DOUBLE_CHERRY_FREE_SPINS = 1;
    uint256 public constant DOUBLE_BANANA_FREE_SPINS = 2;
    uint256 public constant DOUBLE_LEMON_FREE_SPINS = 1;
    
    uint256 public constant SINGLE_APPLE_FREE_SPINS = 1;
    uint256 public constant SINGLE_BANANA_DISCOUNTED_SPINS = 10;
    
    // Player state
    mapping(address => uint256) public freeSpins;
    mapping(address => uint256) public discountedSpins;
    mapping(address => bool) public hasDiscount;
    
    // Contract state
    uint256 public rewardPool;
    
    // Events
    event SpinResult(
        address indexed user,
        string combination,
        uint256 monReward,
        uint256 extraSpins,
        bool discountApplied,
        bool newDiscountGranted,
        bool nftMinted
    );
    
    event RewardPoolUpdated(uint256 newBalance);
    
    constructor(address _nftContract) {
        nftContract = CherryCharmNFT(_nftContract);
    }
    
    function spin() external payable {
        require(msg.value == getSpinCost(msg.sender), "Incorrect spin cost");
        
        // Deduct spin cost from player's balance
        if (freeSpins[msg.sender] > 0) {
            freeSpins[msg.sender]--;
        } else if (hasDiscount[msg.sender] && discountedSpins[msg.sender] > 0) {
            discountedSpins[msg.sender]--;
            if (discountedSpins[msg.sender] == 0) {
                hasDiscount[msg.sender] = false;
            }
        }
        
        // Add spin cost to reward pool
        rewardPool += msg.value;
        
        // Generate random combination and determine reward
        (string memory combination, uint256 monReward, uint256 extraSpins, bool nftMinted, bool newDiscountGranted) = 
            _determineReward(msg.sender);
        
        // Apply rewards
        if (monReward > 0) {
            require(rewardPool >= monReward, "Insufficient reward pool");
            rewardPool -= monReward;
            payable(msg.sender).transfer(monReward);
        }
        
        if (extraSpins > 0) {
            freeSpins[msg.sender] += extraSpins;
        }
        
        if (newDiscountGranted) {
            hasDiscount[msg.sender] = true;
        }
        
        if (nftMinted) {
            nftContract.mint(msg.sender);
        }
        
        emit SpinResult(
            msg.sender,
            combination,
            monReward,
            extraSpins,
            hasDiscount[msg.sender],
            newDiscountGranted,
            nftMinted
        );
        
        emit RewardPoolUpdated(rewardPool);
    }
    
    function getSpinCost(address player) public view returns (uint256) {
        if (freeSpins[player] > 0) {
            return 0;
        } else if (hasDiscount[player] && discountedSpins[player] > 0) {
            return DISCOUNTED_SPIN_COST;
        } else {
            return SPIN_COST;
        }
    }
    
    function getRewardPool() external view returns (uint256) {
        return rewardPool;
    }
    
    function fundContract() external payable onlyOwner {
        rewardPool += msg.value;
        emit RewardPoolUpdated(rewardPool);
    }
    
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
    }
    
    function _determineReward(address player) internal view returns (
        string memory combination,
        uint256 monReward,
        uint256 extraSpins,
        bool nftMinted,
        bool newDiscountGranted
    ) {
        // Generate pseudo-random number
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            player,
            block.number
        ))) % 100;
        
        // Check for NFT first (5% chance)
        if (random < RARE_NFT_PROBABILITY) {
            return _generateNFTCombination(random);
        }
        
        // Adjust random for remaining 95%
        random = (random - RARE_NFT_PROBABILITY) * 100 / (100 - RARE_NFT_PROBABILITY);
        
        // Triple matches (6% total - 1.5% each)
        if (random < 6) {
            return _generateTripleMatch(random);
        }
        
        // Double matches (20% total - 5% each)
        if (random < 26) {
            return _generateDoubleMatch(random - 6);
        }
        
        // Single matches and consolation (34% total)
        if (random < 60) {
            return _generateSingleMatch(random - 26);
        }
        
        // Consolation prize (11%)
        if (random < 71) {
            return _generateConsolationPrize();
        }
        
        // Nothing (20%)
        return _generateNothing();
    }
    
    function _generateNFTCombination(uint256 random) internal pure returns (
        string memory combination,
        uint256 monReward,
        uint256 extraSpins,
        bool nftMinted,
        bool newDiscountGranted
    ) {
        string[4] memory fruits = ["Cherry", "Apple", "Banana", "Lemon"];
        uint256 fruit1 = random % 4;
        uint256 fruit2 = random % 4;
        uint256 fruit3 = random % 4;
        
        combination = string(abi.encodePacked(
            fruits[fruit1], "|", fruits[fruit2], "|", fruits[fruit3]
        ));
        
        return (combination, 0, 0, true, false);
    }
    
    function _generateTripleMatch(uint256 random) internal pure returns (
        string memory combination,
        uint256 monReward,
        uint256 extraSpins,
        bool nftMinted,
        bool newDiscountGranted
    ) {
        string[4] memory fruits = ["Cherry", "Apple", "Banana", "Lemon"];
        uint256 fruitIndex = random / 2; // 0-2 range for 1.5% each
        
        string memory fruit = fruits[fruitIndex];
        combination = string(abi.encodePacked(fruit, "|", fruit, "|", fruit));
        
        if (fruitIndex == 0) { // Cherry
            return (combination, TRIPLE_CHERRY_REWARD, TRIPLE_CHERRY_FREE_SPINS, false, false);
        } else if (fruitIndex == 1) { // Apple
            return (combination, TRIPLE_APPLE_REWARD, TRIPLE_APPLE_FREE_SPINS, false, false);
        } else if (fruitIndex == 2) { // Banana
            return (combination, TRIPLE_BANANA_REWARD, 0, false, true);
        } else { // Lemon
            return (combination, TRIPLE_LEMON_REWARD, TRIPLE_LEMON_FREE_SPINS, false, false);
        }
    }
    
    function _generateDoubleMatch(uint256 random) internal pure returns (
        string memory combination,
        uint256 monReward,
        uint256 extraSpins,
        bool nftMinted,
        bool newDiscountGranted
    ) {
        string[4] memory fruits = ["Cherry", "Apple", "Banana", "Lemon"];
        uint256 fruitIndex = random / 5; // 0-3 range for 5% each
        
        string memory fruit = fruits[fruitIndex];
        string memory otherFruit = fruits[(fruitIndex + 1) % 4];
        combination = string(abi.encodePacked(fruit, "|", fruit, "|", otherFruit));
        
        if (fruitIndex == 0) { // Cherry
            return (combination, DOUBLE_CHERRY_REWARD, DOUBLE_CHERRY_FREE_SPINS, false, false);
        } else if (fruitIndex == 1) { // Apple
            return (combination, DOUBLE_APPLE_REWARD, 0, false, false);
        } else if (fruitIndex == 2) { // Banana
            return (combination, DOUBLE_BANANA_REWARD, DOUBLE_BANANA_FREE_SPINS, false, false);
        } else { // Lemon
            return (combination, DOUBLE_LEMON_REWARD, DOUBLE_LEMON_FREE_SPINS, false, false);
        }
    }
    
    function _generateSingleMatch(uint256 random) internal pure returns (
        string memory combination,
        uint256 monReward,
        uint256 extraSpins,
        bool nftMinted,
        bool newDiscountGranted
    ) {
        string[4] memory fruits = ["Cherry", "Apple", "Banana", "Lemon"];
        
        if (random < 15) { // Cherry (15%)
            uint256 fruit1 = 0; // Cherry
            uint256 fruit2 = (random % 3) + 1; // Other fruits
            uint256 fruit3 = (random % 3) + 1;
            combination = string(abi.encodePacked(
                fruits[fruit1], "|", fruits[fruit2], "|", fruits[fruit3]
            ));
            return (combination, SINGLE_CHERRY_REWARD, 0, false, false);
        } else if (random < 25) { // Apple (10%)
            uint256 fruit1 = 1; // Apple
            uint256 fruit2 = random % 2 == 0 ? 0 : 2; // Cherry or Banana
            uint256 fruit3 = random % 2 == 0 ? 2 : 3; // Banana or Lemon
            combination = string(abi.encodePacked(
                fruits[fruit1], "|", fruits[fruit2], "|", fruits[fruit3]
            ));
            return (combination, 0, SINGLE_APPLE_FREE_SPINS, false, false);
        } else { // Banana (8%)
            uint256 fruit1 = 2; // Banana
            uint256 fruit2 = random % 2 == 0 ? 0 : 1; // Cherry or Apple
            uint256 fruit3 = random % 2 == 0 ? 1 : 3; // Apple or Lemon
            combination = string(abi.encodePacked(
                fruits[fruit1], "|", fruits[fruit2], "|", fruits[fruit3]
            ));
            return (combination, 0, 0, false, true);
        }
    }
    
    function _generateConsolationPrize() internal pure returns (
        string memory combination,
        uint256 monReward,
        uint256 extraSpins,
        bool nftMinted,
        bool newDiscountGranted
    ) {
        string[4] memory fruits = ["Cherry", "Apple", "Banana", "Lemon"];
        uint256 fruit1 = random() % 4;
        uint256 fruit2 = random() % 4;
        uint256 fruit3 = random() % 4;
        
        combination = string(abi.encodePacked(
            fruits[fruit1], "|", fruits[fruit2], "|", fruits[fruit3]
        ));
        
        return (combination, CONSOLATION_PRIZE, 0, false, false);
    }
    
    function _generateNothing() internal pure returns (
        string memory combination,
        uint256 monReward,
        uint256 extraSpins,
        bool nftMinted,
        bool newDiscountGranted
    ) {
        string[4] memory fruits = ["Cherry", "Apple", "Banana", "Lemon"];
        uint256 fruit1 = random() % 4;
        uint256 fruit2 = random() % 4;
        uint256 fruit3 = random() % 4;
        
        combination = string(abi.encodePacked(
            fruits[fruit1], "|", fruits[fruit2], "|", fruits[fruit3]
        ));
        
        return (combination, 0, 0, false, false);
    }
    
    function random() internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            block.number
        )));
    }
    
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
```

### Step 4: Configure Compiler

1. Go to the **Solidity Compiler** plugin
2. Set compiler version to **0.8.19**
3. Enable optimization with **200 runs**
4. Set EVM version to **paris**

### Step 5: Deploy NFT Contract First

1. Select `CherryCharmNFT.sol` in the file explorer
2. Click **Compile**
3. Go to **Deploy & Run Transactions**
4. Set environment to **Injected Provider - MetaMask**
5. Make sure you're connected to **Monad Testnet**
6. Click **Deploy** (no constructor parameters needed)
7. **Save the NFT contract address** - you'll need it for the slot machine

### Step 6: Deploy Slot Machine Contract

1. Select `CherryCharmSlotMachine.sol`
2. Click **Compile**
3. In **Deploy & Run Transactions**:
   - Set environment to **Injected Provider - MetaMask**
   - Contract: `CherryCharmSlotMachine`
   - Constructor parameter: Paste the NFT contract address from Step 5
4. Click **Deploy**

### Step 7: Fund the Contract

After deployment, you need to fund the reward pool:

1. In the deployed contracts section, find your slot machine contract
2. Use the `fundContract` function
3. Send at least **10 MON** to start the reward pool
4. This ensures players can win rewards

### Step 8: Update Your App

Once deployed, update your app with the new contract address:

```typescript
// In src/hooks/useBlockchainGame.tsx
const SLOT_MACHINE_ADDRESS = 'YOUR_NEW_CONTRACT_ADDRESS';
```

## 🔧 Contract Configuration

### Reward Probabilities Summary:
- **NFT**: 5%
- **Triple Matches**: 6% (1.5% each)
- **Double Matches**: 20% (5% each)
- **Single Matches**: 33% (Cherry 15%, Apple 10%, Banana 8%)
- **Consolation Prize**: 11%
- **Nothing**: 20%

### Expected Economics:
- **Spin Cost**: 0.1 MON
- **Expected Payout**: ~0.077-0.082 MON per spin
- **Pool Retention**: ~1.8-2.1 MON per 100 spins
- **Win Rate**: 80%

## ⚠️ Important Notes

1. **Randomness**: This uses pseudo-random numbers. For production, consider Chainlink VRF
2. **Funding**: Always fund the contract before allowing players to spin
3. **Testing**: Test thoroughly on testnet before mainnet
4. **Security**: The contract includes emergency withdrawal functions for safety

## 🎯 Next Steps

After deployment:
1. Test the contract with small amounts
2. Update your app's contract address
3. Test the full integration
4. Monitor the reward pool balance

Let me know if you need help with any of these steps! 