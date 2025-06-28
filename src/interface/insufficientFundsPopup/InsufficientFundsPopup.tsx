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

import { useState, useEffect } from 'react';
import useGame from '../../stores/store';
import { useBlockchainGame } from '../../hooks/useBlockchainGame';
import './style.css';

const InsufficientFundsPopup = () => {
  const { walletAddress, monBalance, getSpinCost, refreshState } = useBlockchainGame();
  const setInsufficientFundsPopup = useGame((state) => state.setInsufficientFundsPopup);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log('🎭 InsufficientFundsPopup mounted with:', {
    walletAddress,
    monBalance,
    spinCost: getSpinCost()
  });

  const handleCopyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshState();
      
      // Check if user now has sufficient funds after refresh
      const currentBalance = parseFloat(monBalance || '0');
      const spinCost = getSpinCost();
      
      console.log('🔄 After refresh - Checking funds:', {
        currentBalance,
        spinCost,
        monBalance
      });
      
      if (spinCost === 'Free' || 
          (spinCost === '0.01 MON' && currentBalance >= 0.01) ||
          (spinCost === '0.1 MON' && currentBalance >= 0.1)) {
        console.log('✅ Sufficient funds detected after refresh, closing popup');
        setInsufficientFundsPopup(false);
      } else {
        console.log('❌ Still insufficient funds after refresh');
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClose = () => {
    // Only close if user has sufficient funds
    const currentBalance = parseFloat(monBalance || '0');
    const spinCost = getSpinCost();
    
    if (spinCost === 'Free' || 
        (spinCost === '0.01 MON' && currentBalance >= 0.01) ||
        (spinCost === '0.1 MON' && currentBalance >= 0.1)) {
      // User has sufficient funds, close popup
      setInsufficientFundsPopup(false);
    }
    // If user still has insufficient funds, don't close
  };

  return (
    <div className="insufficient-funds-modal" onClick={handleClose}>
      <div className="insufficient-funds-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="insufficient-funds-modal-main">
          <div className="insufficient-funds-title">
            💰 Insufficient Funds
          </div>
          
          <div className="insufficient-funds-text">
            You need more MON tokens to continue playing!
          </div>

          <div className="insufficient-funds-balance">
            <div className="balance-row">
              <span>Current Balance:</span>
              <span className="balance-value">{parseFloat(monBalance || '0').toFixed(3)} MON</span>
            </div>
            <div className="balance-row">
              <span>Next Spin Cost:</span>
              <span className="balance-value">{getSpinCost()}</span>
            </div>
          </div>

          <div className="insufficient-funds-text">
            Your Wallet Address:
          </div>

          <div className="wallet-address-container">
            <div className="wallet-address-text">
              {walletAddress}
            </div>
            <button 
              className={`copy-button ${copied ? 'copied' : ''}`}
              onClick={handleCopyAddress}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>

          <div className="funding-steps">
            <div className="step">1. Copy your wallet address above</div>
            <div className="step">2. Send testnet MON tokens from another wallet</div>
            <div className="step">3. Click "Check Balance" below to refresh</div>
          </div>

          <div className="testnet-note">
            <strong>Note:</strong> This is on Monad Testnet. Get testnet MON from faucets.
          </div>

          <div className="insufficient-funds-actions">
            <button 
              className="refresh-button"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? '🔄 Checking...' : '🔄 Check Balance'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsufficientFundsPopup; 