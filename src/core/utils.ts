/**
 * Core Utilities
 * * Helper functions for configuration parsing and UI calculations.
 */

import { BossConfig, NotificationConfig, Settings } from "./types";

// ============================================================================
// CONFIGURATION HELPERS
// ============================================================================

/**
 * Extracts the default notification settings from the mechanic definitions.
 */
export const extractDefaults = (config: BossConfig) => {
  const notifications: Record<string, NotificationConfig> = {};

  config.mechanics.forEach((mech) => {
    if (mech.defaults) {
      notifications[mech.id] = mech.defaults;
    }
  });

  return {
    specific: config.defaults.specific,
    notifications: notifications,
  };
};

// ============================================================================
// LAYOUT & SCALING CALCULATOR
// ============================================================================

/**
 * Scans the boss config and current settings to find the longest possible text strings.
 * Returns dynamic font size CSS strings ensuring no clipping occurs.
 */
export const calculateFontScalings = (config: BossConfig, settings: Settings) => {
  let maxLabelLen = 0;
  let maxStatusLen = 0;
  
  // Safe access to specific settings for this boss
  const specificSettings = settings.bosses[config.id]?.specific || config.defaults.specific;

  // 1. Iterate over every mechanic and timer to find the worst-case text length
  config.mechanics.forEach((mech) => {
    if (mech.timers) {
      mech.timers.forEach((timer) => {
        // A. Check Active Timer Label
        if (timer.label.length > maxLabelLen) {
          maxLabelLen = timer.label.length;
        }

        // B. Check Status Events (Passive Text)
        // We must generate the events based on CURRENT settings to capture dynamic text
        if (timer.getStatusEvents) {
          try {
            const events = timer.getStatusEvents(specificSettings);
            events.forEach((e) => {
              if (e.text.length > maxStatusLen) {
                maxStatusLen = e.text.length;
              }
            });
          } catch (e) {
            console.warn("Failed to calculate max length for timer", timer.id);
          }
        }
      });
    }
  });

  // 2. Default Fallbacks to prevent divide-by-zero or comical sizing on empty configs
  if (maxLabelLen === 0) maxLabelLen = 10;
  if (maxStatusLen === 0) maxStatusLen = 15;

  // 3. Calculate Scaling Factors (CQW)
  // The constant '170' is a magic number derived from "Average Character Aspect Ratio"
  // ensuring text fits within 100% of the container width.

  // Active Bar: Label + Time (approx 6 chars for "999.9s") + Spacing
  const activeCharCount = maxLabelLen + 7; 
  // Cap at 12cqw so short text isn't massive
  const activeScaling = Math.min(12, 170 / activeCharCount);

  // Passive Status: Full width available
  const passiveCharCount = maxStatusLen;
  // Cap at 15cqw
  const passiveScaling = Math.min(15, 170 / passiveCharCount);

  return {
    // Returns CSS strings like "max(12px, min(55cqh, 8.24cqw))"
    fontSizeActive: `max(12px, min(55cqh, ${activeScaling.toFixed(2)}cqw))`,
    fontSizePassive: `max(12px, min(55cqh, ${passiveScaling.toFixed(2)}cqw))`
  };
};