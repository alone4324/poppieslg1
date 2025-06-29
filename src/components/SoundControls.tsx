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
import { useSoundManager } from '../hooks/useSoundManager';
import './SoundControls.css';

const SoundControls = () => {
  const { toggleMute, setMasterVolume, isMuted } = useSoundManager();
  const [volume, setVolume] = useState(70);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    setMasterVolume(newVolume / 100);
  };

  return (
    <div className="sound-controls">
      <button 
        className="sound-toggle-btn"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Sound Controls"
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
      
      {isExpanded && (
        <div className="sound-panel">
          <div className="sound-row">
            <button 
              className={`mute-btn ${isMuted ? 'muted' : ''}`}
              onClick={toggleMute}
            >
              {isMuted ? '🔇 Unmute' : '🔊 Mute'}
            </button>
          </div>
          
          <div className="sound-row">
            <label htmlFor="volume-slider">Volume:</label>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              disabled={isMuted}
            />
            <span className="volume-display">{volume}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundControls;