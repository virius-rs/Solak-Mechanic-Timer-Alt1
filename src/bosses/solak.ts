import { BossConfig, TimerColorPhase } from "../core/types";
import { buildRegex } from "../core/ocr";
import { extractDefaults } from "../core/utils";

// =========================================================================
// THEMES & CONSTANTS
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
    { remaining: 1, color: "#ef4444" },   
  ] as TimerColorPhase[]
};

// =========================================================================
// CONFIGURATION
// =========================================================================

const CONFIG: BossConfig = {
  id: "solak",
  name: "Solak",

  // Window dimension overrides specific to Solak
  window: {
    settings: { width: 650, height: 480 }
  },
  
  customSettings: [
    {
      key: "p1Strategy",
      type: "select",
      label: "Phase 1 Skip",
      info: "Select 'Bomb' if your team cannot skip the roots mechanic.",
      default: "rootling",
      options: [
        { label: "Rootling (21.6s)", value: "rootling" }, 
        { label: "Bomb (1:06)", value: "bomb" }
      ]
    },
    {
      key: "p4HitTiming",
      type: "select",
      label: "Phase 4 Hit Timing",
      info: "Calculates the exact tick the boss becomes vulnerable based on animation delay.",
      default: 2,
      options: [1, 2, 3, 4].map(n => ({ label: n.toString(), value: n }))
    }
  ],

  lifecycle: {
    join: buildRegex([
      `Welcome to your session against: Solak, Guardian of the Grove.`,
      `Willkommen zu deiner Runde gegen: Solak, der Wächter des Hains`,
      `Bienvenue dans votre session de combat contre : Solak, le Gardien du bois.`,
      `Bem-vind`]),
    start: buildRegex([
      `Merethiel! The betrayer! You'd lead these mortals against me?`,
      `Merethiel, die Verräterin! Du sendest diese Sterblichen gegen mich in den Kampf?`,
      `Merethiel ! Traîtresse ! Tu dirigerais donc ces mortels contre moi ?`,
      `Merethiel! A traidora! Como ousa auxiliar esses mortais em uma luta contra mim?`]),
    end: buildRegex([
      `Merethiel: I'm sorry you failed us Erethdor. You are no brother of mine.`,
      `Merethiel: Es schmerzt mich, dass du uns im Stich`,
      `Merethiel : Je suis navrée que tu nous aies trahis, Erethdor. Tu n'es plus mon frère.`,
      `Merethiel: Lamento que você tenha falhado, Erethdor. Você não merece ser chamado de meu irmão.`])
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
        `I will replenish the earth with your bones.`,
        `Ich werde die Erde mit euren Knochen nähren!`,
        `Je vais alimenter la terre`,
        `Alimentarei a terra com os seus ossos.`,
      ]),
      defaults: { visual: true, audio: true, duration: 10 },
      timers: [
        {
          id: "arms_timer",
          label: "Arms",
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
        `How futile. You are weak, disgusting creatures!`,
        `Vergeblich. Ihr seid schwache, widerwärtige Kreaturen!`,
        `Quelle action futile. Vous n'êtes que des créatures faibles et répugnantes !`,
        `Que fútil! Vocês não passam de criaturas fracas e repugnantes!`,
      ]),
      defaults: { visual: true, audio: true, duration: 10 },
      timers: [
        {
          id: "eruptions_timer",
          label: "Eruptions",
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
        `Merethiel: Erethdor is getting weaker and losing control.`,
        `Merethiel: Erethdor wird schwächer und verliert an Kontrolle.`,
        `Merethiel : Erethdor s'affaiblit et commence`,
        `Merethiel: Erethdor está ficando mais fraco e`,
      ]),
      defaults: { visual: true, audio: true, duration: 10 },
      timers: [
        {
          id: "p3_timer",
          label: "Phase 3",
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
        `You will not free him, THIS POWER IS MINE.`,
        `Er Kann nicht befreit werden. DIESE MACHT IST MIR UNTERTAN!`,
        `Vous ne le libérerez pas ! CE POUVOIR EST M'APPARTIENT !`,
        `Você não o libertará, SEU PODER PERTENCE A MIM.`,
      ]),
      defaults: { visual: true, audio: true, duration: 10 },
      timers: [
        {
          id: "pad_open",
          label: "Pad Open",
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
        `You will not free him, THIS POWER IS MINE.`,
        `Er Kann nicht befreit werden. DIESE MACHT IST MIR UNTERTAN!`,
        `Vous ne le libérerez pas ! CE POUVOIR EST M'APPARTIENT !`,
        `Você não o libertará, SEU PODER PERTENCE A MIM.`,
      ]),
      defaults: { visual: true, audio: true, duration: 10 },
      timers: [
        {
          id: "pad_close_timer",
          label: "Pad Close",
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
        `Merethiel: No... Solak is close to dying, if Solak dies all is lost.`,
        `Merethiel: Nein... Solak steht kurz vor dem Tode. Wenn er stirbt, ist alles verloren.`,
        `Non... Solak est`,
        `Merethiel: Não... Solak está prestes a morrer. Se Solak morre, tudo está perdido.`,
      ]),
      defaults: { visual: true, audio: true, duration: 10 },
      timers: [
        {
          id: "p4_timer",
          label: "Phase 4",
          colorPhases: COLORS.BLUE_TO_GREEN,
          getDuration: (s) => 28 - s.p4HitTiming,
          getStatusEvents: (s) => [
              { tick: 0, text: "Phase 4" },
              { tick: 28 - s.p4HitTiming, text: "Phase 4" }
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