import { useEffect, useRef } from "react";
import { Timer, Settings } from "../core/types";
import { playTone } from "../core/audio";

/**
 * Audio Player Hook
 * * Monitors active timers and plays configured tones.
 * * Handles lead-up beeps and action beeps based on global settings.
 */
export const useAudioPlayer = (activeTimers: Timer[], settings: Settings) => {
  // Tracks which beep count (3, 2, 1) has already played for a specific timer
  const beepHistoryRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (activeTimers.length === 0) return;

    // Run check every 50ms for precise timing
    const interval = setInterval(() => {
      const now = Date.now();

      // Access Global Audio Settings
      const masterVolume = settings.global.audio?.masterVolume ?? 50;
      const tagConfig = settings.global.audio.tags;
      const mechConfig = settings.global.audio.mechanics;

      activeTimers.forEach((timer) => {
        if (!timer.audioEnabled) return;

        // Select configuration based on timer category
        const config = timer.category === "mechanic" ? mechConfig : tagConfig;

        const leadUpFrequency = config?.leadUpFrequency ?? 440;
        const actionFrequency = config?.actionFrequency ?? 880;
        const leadUpCount = config?.leadUpCount ?? 3;
        const sectionVolume = config?.volume ?? 100;

        const effectiveVolume = (masterVolume / 100) * (sectionVolume / 100) * 100;

        const elapsed = now - timer.startTime;
        const duration = timer.totalTicks * 600;
        const rem = Math.ceil((duration - elapsed) / 600);

        // Determine beep window
        const userBeepWindow = leadUpCount + 1;
        const userSetDuration = timer.visibilityThreshold;
        const maxBeepingWindow = Math.min(userBeepWindow, userSetDuration);

        // Play Tone Logic
        if (rem <= maxBeepingWindow && rem >= 1) {
          const lastBeep = beepHistoryRef.current[timer.id];
          
          if (lastBeep !== rem) {
            const freq = rem === 1 ? actionFrequency : leadUpFrequency;
            playTone(freq, effectiveVolume);
            
            // Mark this tick as played
            beepHistoryRef.current[timer.id] = rem;
          }
        }
      });
    }, 50);

    return () => clearInterval(interval);
  }, [activeTimers, settings]);
};