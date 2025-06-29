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

import useGame from '../../stores/store';
import './style.css';

const Modal = () => {
  const { setModal } = useGame();

  return (
    <div className="modal" onClick={() => setModal(false)}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-main">
          <div className="modal-title">🎰 Poppies Slot Machine</div>
          
          <div className="modal-section">
            <div className="modal-subtitle">How to Play</div>
            <div className="modal-text">
              Click on the SPIN button or press SPACE to spin.
            </div>
            <div className="modal-text">
              Matches are counted from left to right consecutively.
            </div>
            <div className="modal-text">Click and drag to rotate the 3D view</div>
          </div>

          <div className="modal-section">
            <div className="modal-subtitle">Spin Costs</div>
            <div className="modal-text">
              Regular Spin: <span className="highlight">0.1 MON</span>
            </div>
            <div className="modal-text">
              Discounted Spin: <span className="highlight">0.01 MON</span> (when available)
            </div>
            <div className="modal-text">
              Free Spins: <span className="highlight">0 MON</span> (when won)
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-subtitle">🎁 NFT Rewards</div>
            <div className="modal-text nft-reward">
              🌸 <span className="highlight">Rare Poppies NFT</span> - 10% chance
            </div>
            <div className="modal-text nft-reward">
              🎫 <span className="highlight">Poppies Mainnet WL</span> - 5% chance
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-subtitle">💰 MON Rewards</div>
            
            <div className="modal-subsection">
              <div className="modal-subtitle-small">Triple Matches (1.5% each)</div>
              <div className="modal-text">
                <img className="modal-image" src="./images/cherry.png" />
                <img className="modal-image" src="./images/cherry.png" />
                <img className="modal-image" src="./images/cherry.png" />
                <span> 0.45 MON + 2 Free Spins </span>
              </div>
              <div className="modal-text">
                <img className="modal-image" src="./images/apple.png" />
                <img className="modal-image" src="./images/apple.png" />
                <img className="modal-image" src="./images/apple.png" />
                <span> 0.27 MON + 3 Free Spins </span>
              </div>
              <div className="modal-text">
                <img className="modal-image" src="./images/banana.png" />
                <img className="modal-image" src="./images/banana.png" />
                <img className="modal-image" src="./images/banana.png" />
                <span> 0.18 MON + 10 Discounted Spins </span>
              </div>
              <div className="modal-text">
                <img className="modal-image" src="./images/lemon.png" />
                <img className="modal-image" src="./images/lemon.png" />
                <img className="modal-image" src="./images/lemon.png" />
                <span> 0.135 MON + 1 Free Spin </span>
              </div>
            </div>

            <div className="modal-subsection">
              <div className="modal-subtitle-small">Double Matches (5% each)</div>
              <div className="modal-text">
                <img className="modal-image" src="./images/cherry.png" />
                <img className="modal-image" src="./images/cherry.png" />
                <span> 0.18 MON + 1 Free Spin </span>
              </div>
              <div className="modal-text">
                <img className="modal-image" src="./images/apple.png" />
                <img className="modal-image" src="./images/apple.png" />
                <span> 0.135 MON </span>
              </div>
              <div className="modal-text">
                <img className="modal-image" src="./images/banana.png" />
                <img className="modal-image" src="./images/banana.png" />
                <span> 0.09 MON + 2 Free Spins </span>
              </div>
              <div className="modal-text">
                <img className="modal-image" src="./images/lemon.png" />
                <img className="modal-image" src="./images/lemon.png" />
                <span> 0.045 MON + 1 Free Spin </span>
              </div>
            </div>

            <div className="modal-subsection">
              <div className="modal-subtitle-small">Single Bonuses</div>
              <div className="modal-text">
                <img className="modal-image" src="./images/cherry.png" />
                <span> 0.018 MON (15% chance) </span>
              </div>
              <div className="modal-text">
                <img className="modal-image" src="./images/apple.png" />
                <span> 1 Free Spin (10% chance) </span>
              </div>
              <div className="modal-text">
                <img className="modal-image" src="./images/banana.png" />
                <span> 10 Discounted Spins (8% chance) </span>
              </div>
            </div>

            <div className="modal-subsection">
              <div className="modal-subtitle-small">Consolation Prize</div>
              <div className="modal-text">
                <span> 0.009 MON (12% chance) </span>
              </div>
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-subtitle">📊 Statistics</div>
            <div className="modal-text">
              • <span className="highlight">80%</span> of spins give rewards
            </div>
            <div className="modal-text">
              • <span className="highlight">20%</span> of spins give nothing
            </div>
            <div className="modal-text">
              • <span className="highlight">15%</span> total NFT chance
            </div>
          </div>

          <div className="modal-footer">
            <div>
              <a
                className="modal-text"
                href="https://michaelkolesidis.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                © Michael Kolesidis
              </a>
            </div>
            <div>
              <a
                className="modal-text"
                href="https://github.com/michaelkolesidis/cherry-charm"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
            <div>
              <a
                className="modal-license modal-text"
                href="https://www.gnu.org/licenses/agpl-3.0.en.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Licensed under the GNU AGPL 3.0
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
