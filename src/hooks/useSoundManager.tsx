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

import { useEffect, useRef, useState, useCallback } from 'react';

interface SoundManager {
  playBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  playSpinSound: () => void;
  playJackpotSound: () => void;
  playWinSound: () => void;
  playLoseSound: () => void;
  playClickSound: () => void;
  playWhooshSound: () => void;
  playErrorSound: () => void;
  playNotificationSound: () => void;
  setMasterVolume: (volume: number) => void;
  toggleMute: () => void;
  isMuted: boolean;
}

export const useSoundManager = (): SoundManager => {
  const [isMuted, setIsMuted] = useState(false);
  const [masterVolume, setMasterVolumeState] = useState(0.7);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Audio refs
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio context and synthetic sounds
  useEffect(() => {
    const initAudioContext = () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
        
        // Resume context if suspended
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
      } catch (error) {
        console.warn('Could not create audio context:', error);
      }
    };

    initAudioContext();

    // Try to load background music from multiple sources
    const backgroundSources = [
      'https://www.bensound.com/bensound-music/bensound-casino.mp3',
      'https://audio.jukehost.co.uk/casino-ambient.mp3',
      '/sounds/background.mp3' // Local fallback
    ];

    const tryLoadBackground = (sources: string[], index = 0) => {
      if (index >= sources.length) {
        console.warn('Could not load background music from any source');
        return;
      }

      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      
      audio.addEventListener('canplaythrough', () => {
        backgroundMusicRef.current = audio;
        audio.loop = true;
        audio.volume = 0.3 * masterVolume;
        console.log('Background music loaded successfully');
      });

      audio.addEventListener('error', () => {
        console.warn(`Failed to load background music from: ${sources[index]}`);
        tryLoadBackground(sources, index + 1);
      });

      audio.src = sources[index];
      audio.load();
    };

    tryLoadBackground(backgroundSources);

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [masterVolume]);

  // Create synthetic sounds using Web Audio API
  const createSyntheticSound = useCallback((type: string) => {
    if (!audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();
      
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const now = audioContext.currentTime;
      const volume = masterVolume * 0.3;

      switch (type) {
        case 'spin':
          // Spinning wheel sound - low frequency sweep
          oscillator.frequency.setValueAtTime(100, now);
          oscillator.frequency.exponentialRampToValueAtTime(300, now + 1.5);
          oscillator.type = 'sawtooth';
          filterNode.frequency.setValueAtTime(500, now);
          filterNode.frequency.exponentialRampToValueAtTime(2000, now + 1.5);
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(volume, now + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
          oscillator.start(now);
          oscillator.stop(now + 1.5);
          break;

        case 'jackpot':
          // Big celebration - ascending notes
          const frequencies = [523, 659, 784, 1047]; // C, E, G, C
          frequencies.forEach((freq, i) => {
            setTimeout(() => {
              const osc = audioContext.createOscillator();
              const gain = audioContext.createGain();
              osc.connect(gain);
              gain.connect(audioContext.destination);
              
              osc.frequency.value = freq;
              osc.type = 'triangle';
              gain.gain.setValueAtTime(0, audioContext.currentTime);
              gain.gain.linearRampToValueAtTime(volume * 0.8, audioContext.currentTime + 0.05);
              gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
              
              osc.start();
              osc.stop(audioContext.currentTime + 0.5);
            }, i * 150);
          });
          return;

        case 'win':
          // Pleasant win sound
          oscillator.frequency.setValueAtTime(523, now); // C note
          oscillator.frequency.linearRampToValueAtTime(659, now + 0.2); // E note
          oscillator.type = 'triangle';
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(volume * 0.6, now + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          oscillator.start(now);
          oscillator.stop(now + 0.5);
          break;

        case 'lose':
          // Descending disappointment sound
          oscillator.frequency.setValueAtTime(300, now);
          oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.8);
          oscillator.type = 'sawtooth';
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(volume * 0.4, now + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
          oscillator.start(now);
          oscillator.stop(now + 0.8);
          break;

        case 'click':
          // Short click sound
          oscillator.frequency.value = 800;
          oscillator.type = 'square';
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(volume * 0.3, now + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          oscillator.start(now);
          oscillator.stop(now + 0.1);
          break;

        case 'whoosh':
          // Whoosh sound - noise sweep
          const bufferSize = audioContext.sampleRate * 0.5;
          const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
          const data = buffer.getChannelData(0);
          
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
          }
          
          const noise = audioContext.createBufferSource();
          noise.buffer = buffer;
          
          const filter = audioContext.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(2000, now);
          filter.frequency.exponentialRampToValueAtTime(200, now + 0.5);
          
          const gain = audioContext.createGain();
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(audioContext.destination);
          
          noise.start(now);
          noise.stop(now + 0.5);
          return;

        case 'error':
          // Error buzz
          oscillator.frequency.setValueAtTime(200, now);
          oscillator.frequency.setValueAtTime(180, now + 0.1);
          oscillator.frequency.setValueAtTime(200, now + 0.2);
          oscillator.frequency.setValueAtTime(180, now + 0.3);
          oscillator.type = 'square';
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(volume * 0.5, now + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          oscillator.start(now);
          oscillator.stop(now + 0.4);
          break;

        case 'notification':
          // Pleasant notification
          oscillator.frequency.setValueAtTime(440, now); // A note
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(volume * 0.4, now + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          oscillator.start(now);
          oscillator.stop(now + 0.3);
          break;

        default:
          oscillator.frequency.value = 440;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(volume * 0.3, now + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          oscillator.start(now);
          oscillator.stop(now + 0.2);
      }
    } catch (error) {
      console.warn(`Could not create synthetic sound for ${type}:`, error);
    }
  }, [audioContext, masterVolume]);

  const playBackgroundMusic = useCallback(() => {
    if (isMuted) return;
    
    try {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.play().catch((error) => {
          console.warn('Could not play background music:', error);
        });
      }
    } catch (error) {
      console.warn('Background music error:', error);
    }
  }, [isMuted]);

  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
  }, []);

  const playSpinSound = useCallback(() => {
    if (!isMuted) {
      createSyntheticSound('spin');
    }
  }, [isMuted, createSyntheticSound]);

  const playJackpotSound = useCallback(() => {
    if (!isMuted) {
      createSyntheticSound('jackpot');
    }
  }, [isMuted, createSyntheticSound]);

  const playWinSound = useCallback(() => {
    if (!isMuted) {
      createSyntheticSound('win');
    }
  }, [isMuted, createSyntheticSound]);

  const playLoseSound = useCallback(() => {
    if (!isMuted) {
      createSyntheticSound('lose');
    }
  }, [isMuted, createSyntheticSound]);

  const playClickSound = useCallback(() => {
    if (!isMuted) {
      createSyntheticSound('click');
    }
  }, [isMuted, createSyntheticSound]);

  const playWhooshSound = useCallback(() => {
    if (!isMuted) {
      createSyntheticSound('whoosh');
    }
  }, [isMuted, createSyntheticSound]);

  const playErrorSound = useCallback(() => {
    if (!isMuted) {
      createSyntheticSound('error');
    }
  }, [isMuted, createSyntheticSound]);

  const playNotificationSound = useCallback(() => {
    if (!isMuted) {
      createSyntheticSound('notification');
    }
  }, [isMuted, createSyntheticSound]);

  const setMasterVolume = useCallback((volume: number) => {
    setMasterVolumeState(volume);
    
    // Update background music volume
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = 0.3 * volume;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (newMutedState) {
      stopBackgroundMusic();
    } else {
      // Small delay to ensure audio context is ready
      setTimeout(() => {
        playBackgroundMusic();
      }, 100);
    }
  }, [isMuted, stopBackgroundMusic, playBackgroundMusic]);

  return {
    playBackgroundMusic,
    stopBackgroundMusic,
    playSpinSound,
    playJackpotSound,
    playWinSound,
    playLoseSound,
    playClickSound,
    playWhooshSound,
    playErrorSound,
    playNotificationSound,
    setMasterVolume,
    toggleMute,
    isMuted
  };
};