/**
 * Application Type Definitions
 * * Contains all shared interfaces for configuration, state management,
 * and game entities.
 */

// ============================================================================
// PRIMITIVES & STATUS
// ============================================================================

export interface TimerColorPhase {
  remaining: number;
  color: string;
}

export interface StatusEvent {
  tick: number;
  text: string;
}

export interface ChatLine {
  text: string;
  fragments: any[];
}

// ============================================================================
// CONFIGURATION DEFINITIONS (Static)
// ============================================================================

export interface CustomSettingDef {
  key: string;
  type: "select" | "number" | "checkbox";
  label: string;
  default: any;
  options?: { label: string; value: string | number }[];
  min?: number;
  max?: number;
  description?: string;
  info?: string;
}

export interface TimerDef {
  id: string;
  label: string;
  getDuration: (specificSettings: any) => number;
  colorPhases: TimerColorPhase[];
  getStatusEvents?: (specificSettings: any) => StatusEvent[];
  description?: string;
  info?: string;
  tickOffset?: number;
  condition?: (settings: any) => boolean;
}

export interface MechanicDef {
  id: string;
  category: "tag" | "mechanic";
  regex: RegExp;
  phase: number;
  timers?: TimerDef[];
  defaults?: NotificationConfig;
}

export interface LifecycleRegexes {
  join: RegExp;
  start: RegExp;
  end: RegExp;
}

export interface WindowDimensions {
  width: number;
  height: number;
}

export interface BossConfig {
  id: string;
  name: string;
  mechanics: MechanicDef[];
  lifecycle: LifecycleRegexes;
  customSettings: CustomSettingDef[];
  
  /** Optional window dimension overrides for this specific boss */
  window?: {
    settings?: WindowDimensions;
    debugger?: WindowDimensions;
  };

  defaults: {
    specific: Record<string, any>;
    notifications?: Record<string, NotificationConfig>;
  };
}

// ============================================================================
// APPLICATION STATE (Runtime)
// ============================================================================

export interface NotificationConfig {
  visual: boolean;
  audio: boolean;
  duration: number;
}

export interface Timer {
  id: string;
  label: string;
  category: "tag" | "mechanic";
  startTime: number;
  totalTicks: number;
  color: string;
  colorPhases: TimerColorPhase[];
  visibilityThreshold: number;
  visualEnabled: boolean;
  audioEnabled: boolean;
  statusEvents: StatusEvent[];
}

export interface AudioCategoryConfig {
  volume: number;
  leadUpFrequency: number;
  actionFrequency: number;
  leadUpCount: number;
}

export interface AudioSettings {
  masterVolume: number;
  tags: AudioCategoryConfig;
  mechanics: AudioCategoryConfig;
}

export interface GlobalSettings {
  tickRate: number;
  timerUnits: string;
  showTickMarkers: boolean;
  showGCDMarkers: boolean;
  showStallMarker: boolean;
  audio: AudioSettings;
}

export interface Settings {
  global: GlobalSettings;
  bosses: Record<
    string,
    {
      notifications: Record<string, NotificationConfig>;
      specific: Record<string, any>;
    }
  >;
  activeBoss: string;
}