import { BossConfig, TimerColorPhase } from "../core/types";
import { buildRegex } from "../core/regex";
import { extractDefaults } from "../core/utils";

/**
 * ============================================================================
 * BOSS CONFIGURATION STRUCTURE
 * ============================================================================
 * * This file defines the logic, text detection, and settings for a specific boss.
 * You can copy this file to create a new boss (e.g. raksha.ts).
 * * KEY CONCEPTS:
 * - mechanics: The core list of things to track.
 * - customSettings: Dropdowns or numbers specific to this boss (e.g. Phase strategies).
 * - defaults: Initial values for the above settings.
 * * AVAILABLE OPTIONS FOR TIMERS & SETTINGS:
 * ----------------------------------------
 * label: string        -> Text displayed in the Settings Panel.
 * description: string  -> Small gray text displayed BELOW the setting row.
 * info: string         -> Tooltip text displayed when hovering the [?] icon.
 * * tickOffset: number   -> (Timer Only) Shifts the timer start time. 
 * e.g. -2 starts the timer as if it began 1.2s ago.
 * * getStatusEvents: fn  -> (Timer Only) Returns list of { tick, text } to update 
 * the Status Bar at specific times.
 * * condition: fn        -> (Timer Only) Logic to decide if a timer should even 
 * trigger based on current settings.
 * * ============================================================================
 */

// =========================================================================
// 1. THEMES & CONSTANTS
// =========================================================================

const PHASE = {
  READY: -1,
  LOBBY: 0,
  START: 1,
  ARMS: 2,
  ERUPTIONS: 3,
  P3: 4,
  PAD_1_OPEN: 5,
  PAD_1_CLOSE: 6,
  P4: 7,
  DEAD: 8,
};

const COLORS = {
  BLUE_TO_GREEN: [
    { remaining: 999, color: "#29d8e6" }, 
    { remaining: 1, color: "#4ade80" },   
  ] as TimerColorPhase[],
  
  ORANGE_TO_RED: [
    { remaining: 999, color: "#fbbf24" }, 
    { remaining: 10, color: "#ef4444" },   
  ] as TimerColorPhase[]
};

// =========================================================================
// 2. CONFIGURATION
// =========================================================================

