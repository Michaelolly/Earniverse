
import { useEffect, useState, useRef } from 'react';

type SoundType = 'background' | 'takeoff' | 'cashout' | 'crash' | 'bet';

export const useAviatorSounds = () => {
  const [muted, setMuted] = useState(true);
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    background: null,
    takeoff: null,
    cashout: null,
    crash: null,
    bet: null
  });
  
  useEffect(() => {
    // Initialize audio elements
    audioRefs.current.background = new Audio('/sounds/aviator-background.mp3');
    audioRefs.current.takeoff = new Audio('/sounds/takeoff.mp3');
    audioRefs.current.cashout = new Audio('/sounds/cashout.mp3');
    audioRefs.current.crash = new Audio('/sounds/crash.mp3');
    audioRefs.current.bet = new Audio('/sounds/bet.mp3');
    
    // Set properties for looping background music
    if (audioRefs.current.background) {
      audioRefs.current.background.loop = true;
      audioRefs.current.background.volume = 0.3;
    }
    
    return () => {
      // Clean up all audio
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);
  
  const playSound = (type: SoundType) => {
    if (muted) return;
    
    const audio = audioRefs.current[type];
    if (audio) {
      // For non-background sounds, reset before playing
      if (type !== 'background') {
        audio.currentTime = 0;
      }
      audio.play().catch(err => console.error('Error playing sound:', err));
    }
  };
  
  const stopSound = (type: SoundType) => {
    const audio = audioRefs.current[type];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };
  
  const toggleMute = () => {
    setMuted(!muted);
    
    if (muted) {
      // Unmuting - start background music
      playSound('background');
    } else {
      // Muting - stop all sounds
      Object.keys(audioRefs.current).forEach(key => {
        stopSound(key as SoundType);
      });
    }
  };
  
  return { playSound, stopSound, muted, toggleMute };
};
