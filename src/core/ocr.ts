/**
 * OCR Utilities
 * * Handles the generation of fuzzy Regular Expressions to account for 
 * common character misinterpretations by the Alt1 Toolkit.
 */

// ============================================================================
// CHARACTER MAPPINGS
// ============================================================================

// Vowels & Accents (OCR often mistakes these)
const accentGroups = [
    ["a", "à", "á", "â", "ä", "ã", "A", "À", "Á", "Â", "Ä", "4", "@"],
    ["e", "é", "è", "ê", "ë", "E", "É", "È", "Ê", "Ë", "3"],
    ["i", "î", "ï", "í", "I", "Î", "Ï", "Í", "l", "1", "|", "!", "."],
    ["o", "ô", "ö", "ó", "O", "Ô", "Ö", "Ó", "0", "Q", "D"],
    ["u", "ù", "û", "ü", "ú", "U", "Ù", "Û", "Ü", "Ú"],
    ["c", "ç", "C", "Ç"],
  ];
  
  // Consonants & Similar Shapes
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
  
  // ============================================================================
  // BUILDER LOGIC
  // ============================================================================
  
  /**
   * Builds a RegExp that accounts for common OCR errors.
   * It replaces characters in the input phrases with character classes
   * matching commonly confused alternatives.
   */
  export const buildRegex = (phrases: string[]): RegExp => {
    const pattern = phrases
      .map((cleanText) =>
        cleanText
          .split("")
          .map((char) => {
            // 1. Escape special regex characters
            if (/[:.,!?'\-]/.test(char)) return "[\\W\\s]*";
            if (/\s/.test(char)) return "\\s*";
  
            // 2. Check for accent equivalents
            const accentGroup = accentGroups.find((g) => g.includes(char));
            if (accentGroup) return `[${accentGroup.join("")}]`;
  
            // 3. Check for visual similarities
            const confGroup = confusedGroups.find((g) => g.includes(char));
            if (confGroup) return `[${confGroup.join("")}]`;
  
            // 4. Default: exact match, escaped
            return char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          })
          .join("")
      )
      .join("|");
  
    return new RegExp(`(${pattern})`, "i");
  };