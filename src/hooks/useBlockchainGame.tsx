/*
 *  Copyright (c) Michael Kolesidis <michael.kolesidis@gmail.com>
 *  GNU Affero General Public License v3.0
 *
 *  ATTENTION! FREE SOFTWARE
 *  This website is free software (free as in freedom).
 *  If you use any part of this code, you must make your entire project's source code
 *  publicly available under the same license. This applies whether you modify the code
 *  or use it as it is in your own project. This ensures that all modifications and
 *  derivative works remain free software, so that everyone can benefit.
 *  If you are not willing to comply with these terms, you must refrain from using any part of this code.
 *
 *  For full license terms and conditions, you can read the AGPL-3.0 here:
 *  https://www.gnu.org/licenses/agpl-3.0.html
 */

import { useEffect, useState, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import useGame from '../stores/store';
import { SLOT_MACHINE_ADDRESS, SLOT_MACHINE_ABI } from '../utils/constants';

// Monad Testnet configuration - Chain ID 10143
export const MONAD_TESTNET = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
};

export function useBlockchainGame() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const setInsufficientFundsPopup = useGame((state) => state.setInsufficientFundsPopup);

  // Only use the Privy embedded wallet
  const privyWallet = wallets.find(w => w.walletClientType === 'privy');
  
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  // Blockchain state
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [monBalance, setMonBalance] = useState<string>('0');
  const [freeSpins, setFreeSpins] = useState<number>(0);
  const [discountedSpins, setDiscountedSpins] = useState<number>(0);
  const [hasDiscount, setHasDiscount] = useState<boolean>(false);
  const [rewardPool, setRewardPool] = useState<string>('0');
  const [networkError, setNetworkError] = useState<boolean>(false);

  // Gas settings for Monad testnet
  const getDynamicGasSettings = useCallback(async () => {
    if (!provider) {
      console.warn('⚠️ No provider available for gas estimation');
      return {
        gasLimit: 300000,
        maxFeePerGas: ethers.parseUnits('50', 'gwei'), // Higher fallback for Monad
        maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei')
      };
    }

    try {
      console.log('🔍 Getting current network gas prices...');
      
      // Get current network fee data
      const feeData = await provider.getFeeData();
      console.log('📊 Current network fee data:', {
        gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') + ' gwei' : 'N/A',
        maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') + ' gwei' : 'N/A',
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') + ' gwei' : 'N/A'
      });

      // Use network fee data with reasonable multipliers for Monad testnet
      let maxFeePerGas = ethers.parseUnits('50', 'gwei'); // Default for Monad
      let maxPriorityFeePerGas = ethers.parseUnits('2', 'gwei'); // Default for Monad
      
      if (feeData.maxFeePerGas) {
        maxFeePerGas = feeData.maxFeePerGas * 120n / 100n; // 20% buffer
      }
      if (feeData.maxPriorityFeePerGas) {
        maxPriorityFeePerGas = feeData.maxPriorityFeePerGas * 120n / 100n; // 20% buffer
      }

      // Ensure minimum values for Monad testnet
      const minMaxFee = ethers.parseUnits('20', 'gwei');
      const minPriorityFee = ethers.parseUnits('1', 'gwei');
      
      if (maxFeePerGas < minMaxFee) maxFeePerGas = minMaxFee;
      if (maxPriorityFeePerGas < minPriorityFee) maxPriorityFeePerGas = minPriorityFee;

      const gasSettings = {
        gasLimit: 300000,
        maxFeePerGas,
        maxPriorityFeePerGas
      };

      console.log('✅ Using Monad-optimized gas settings:', {
        gasLimit: gasSettings.gasLimit,
        maxFeePerGas: ethers.formatUnits(gasSettings.maxFeePerGas, 'gwei') + ' gwei',
        maxPriorityFeePerGas: ethers.formatUnits(gasSettings.maxPriorityFeePerGas, 'gwei') + ' gwei'
      });

      return gasSettings;
    } catch (error) {
      console.warn('⚠️ Failed to get dynamic gas settings, using Monad fallback:', error);
      
      return {
        gasLimit: 300000,
        maxFeePerGas: ethers.parseUnits('50', 'gwei'), // Higher for Monad testnet
        maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei')
      };
    }
  }, [provider]);

  // Initialize provider, signer, and contract when Privy wallet is ready
  useEffect(() => {
    async function setup() {
      if (ready && authenticated && privyWallet) {
        try {
          console.log('Setting up Privy wallet...');
          const ethProvider = await privyWallet.getEthereumProvider();
          
          // Configure provider for Monad Testnet
          const ethersProvider = new ethers.BrowserProvider(ethProvider, {
            name: 'monad-testnet',
            chainId: 10143,
          });
          
          // Switch to Monad Testnet if needed
          try {
            await ethProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${MONAD_TESTNET.id.toString(16)}` }],
            });
          } catch (switchError: any) {
            // If the chain doesn't exist, add it
            if (switchError.code === 4902) {
              await ethProvider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${MONAD_TESTNET.id.toString(16)}`,
                  chainName: MONAD_TESTNET.name,
                  nativeCurrency: MONAD_TESTNET.nativeCurrency,
                  rpcUrls: MONAD_TESTNET.rpcUrls.default.http,
                  blockExplorerUrls: [MONAD_TESTNET.blockExplorers.default.url],
                }],
              });
            }
          }
          
          setProvider(ethersProvider);
          
          const ethersSigner = await ethersProvider.getSigner();
          setSigner(ethersSigner);
          
          const address = await ethersSigner.getAddress();
          setWalletAddress(address);
          console.log('Wallet address:', address);
          
          const slotContract = new ethers.Contract(SLOT_MACHINE_ADDRESS, SLOT_MACHINE_ABI, ethersSigner);
          setContract(slotContract);
          console.log('Contract initialized');
          
          setNetworkError(false);
        } catch (error) {
          console.error('Error setting up wallet:', error);
          setNetworkError(true);
        }
      }
    }
    setup();
  }, [ready, authenticated, privyWallet]);

  // Fetch blockchain state
  const fetchState = useCallback(async () => {
    if (contract && walletAddress && provider) {
      try {
        console.log('Fetching blockchain state...');
        
        // Fetch balance
        try {
          const balance = await provider.getBalance(walletAddress);
          setMonBalance(ethers.formatEther(balance));
          console.log('MON Balance:', ethers.formatEther(balance));
          setNetworkError(false);
        } catch (balanceError) {
          console.error('Error fetching balance:', balanceError);
          setNetworkError(true);
        }
        
        // Fetch contract state with parallel calls for speed
        try {
          const [freeSpinsResult, discountedSpinsResult, hasDiscountResult, rewardPoolResult] = await Promise.allSettled([
            contract.freeSpins(walletAddress),
            contract.discountedSpins(walletAddress),
            contract.hasDiscount(walletAddress),
            contract.getRewardPool()
          ]);

          if (freeSpinsResult.status === 'fulfilled') {
            setFreeSpins(Number(freeSpinsResult.value));
          }
          if (discountedSpinsResult.status === 'fulfilled') {
            setDiscountedSpins(Number(discountedSpinsResult.value));
          }
          if (hasDiscountResult.status === 'fulfilled') {
            setHasDiscount(Boolean(hasDiscountResult.value));
          }
          if (rewardPoolResult.status === 'fulfilled') {
            setRewardPool(ethers.formatEther(rewardPoolResult.value));
          }
        } catch (error) {
          console.error('Error fetching contract state:', error);
          setNetworkError(true);
        }
        
        console.log('State fetched successfully');
      } catch (error) {
        console.error('Error fetching state:', error);
        setNetworkError(true);
      }
    }
  }, [contract, walletAddress, provider]);

  const getSpinCost = useCallback(() => {
    if (freeSpins > 0) return 'Free';
    if (hasDiscount && discountedSpins > 0) return '0.01 MON';
    return '0.1 MON';
  }, [freeSpins, hasDiscount, discountedSpins]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // REAL blockchain spin function
  const spin = useCallback(async () => {
    if (!contract || !signer || !provider) {
      console.error('Contract not ready');
      return null;
    }
    
    if (networkError) {
      console.error('Network connection issues');
      return null;
    }
    
    try {
      // Determine spin cost
      let cost = ethers.parseEther('0.1'); // Default spin cost
      if (freeSpins > 0) {
        cost = ethers.parseEther('0');
      } else if (hasDiscount && discountedSpins > 0) {
        cost = ethers.parseEther('0.01'); // Discounted spin cost
      }
      
      console.log(`🎰 Starting blockchain spin with cost: ${ethers.formatEther(cost)} MON`);
      console.log(`📊 Current state - Free: ${freeSpins}, Discounted: ${discountedSpins}, HasDiscount: ${hasDiscount}`);
      
      // Get gas settings
      const gasSettings = await getDynamicGasSettings();
      
      const txParams = {
        value: cost,
        ...gasSettings
      };
      
      console.log('📊 Using gas settings:', {
        gasLimit: txParams.gasLimit.toString(),
        maxFeePerGas: ethers.formatUnits(txParams.maxFeePerGas, 'gwei') + ' gwei',
        maxPriorityFeePerGas: ethers.formatUnits(txParams.maxPriorityFeePerGas, 'gwei') + ' gwei'
      });
      
      // Send transaction
      const tx = await contract.spin(txParams);
      console.log('📤 Transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt.hash);
      
      // Parse transaction logs
      console.log('🔍 Parsing transaction logs...');
      console.log('📋 Total logs found:', receipt.logs.length);
      
      let spinResultEvent = null;
      
      // Try to find SpinResult event
      for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        try {
          const parsed = contract.interface.parseLog(log);
          console.log(`📝 Log ${i}: ${parsed?.name || 'Unknown'}`);
          
          if (parsed?.name === 'SpinResult') {
            spinResultEvent = parsed;
            console.log('🎯 Found SpinResult event!');
            break;
          }
        } catch (parseError) {
          console.log(`⚠️ Could not parse log ${i}:`, parseError);
        }
      }
      
      if (spinResultEvent) {
        const { 
          combination, 
          monReward, 
          extraSpins, 
          poppiesNftWon, 
          rarestPending, 
          discountApplied, 
          newDiscountGranted 
        } = spinResultEvent.args;
        
        // Parse combination into fruit array
        const fruits = combination.split('|');
        const rewardAmount = ethers.formatEther(monReward);
        
        const result = {
          combination: fruits,
          monReward: rewardAmount,
          extraSpins: Number(extraSpins),
          poppiesNftWon, // New: Poppies NFT won
          rarestPending, // New: Poppies Mainnet WL pending
          discountApplied,
          newDiscountGranted,
          txHash: receipt.hash
        };
        
        console.log('🎯 Blockchain result:', {
          combination: fruits.join(' | '),
          monReward: rewardAmount + ' MON',
          extraSpins: Number(extraSpins),
          poppiesNftWon: poppiesNftWon ? 'YES' : 'NO',
          rarestPending: rarestPending ? 'YES' : 'NO',
          discountApplied: discountApplied ? 'YES' : 'NO',
          newDiscountGranted: newDiscountGranted ? 'YES' : 'NO',
          txHash: receipt.hash
        });
        
        // Refresh state in background
        setTimeout(() => {
          fetchState();
        }, 2000);
        
        return result;
      } else {
        console.error('❌ No SpinResult event found in transaction logs');
        console.log('📋 All logs:', receipt.logs);
        return null;
      }
      
    } catch (error: any) {
      console.error('❌ Blockchain spin failed:', error);
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        console.error('❌ Insufficient MON balance');
        console.log('🚨 Triggering insufficient funds popup');
        // Show insufficient funds popup instead of just logging
        setInsufficientFundsPopup(true);
      } else if (error.code === 'USER_REJECTED') {
        console.error('❌ Transaction cancelled');
      } else if (error.message?.includes('execution reverted')) {
        console.error('❌ Contract execution reverted:', error.message);
      }
      
      return null;
    }
  }, [contract, signer, provider, freeSpins, hasDiscount, discountedSpins, networkError, fetchState, getDynamicGasSettings, setInsufficientFundsPopup]);

  return {
    ready,
    authenticated,
    walletAddress,
    monBalance,
    freeSpins,
    discountedSpins,
    hasDiscount,
    rewardPool,
    networkError,
    spin,
    getSpinCost,
    refreshState: fetchState,
  };
}