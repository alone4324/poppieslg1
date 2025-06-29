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
  
  // Audio refs
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const jackpotSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const loseSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const whooshSoundRef = useRef<HTMLAudioElement | null>(null);
  const errorSoundRef = useRef<HTMLAudioElement | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    // Background music - calm casino ambient
    backgroundMusicRef.current = new Audio('https://www.soundjay.com/misc/sounds/casino-ambience-1.mp3');
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = 0.3 * masterVolume;

    // Spin sound - casino wheel spinning
    spinSoundRef.current = new Audio('https://www.soundjay.com/misc/sounds/slot-machine-1.mp3');
    spinSoundRef.current.volume = 0.6 * masterVolume;

    // Jackpot sound - big win celebration
    jackpotSoundRef.current = new Audio('https://www.soundjay.com/misc/sounds/jackpot-1.mp3');
    jackpotSoundRef.current.volume = 0.8 * masterVolume;

    // Win sound - smaller win celebration
    winSoundRef.current = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
    winSoundRef.current.volume = 0.5 * masterVolume;

    // Lose sound - subtle disappointment
    loseSoundRef.current = new Audio('https://www.soundjay.com/misc/sounds/fail-buzzer-02.mp3');
    loseSoundRef.current.volume = 0.4 * masterVolume;

    // Click sound - UI interactions
    clickSoundRef.current = new Audio('https://www.soundjay.com/misc/sounds/click-1.mp3');
    clickSoundRef.current.volume = 0.3 * masterVolume;

    // Whoosh sound - navigation transitions
    whooshSoundRef.current = new Audio('https://www.soundjay.com/misc/sounds/whoosh-1.mp3');
    whooshSoundRef.current.volume = 0.4 * masterVolume;

    // Error sound - insufficient funds, errors
    errorSoundRef.current = new Audio('https://www.soundjay.com/misc/sounds/error-1.mp3');
    errorSoundRef.current.volume = 0.5 * masterVolume;

    // Notification sound - general notifications
    notificationSoundRef.current = new Audio('https://www.soundjay.com/misc/sounds/notification-1.mp3');
    notificationSoundRef.current.volume = 0.4 * masterVolume;

    // Fallback to local sounds if external URLs fail
    const setupFallbackSounds = () => {
      // Create simple synthetic sounds as fallbacks
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const createTone = (frequency: number, duration: number, volume: number = 0.3) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      };

      // Setup fallback functions
      (window as any).fallbackSounds = {
        spin: () => createTone(220, 1.5, 0.2),
        jackpot: () => {
          createTone(523, 0.3, 0.4);
          setTimeout(() => createTone(659, 0.3, 0.4), 100);
          setTimeout(() => createTone(784, 0.5, 0.4), 200);
        },
        win: () => createTone(523, 0.5, 0.3),
        lose: () => createTone(147, 0.8, 0.2),
        click: () => createTone(800, 0.1, 0.2),
        whoosh: () => {
          for (let i = 0; i < 10; i++) {
            setTimeout(() => createTone(200 + i * 50, 0.05, 0.1), i * 20);
          }
        },
        error: () => {
          createTone(200, 0.2, 0.3);
          setTimeout(() => createTone(150, 0.3, 0.3), 150);
        },
        notification: () => createTone(440, 0.3, 0.2)
      };
    };

    // Setup fallbacks
    try {
      setupFallbackSounds();
    } catch (error) {
      console.warn('Could not setup audio context for fallback sounds:', error);
    }

    return () => {
      // Cleanup
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
    };
  }, [masterVolume]);

  // Play sound with fallback
  const playSound = useCallback((audioRef: React.RefObject<HTMLAudioElement>, fallbackName: string) => {
    if (isMuted) return;

    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          // Fallback to synthetic sound
          if ((window as any).fallbackSounds && (window as any).fallbackSounds[fallbackName]) {
            (window as any).fallbackSounds[fallbackName]();
          }
        });
      } else {
        // Use fallback immediately
        if ((window as any).fallbackSounds && (window as any).fallbackSounds[fallbackName]) {
          (window as any).fallbackSounds[fallbackName]();
        }
      }
    } catch (error) {
      console.warn(`Could not play ${fallbackName} sound:`, error);
    }
  }, [isMuted]);

  const playBackgroundMusic = useCallback(() => {
    if (isMuted || !backgroundMusicRef.current) return;
    
    try {
      backgroundMusicRef.current.play().catch((error) => {
        console.warn('Could not play background music:', error);
      });
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
    playSound(spinSoundRef, 'spin');
  }, [playSound]);

  const playJackpotSound = useCallback(() => {
    playSound(jackpotSoundRef, 'jackpot');
  }, [playSound]);

  const playWinSound = useCallback(() => {
    playSound(winSoundRef, 'win');
  }, [playSound]);

  const playLoseSound = useCallback(() => {
    playSound(loseSoundRef, 'lose');
  }, [playSound]);

  const playClickSound = useCallback(() => {
    playSound(clickSoundRef, 'click');
  }, [playSound]);

  const playWhooshSound = useCallback(() => {
    playSound(whooshSoundRef, 'whoosh');
  }, [playSound]);

  const playErrorSound = useCallback(() => {
    playSound(errorSoundRef, 'error');
  }, [playSound]);

  const playNotificationSound = useCallback(() => {
    playSound(notificationSoundRef, 'notification');
  }, [playSound]);

  const setMasterVolume = useCallback((volume: number) => {
    setMasterVolumeState(volume);
    
    // Update all audio volumes
    if (backgroundMusicRef.current) backgroundMusicRef.current.volume = 0.3 * volume;
    if (spinSoundRef.current) spinSoundRef.current.volume = 0.6 * volume;
    if (jackpotSoundRef.current) jackpotSoundRef.current.volume = 0.8 * volume;
    if (winSoundRef.current) winSoundRef.current.volume = 0.5 * volume;
    if (loseSoundRef.current) loseSoundRef.current.volume = 0.4 * volume;
    if (clickSoundRef.current) clickSoundRef.current.volume = 0.3 * volume;
    if (whooshSoundRef.current) whooshSoundRef.current.volume = 0.4 * volume;
    if (errorSoundRef.current) errorSoundRef.current.volume = 0.5 * volume;
    if (notificationSoundRef.current) notificationSoundRef.current.volume = 0.4 * volume;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopBackgroundMusic();
    } else {
      playBackgroundMusic();
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