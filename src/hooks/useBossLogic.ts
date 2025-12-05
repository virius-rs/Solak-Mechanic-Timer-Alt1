import { useState, useRef, useEffect } from "react";
import { ChatLine, Settings, Timer, BossConfig } from "../core/types";

const INTERNAL_PHASE = {
  READY: -1,
  LOBBY: 0,
  START: 1,
  DEAD: 9999,
};

/**
 * Boss Logic State Machine
 * * Analyzes the chat stream against the active BossConfig.
 * * Manages phase transitions and active timers.
 */
export const useBossLogic = (lines: ChatLine[], settings: Settings, bossConfig: BossConfig) => {
  const [activeTimers, setActiveTimers] = useState<Timer[]>([]);
  const [lastStatus, setLastStatus] = useState("Ready");

  const currentPhaseRef = useRef(INTERNAL_PHASE.READY);
  
  // Prevents spamming status updates multiple times per tick
  const processedEventsRef = useRef<Set<string>>(new Set());

  // Configuration Accessors
  const bossSettings = settings.bosses[bossConfig.id];
  const specificSettings = bossSettings?.specific || {};
  const notifications = bossSettings?.notifications || {};

  // --- MAIN SCANNING LOOP ---
  useEffect(() => {
    if (!lines || lines.length === 0) return;

    let anchorIndex = -1;
    let anchorType: "NONE" | "JOIN" | "START" | "END" = "NONE";

    // 1. LIFECYCLE SCAN (Reverse search for latest event)
    for (let i = lines.length - 1; i >= 0; i--) {
      const text = lines[i].text;

      if (bossConfig.lifecycle.join.test(text)) {
        anchorIndex = i;
        anchorType = "JOIN";
        break;
      } else if (bossConfig.lifecycle.start.test(text)) {
        anchorIndex = i;
        anchorType = "START";
        break;
      } else if (bossConfig.lifecycle.end.test(text)) {
        anchorIndex = i;
        anchorType = "END";
        break;
      }
    }

    // 2. LIFECYCLE STATE UPDATES
    if (anchorType === "JOIN") {
      if (currentPhaseRef.current !== INTERNAL_PHASE.LOBBY) {
        currentPhaseRef.current = INTERNAL_PHASE.LOBBY;
        setLastStatus("Joined Instance");
        setActiveTimers([]);
        processedEventsRef.current.clear();
      }
    } else if (anchorType === "END") {
      if (currentPhaseRef.current !== INTERNAL_PHASE.DEAD) {
        currentPhaseRef.current = INTERNAL_PHASE.DEAD;
        setLastStatus("Kill Ended");
        setActiveTimers([]);
      }
    } else if (anchorType === "START") {
      if (
        currentPhaseRef.current === INTERNAL_PHASE.LOBBY ||
        currentPhaseRef.current === INTERNAL_PHASE.READY ||
        currentPhaseRef.current === INTERNAL_PHASE.DEAD
      ) {
        currentPhaseRef.current = INTERNAL_PHASE.START;
        setLastStatus("Phase 1");
        setActiveTimers([]);
        processedEventsRef.current.clear();
      }
    }

    // 3. MECHANIC SCAN (Forward search from anchor)
    for (let i = anchorIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      // Concatenate context to handle multi-line or split messages
      const text = (
        line.text +
        " " +
        (lines[i + 1]?.text || "") +
        " " +
        (lines[i + 2]?.text || "")
      ).trim();

      bossConfig.mechanics.forEach((mech) => {
        // Only trigger mechanic if it belongs to a future phase
        if (currentPhaseRef.current < mech.phase && mech.regex.test(text)) {
          currentPhaseRef.current = mech.phase;

          (mech.timers || []).forEach((tDef) => {
            const config = notifications[mech.id];
            
            // Safety: Skip if no config (shouldn't happen with extractDefaults)
            if (!config) return;

            const duration = tDef.getDuration(specificSettings);
            const events = tDef.getStatusEvents ? tDef.getStatusEvents(specificSettings) : [];

            setActiveTimers((prev) => {
              // Prevent duplicates
              if (prev.some((t) => t.id === tDef.id)) return prev;

              return [
                ...prev,
                {
                  id: tDef.id,
                  label: tDef.label,
                  category: mech.category,
                  startTime: Date.now(),
                  totalTicks: duration,
                  color: tDef.colorPhases[0]?.color || "#29d8e6",
                  colorPhases: tDef.colorPhases,
                  visibilityThreshold: config.duration,
                  visualEnabled: config.visual,
                  audioEnabled: config.audio,
                  statusEvents: events,
                },
              ];
            });
          });
        }
      });
    }
  }, [lines, settings, bossConfig]);

  // --- TIMER MAINTENANCE & EVENTS LOOP ---
  useEffect(() => {
    if (activeTimers.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();

      // A. Process Status Events
      activeTimers.forEach((t) => {
        const elapsedMs = now - t.startTime;
        const currentTick = Math.floor(elapsedMs / 600);

        t.statusEvents.forEach((event) => {
          if (currentTick === event.tick) {
            const eventKey = `${t.id}_${event.tick}`;
            
            if (!processedEventsRef.current.has(eventKey)) {
              setLastStatus(event.text);
              processedEventsRef.current.add(eventKey);
            }
          }
        });
      });

      // B. Cleanup Expired Timers
      setActiveTimers((prev) => {
        const keeping = prev.filter((t) => now - t.startTime < t.totalTicks * 600);
        return keeping.length !== prev.length ? keeping : prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeTimers.length]);

  return { activeTimers, lastStatus };
};