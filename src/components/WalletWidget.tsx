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

import { useState } from 'react';
import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth';
import { useBlockchainGame } from '../hooks/useBlockchainGame';
import { useSoundManager } from '../hooks/useSoundManager';
import './WalletWidget.css';

const WalletWidget = () => {
  const { authenticated } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    walletAddress,
    monBalance,
    freeSpins,
    discountedSpins,
    hasDiscount,
    rewardPool,
    getSpinCost,
    refreshState,
  } = useBlockchainGame();

  const { playClickSound, playNotificationSound } = useSoundManager();

  const handleRefresh = () => {
    playClickSound();
    refreshState();
  };

  const handleLogin = () => {
    playClickSound();
    login();
  };

  const handleLogout = () => {
    playClickSound();
    logout();
  };

  const handleExpand = () => {
    playClickSound();
    setIsExpanded(!isExpanded);
  };

  if (!authenticated) {
    return (
      <div className="wallet-widget">
        <button className="wallet-login-btn" onClick={handleLogin}>
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-widget">
      <div 
        className="wallet-header" 
        onClick={handleExpand}
      >
        <div className="wallet-address">
          {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Loading...'}
        </div>
        <div className="wallet-balance">
          {parseFloat(monBalance || '0').toFixed(3)} MON
        </div>
        <div className={`wallet-arrow ${isExpanded ? 'expanded' : ''}`}>▼</div>
      </div>
      {isExpanded && (
        <div className="wallet-details">
          <div className="wallet-detail-row">
            <span>Next Spin Cost:</span>
            <span className="spin-cost">{getSpinCost()}</span>
          </div>
          <div className="wallet-detail-row">
            <span>Free Spins:</span>
            <span className="free-spins">{freeSpins}</span>
          </div>
          <div className="wallet-detail-row">
            <span>Discounted Spins:</span>
            <span className="discounted-spins">{hasDiscount ? discountedSpins : 0}</span>
          </div>
          <div className="wallet-detail-row">
            <span>Reward Pool:</span>
            <span className="reward-pool">{parseFloat(rewardPool || '0').toFixed(3)} MON</span>
          </div>
          <div className="wallet-actions">
            <button className="wallet-refresh-btn" onClick={handleRefresh}>
              🔄 Refresh
            </button>
            <button className="wallet-logout-btn" onClick={handleLogout}>
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletWidget;