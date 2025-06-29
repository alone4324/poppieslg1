![Poppies Slot Machine Logo](./public/images/logo.png)

**A blockchain-powered 3D slot machine game on Monad Network.**

<a href='https://ko-fi.com/michaelkolesidis' target='_blank'><img src='https://cdn.ko-fi.com/cdn/kofi1.png' style='border:0px;height:45px;' alt='Buy Me a Coffee at ko-fi.com' /></a>

![Attention! Free Software](./public/images/attention-free-software.png)

This software is free (as in freedom). **If you use any part of this code, you must make your entire project's source code publicly available under the same license.** This applies whether you modify the code or use it as it is in your own project. This ensures that all modifications and derivative works remain free software, so that everyone can benefit. If you are not willing to comply with these terms, you must refrain from using any part of this code.

For full license terms and conditions, you can read the AGPL-3.0 at: [gnu.org/licenses/agpl-3.0.html](https://www.gnu.org/licenses/agpl-3.0.html).

## Information

Poppies Slot Machine is a blockchain-powered 3D slot machine game featuring three reels with four fruits: 🍒🍎🍌🍋. Players can win MON tokens, free spins, discounted spins, and exclusive NFTs.

## Features

- **Blockchain Integration**: Built on Monad Network with real MON token rewards
- **Wallet Connection**: Seamless integration with Privy wallet system
- **NFT Rewards**: Win rare Poppies NFTs and Mainnet Whitelist spots
- **Fully Responsive**: Optimized for desktop and mobile devices
- **3D Graphics**: Immersive Three.js-powered slot machine experience
- **Real-time Rewards**: Instant blockchain-based reward distribution
- **Onboarding System**: Step-by-step guide for new users
- **Help System**: Comprehensive reward information and game rules

### Game Controls

- **Spin**: Click the SPIN button or press SPACE
- **3D View**: Click and drag to rotate the slot machine
- **Wallet**: Connect your wallet to start playing
- **Help**: Click the help button for detailed information

## Reward System

### 🎁 NFT Rewards (No MON Cost)

| Reward | Chance | Description |
|--------|--------|-------------|
| 🌸 Rare Poppies NFT | 10% | Exclusive Poppies NFT collection |
| 🎫 Poppies Mainnet WL | 5% | Whitelist spot for mainnet launch |

### 💰 MON Rewards

#### Triple Matches (1.5% each)
| Fruits | Reward |
|--------|--------|
| 🍒🍒🍒 | 0.45 MON + 2 Free Spins |
| 🍎🍎🍎 | 0.27 MON + 3 Free Spins |
| 🍌🍌🍌 | 0.18 MON + 10 Discounted Spins |
| 🍋🍋🍋 | 0.135 MON + 1 Free Spin |

#### Double Matches (5% each)
| Fruits | Reward |
|--------|--------|
| 🍒🍒 | 0.18 MON + 1 Free Spin |
| 🍎🍎 | 0.135 MON |
| 🍌🍌 | 0.09 MON + 2 Free Spins |
| 🍋🍋 | 0.045 MON + 1 Free Spin |

#### Single Bonuses
| Fruit | Chance | Reward |
|-------|--------|--------|
| 🍒 | 15% | 0.018 MON |
| 🍎 | 10% | 1 Free Spin |
| 🍌 | 8% | 10 Discounted Spins |

#### Consolation Prize
- **12% chance**: 0.009 MON

### Spin Costs
- **Regular Spin**: 0.1 MON
- **Discounted Spin**: 0.01 MON (when available)
- **Free Spins**: 0 MON (when won)

### Statistics
- **80%** of spins give rewards
- **20%** of spins give nothing
- **15%** total NFT chance

**Note**: Slot machines only consider a match if the fruits appear consecutively from left to right.

## Smart Contract

The game is powered by a deployed smart contract on Monad Testnet:

- **Contract Address**: `0xCc53BEE0772B8A0Be08BCE3DD404bFCAC85E1635`
- **Network**: Monad Testnet (Chain ID: 10143)
- **Token**: MON (Monad's native token)

## Instructions

To run the project locally, follow these steps:

1. Install the project dependencies:

```bash
yarn
```

2. Start the development server:

```bash
yarn dev
```

3. Connect your wallet and start playing!

## Screenshots

### Desktop

![Game](./screenshots/game.png)
![Modal](./screenshots/modal.png)

### Mobile

![Game Mobile](./screenshots/game_mobile.png)
![Modal Mobile](./screenshots/modal_mobile.png)

## Technologies

The core technologies of Poppies Slot Machine include blockchain integration, 3D graphics, and modern web development:

| Name              | License | Description                                  |
| ----------------- | :-----: | -------------------------------------------- |
| React             |   MIT   | Component-based, front-end interface library |
| TypeScript        |   MIT   | Type-safe JavaScript development             |
| Three.js          |   MIT   | 3D graphics API for the web, based on WebGL  |
| React Three Fiber |   MIT   | A React renderer for Three.js                |
| Drei              |   MIT   | Useful helpers for React Three Fiber         |
| Ethers.js         |   MIT   | Ethereum library for blockchain interaction  |
| Privy             |   MIT   | Web3 authentication and wallet management    |
| Zustand           |   MIT   | State management                             |
| Vite              |   MIT   | Frontend development tooling                 |

## Blockchain Integration

- **Monad Network**: High-performance blockchain for fast transactions
- **Smart Contract**: Solidity-based slot machine logic
- **Wallet Integration**: Privy-powered seamless wallet connection
- **Real-time Updates**: Live balance and reward tracking

## Assets

All the assets used in Poppies Slot Machine (3D models, textures, images, sound effects, music etc.) are either using Creative Commons or in the Public Domain or they were created by me and can be freely used for commercial purposes. They were chosen primarily to enable rapid prototyping. Some (or most) of them should be replaced with more appropriate or professional assets.

## Software Used

A non-exhaustive list of all the software that was used during the development of Poppies Slot Machine.

- Visual Studio Code
- Blender
- Adobe Illustrator
- Krita
- Inkscape
- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Figma

## 💖 Support the Project

Thank you so much for your interest in my project! If you want to go a step further and support my open source work, buy me a coffee:

<a href='https://ko-fi.com/michaelkolesidis' target='_blank'><img src='https://cdn.ko-fi.com/cdn/kofi1.png' style='border:0px;height:45px;' alt='Buy Me a Coffee at ko-fi.com' /></a>

## License

<a href="https://www.gnu.org/licenses/agpl-3.0.html"><img src="https://upload.wikimedia.org/wikipedia/commons/0/06/AGPLv3_Logo.svg" height="100px" /></a>

Copyright (c) Michael Kolesidis  
Licensed under the [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.html).

🌸
