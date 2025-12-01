// --- OCR Configuration ---

// 1. Vowel/Accent Groups
const accentGroups = [
  ["a", "à", "á", "â", "ä", "ã", "A", "À", "Á", "Â", "Ä", "4", "@"],
  ["e", "é", "è", "ê", "ë", "E", "É", "È", "Ê", "Ë", "3"],
  ["i", "î", "ï", "í", "I", "Î", "Ï", "Í", "l", "1", "|", "!", "."],
  ["o", "ô", "ö", "ó", "O", "Ô", "Ö", "Ó", "0", "Q", "D"],
  ["u", "ù", "û", "ü", "ú", "U", "Ù", "Û", "Ü", "Ú"],
  ["c", "ç", "C", "Ç"],
];

// 2. Consonant/Shape Confusions
const confusedGroups = [
  ["z", "2", "Z"],
  ["1", "7"],
  ["s", "5", "S", "$"],
  ["b", "6", "8"],
  ["ß", "B", "8"],
  ["g", "q", "9", "y"],
  ["f", "t", "F", "T"],
  ["m", "n", "rn", "nn"],
  ["r", "n"],
  ["v", "u", "y", "V", "U", "Y"],
  ["J", "l", "I", "1"],
];

// --- Helper: Build the Regex Pattern ---
const regexAdjustments = (cleanText: string): string => {
  return cleanText
    .split("")
    .map((char) => {
      if (/[:.,!?'\-]/.test(char)) return "[\\W\\s]*";
      if (/\s/.test(char)) return "\\s*";
      const accentGroup = accentGroups.find((g) => g.includes(char));
      if (accentGroup) return `[${accentGroup.join("")}]`;
      const confGroup = confusedGroups.find((g) => g.includes(char));
      if (confGroup) return `[${confGroup.join("")}]`;
      return char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("");
};

// --- PRE-COMPILED REGEX PATTERNS (Performance Fix) ---

const instanceTranslations = [
  `Welcome to your session against: Solak, Guardian of the Grove.`,
  `Willkommen zu deiner Runde gegen: Solak, der Wächter des Hains`,
  `Bienvenue dans votre session de combat contre : Solak, le Gardien du bois.`,
  `Bem-vind`,
];
// Note: Instance detection needs two regexes (One for finding, one for counting global)
const instancePatternStr = instanceTranslations.map(regexAdjustments).join("|");
const instanceRegex = new RegExp(`(${instancePatternStr})`, "i");
const instanceRegexGlobal = new RegExp(`(${instancePatternStr})`, "gi");

const killStartTranslations = [
  `Merethiel! The betrayer! You'd lead these mortals against me?`,
  `Merethiel, die Verräterin! Du sendest diese Sterblichen gegen mich in den Kampf?`,
  `Merethiel ! Traîtresse ! Tu dirigerais donc ces mortels contre moi ?`,
  `Merethiel! A traidora! Como ousa auxiliar esses mortais em uma luta contra mim?`,
];
const killStartRegex = new RegExp(
  `(${killStartTranslations.map(regexAdjustments).join("|")})`,
  "i"
);

const armsTranslations = [
  `I will replenish the earth with your bones.`,
  `Ich werde die Erde mit euren Knochen nähren!`,
  `Je vais alimenter la terre`,
  `Alimentarei a terra com os seus ossos.`,
];
const armsRegex = new RegExp(
  `(${armsTranslations.map(regexAdjustments).join("|")})`,
  "i"
);

const phase2Translations = [
  `How futile. You are weak, disgusting creatures!`,
  `Vergeblich. Ihr seid schwache, widerwärtige Kreaturen!`,
  `Quelle action futile. Vous n'êtes que des créatures faibles et répugnantes !`,
  `Que fútil! Vocês não passam de criaturas fracas e repugnantes!`,
];
const phase2Regex = new RegExp(
  `(${phase2Translations.map(regexAdjustments).join("|")})`,
  "i"
);

const phase3Translations = [
  `Merethiel: Erethdor is getting weaker and losing control.`,
  `Merethiel: Erethdor wird schwächer und verliert an Kontrolle.`,
  `Merethiel : Erethdor s'affaiblit et commence`,
  `Merethiel: Erethdor está ficando mais fraco e`,
];
const phase3Regex = new RegExp(
  `(${phase3Translations.map(regexAdjustments).join("|")})`,
  "i"
);

const elfTranslations = [
  `You will not free him, THIS POWER IS MINE.`,
  `Er Kann nicht befreit werden. DIESE MACHT IST MIR UNTERTAN!`,
  `Vous ne le libérerez pas ! CE POUVOIR EST M'APPARTIENT !`,
  `Você não o libertará, SEU PODER PERTENCE A MIM.`,
];
const elfRegex = new RegExp(
  `(${elfTranslations.map(regexAdjustments).join("|")})`,
  "i"
);

const phase4Translations = [
  `Merethiel: No... Solak is close to dying, if Solak dies all is lost.`,
  `Merethiel: Nein... Solak steht kurz vor dem Tode. Wenn er stirbt, ist alles verloren.`,
  `Non... Solak est`,
  `Merethiel: Não... Solak está prestes a morrer. Se Solak morre, tudo está perdido.`,
];
const phase4Regex = new RegExp(
  `(${phase4Translations.map(regexAdjustments).join("|")})`,
  "i"
);

const killEndTranslations = [
  `Merethiel: I'm sorry you failed us Erethdor. You are no brother of mine.`,
  `Merethiel: Es schmerzt mich, dass du uns im Stich`,
  `Merethiel : Je suis navrée que tu nous aies trahis, Erethdor. Tu n'es plus mon frère.`,
  `Merethiel: Lamento que você tenha falhado, Erethdor. Você não merece ser chamado de meu irmão.`,
];
const killEndRegex = new RegExp(
  `(${killEndTranslations.map(regexAdjustments).join("|")})`,
  "i"
);

// --- Detection Functions (Now Extremely Fast) ---

export const detectSolakInstance = (text: string) => {
  return text.match(instanceRegex);
};

export const countSolakInstances = (text: string) => {
  const matches = text.match(instanceRegexGlobal);
  return matches ? matches.length : 0;
};

export const detectKillStart = (text: string) => {
  return !!text.match(killStartRegex);
};

export const detectArms = (text: string) => {
  return !!text.match(armsRegex);
};

export const detectPhase2 = (text: string) => {
  return !!text.match(phase2Regex);
};

export const detectPhase3 = (text: string) => {
  return !!text.match(phase3Regex);
};

export const detectElf = (text: string) => {
  return !!text.match(elfRegex);
};

export const detectPhase4 = (text: string) => {
  return !!text.match(phase4Regex);
};

export const detectKillEnd = (text: string) => {
  return !!text.match(killEndRegex);
};
