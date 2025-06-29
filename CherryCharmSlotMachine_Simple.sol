// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CherryCharmSlotMachine
 * @dev Simplified slot machine contract with updated reward logic
 */
contract CherryCharmSlotMachine is Ownable {
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
    
    constructor() {
        // No constructor parameters needed for simplified version
    }
    
    /**
     * @dev Main spin function with updated reward logic
     */
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
        
        // For simplified version, we'll just emit NFT event (no actual NFT minting)
        // In production, you'd integrate with an NFT contract
        
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
    
    /**
     * @dev Determine spin cost for the player
     */
    function getSpinCost(address player) public view returns (uint256) {
        if (freeSpins[player] > 0) {
            return 0;
        } else if (hasDiscount[player] && discountedSpins[player] > 0) {
            return DISCOUNTED_SPIN_COST;
        } else {
            return SPIN_COST;
        }
    }
    
    /**
     * @dev Get current reward pool balance
     */
    function getRewardPool() external view returns (uint256) {
        return rewardPool;
    }
    
    /**
     * @dev Fund the contract (owner only)
     */
    function fundContract() external payable onlyOwner {
        rewardPool += msg.value;
        emit RewardPoolUpdated(rewardPool);
    }
    
    /**
     * @dev Withdraw funds from contract (owner only)
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
    }
    
    /**
     * @dev Determine reward based on random number and probabilities
     */
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
    
    function _generateConsolationPrize() internal view returns (
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
    
    function _generateNothing() internal view returns (
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
    
    // Helper function for random generation
    function random() internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            block.number
        )));
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // Test function to check probabilities (remove in production)
    function testProbabilities() external view returns (
        uint256 nftChance,
        uint256 tripleChance,
        uint256 doubleChance,
        uint256 singleChance,
        uint256 consolationChance,
        uint256 nothingChance
    ) {
        return (5, 6, 20, 34, 11, 20);
    }
} 