const CONFIG: BossConfig = {
  id: "testboss",
  name: "Testboss",
  
  customSettings: [
    {
      key: "sdghfghfds",
      type: "select",
      label: "Phas1111111e 1 Skip",
      description: "Changes when the Arms timer will display",
      info: "Select 'Bomb' if your team cannot skip the roots mechanic.", // Tooltip
      default: "rootling",
      options: [
        { label: "Rootling (21.6s)", value: "rootling" }, 
        { label: "Bomb (1:06)", value: "bomb" }
      ]
    },
    {
      key: "sdghfghfdsfdgy",
      type: "select",
      label: "Ph1111111ase 4 Hit Timing",
      description: "Adjust based on your first ability of choice.",
      info: "Calculates the exact tick the boss becomes vulnerable based on animation delay.", // Tooltip
      default: 2,
      options: [1, 2, 3, 4].map(n => ({ label: n.toString(), value: n }))
    }
  ],

  lifecycle: {
    join: buildRegex(["Welcome to your session against: Solak", "Willkommen zu deiner Runde gegen: Solak", "Bienvenue dans votre session", "Bem-vind"]),
    start: buildRegex(["The betrayer!", "die Verräterin!", "Traîtresse !", "A traidora!"]),
    end: buildRegex(["You are no brother of mine", "Du sendest diese Sterblichen", "Tu n'es plus mon frère", "Você não merece ser chamado de meu irmão"])
  },

  defaults: {
    specific: {
      p1Strategy: "rootling",
      p4HitTiming: 2,
    },
    notifications: {} as any 
  },

  mechanics: [
    {
      id: "arms",
      category: "tag",
      phase: PHASE.ARMS,
      regex: buildRegex([
        "a substring test",
        "Ich werde die Erde",
        "Je vais alimenter la terre",
        "Alimentarei a terra",
      ]),
      defaults: { visual: true, audio: true, duration: 25 },
      timers: [
        {
          id: "arms_timer",
          label: "sdghfghfds457",
          colorPhases: COLORS.BLUE_TO_GREEN,
          getDuration: (settings) => (settings.p1Strategy === "bomb" ? 98 : 23),
          getStatusEvents: (settings) => {
              const endTick = settings.p1Strategy === "bomb" ? 98 : 23;
              return [
                  { tick: 0, text: "Phase 1" },
                  { tick: endTick, text: "Arms/Legs/Core" }
              ];
          },
        }
      ]
    },
    {
      id: "eruptions",
      category: "tag",
      phase: PHASE.ERUPTIONS,
      regex: buildRegex([
        "You are weak, disgusting creatures",
        "Ihr seid schwache",
        "créatures faibles et répugnantes",
        "criaturas fracas e repugnantes",
      ]),
      defaults: { visual: true, audio: true, duration: 10 },
      timers: [
        {
          id: "eruptions_timer",
          label: "sdghfghfds4576",
          colorPhases: COLORS.BLUE_TO_GREEN,
          getDuration: () => 10,
          getStatusEvents: () => [
              { tick: 10, text: "Phase 2" }
          ]
        }
      ]
    },
    {
      id: "p3",
      category: "tag",
      phase: PHASE.P3,
      regex: buildRegex([
        "testing stuff",
        "Erethdor wird schwächer",
        "Erethdor s'affaiblit",
        "Erethdor está ficando mais fraco",
      ]),
      defaults: { visual: true, audio: true, duration: 10 },
      timers: [
        {
          id: "p3_timer",
          label: "sdghfghfds457 3",
          colorPhases: COLORS.BLUE_TO_GREEN,
          getDuration: () => 10,
          getStatusEvents: () => [
              { tick: 10, text: "Phase 3" }
          ]
        }
      ]
    },
    {
      id: "pads",
      category: "mechanic",
      phase: PHASE.PAD_1_OPEN, 
      regex: buildRegex([
        "THIS POWER IS MINE",
        "DIESE MACHT IST MIR",
        "CE POUVOIR EST M'APPARTIENT",
        "SEU PODER PERTENCE A MIM",
      ]),
      defaults: { visual: true, audio: true, duration: 33 },
      timers: [
        {
          id: "pad_open",
          label: "sdghfghfds234 Open",
          colorPhases: COLORS.BLUE_TO_GREEN,
          getDuration: () => 33,
          getStatusEvents: () => [
              { tick: 33, text: "Phase 3" }
          ]
        }
      ]
    },
    {
      id: "pad_close",
      category: "mechanic",
      phase: PHASE.PAD_1_CLOSE, 
      regex: buildRegex([
        "THIS POWER IS MINE",
        "DIESE MACHT IST MIR",
        "CE POUVOIR EST M'APPARTIENT",
        "SEU PODER PERTENCE A MIM",
      ]),
      defaults: { visual: true, audio: true, duration: 52 },
      timers: [
        {
          id: "pad_close_timer",
          label: "sdghfghfds8967 Close",
          colorPhases: COLORS.ORANGE_TO_RED,
          getDuration: () => 52,
          getStatusEvents: () => [
              { tick: 52, text: "Phase 3" }
          ]
        }
      ]
    },
    {
      id: "p4",
      category: "tag",
      phase: PHASE.P4,
      regex: buildRegex([
        "Solak is close to dying",
        "Solak steht kurz vor dem Tode",
        "Solak est",
        "Solak está prestes a morrer",
      ]),
      defaults: { visual: true, audio: true, duration: 28 },
      timers: [
        {
          id: "p4_timer",
          label: "sdghfghfds45687 4",
          colorPhases: COLORS.BLUE_TO_GREEN,
          getDuration: (s) => 28 - s.p4HitTiming,
          getStatusEvents: (s) => [
              { tick: 0, text: "Phase 4" },
              { tick: 28 - s.p4HitTiming, text: "Phase 4 (Kill)" }
          ]
        }
      ]
    },
  ]
};

export const SOLAK_CONFIG: BossConfig = {
  ...CONFIG,
  defaults: extractDefaults(CONFIG)
};