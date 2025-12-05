/**
 * Application Constants
 * * Global default values and configuration presets.
 */

import { Settings, AudioCategoryConfig } from "./types";
import { getBossConfig, DEFAULT_BOSS_ID } from "../bosses";

// ============================================================================
// DEFAULT AUDIO SETTINGS
// ============================================================================

const DEFAULT_AUDIO_CATEGORY: AudioCategoryConfig = {
  volume: 100,
  leadUpFrequency: 440,
  actionFrequency: 880,
  leadUpCount: 3,
};

// ============================================================================
// APP DEFAULTS
// ============================================================================

// Load the default boss dynamically from the registry
const defaultBossConfig = getBossConfig(DEFAULT_BOSS_ID);

export const DEFAULT_SETTINGS: Settings = {
  activeBoss: DEFAULT_BOSS_ID,

  global: {
    tickRate: 50,
    timerUnits: "seconds",
    showTickMarkers: true,
    showGCDMarkers: true,
    showStallMarker: true,
    audio: {
      masterVolume: 50,
      tags: { ...DEFAULT_AUDIO_CATEGORY },
      mechanics: { ...DEFAULT_AUDIO_CATEGORY },
    },
  },

  bosses: {
    [DEFAULT_BOSS_ID]: {
      specific: defaultBossConfig.defaults.specific,
      notifications: defaultBossConfig.defaults.notifications!,
    },
  },
};

export const DEFAULT_WINDOW_DIMENSIONS = {
  SETTINGS: { width: 650, height: 480 },
  DEBUGGER: { width: 400, height: 300 },
};