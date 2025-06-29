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
import { Canvas } from '@react-three/fiber';
import Interface from './interface/Interface';
import Game from './Game';

const App = () => {
  const [windowWidth] = useState(window.innerWidth);
  const cameraPositionZ = windowWidth > 500 ? 30 : 40;

  // Enable audio context on first user interaction
  useEffect(() => {
    const enableAudio = () => {
      // Resume audio context if it's suspended
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
      }
    };

    // Add event listeners for first user interaction
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, enableAudio, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, enableAudio);
      });
    };
  }, []);

  return (
    <>
      <Interface />
      <Canvas 
        className="slot-machine"
        camera={{ fov: 75, position: [0, 0, cameraPositionZ] }}
      >
        <Game />
      </Canvas>
    </>
  );
};

export default App;