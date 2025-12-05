import { useState, useRef, useEffect, useMemo } from "react";

// Hooks
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useOCR } from "../hooks/useOCR";
import { useBossLogic } from "../hooks/useBossLogic";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

// Core & Config
import { DEFAULT_SETTINGS, DEFAULT_WINDOW_DIMENSIONS } from "../core/constants";
import { Settings as SettingsType, ChatLine, Timer } from "../core/types";
import { getBossConfig, DEFAULT_BOSS_ID } from "../bosses";
import { calculateFontScalings } from "../core/utils";

// Components
import { PassiveStatus, ProgressBar } from "./ProgressBar";
import { PopoutWindow } from "./Popout";
import { Debugger } from "./Debugger";
import { Settings } from "./Settings";

// ============================================================================
// MAIN OVERLAY COMPONENT
// ============================================================================

export const ChatReader = () => {
  // --- STATE MANAGEMENT ---

  const [settings, setSettings] = useLocalStorage<SettingsType>(
    "rs3-boss-timers-v1",
    DEFAULT_SETTINGS
  );

  const [showSettings, setShowSettings] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);
  const [requestedSettingsTab, setRequestedSettingsTab] = useState<string | null>(null);

  const [debugLines, setDebugLines] = useState<ChatLine[]>([]);
  const lastDebugTimeRef = useRef(0);

  const [now, setNow] = useState(Date.now());

  // --- CONFIGURATION RESOLUTION ---

  const activeBossId = settings.activeBoss || DEFAULT_BOSS_ID;
  const activeConfig = getBossConfig(activeBossId);

  // --- INITIALIZATION & SYNC ---

  useEffect(() => {
    let hasChanges = false;
    const newSettings = { ...settings };

    // 1. Structure Integrity Check
    if (!newSettings.global || !newSettings.bosses) {
      console.log("Resetting to default structure");
      setSettings(DEFAULT_SETTINGS);
      return;
    }

    // 2. Master Override Check
    if (newSettings.activeBoss !== DEFAULT_BOSS_ID) {
      console.log(`[Sync] Enforcing default boss: ${DEFAULT_BOSS_ID}`);
      newSettings.activeBoss = DEFAULT_BOSS_ID;
      hasChanges = true;
    }

    // 3. Boss Initialization & Content Sync
    const targetId = newSettings.activeBoss;
    const targetConfig = getBossConfig(targetId);

    if (!newSettings.bosses[targetId]) {
      console.log(`Initializing defaults for: ${targetConfig.name}`);
      newSettings.bosses[targetId] = {
        specific: targetConfig.defaults.specific,
        notifications: targetConfig.defaults.notifications!,
      };
      hasChanges = true;
    } else {
      const savedBoss = newSettings.bosses[targetId];
      const defaults = targetConfig.defaults;

      Object.keys(defaults.specific).forEach((key) => {
        if (savedBoss.specific[key] === undefined) {
          console.log(`[Sync] Adding new setting: ${key}`);
          savedBoss.specific[key] = defaults.specific[key];
          hasChanges = true;
        }
      });

      if (defaults.notifications) {
        Object.keys(defaults.notifications).forEach((key) => {
          if (!savedBoss.notifications[key]) {
            console.log(`[Sync] Adding new notification: ${key}`);
            savedBoss.notifications[key] = defaults.notifications![key];
            hasChanges = true;
          }
        });
      }
    }

    if (hasChanges) {
      setSettings(newSettings);
    }
  }, [DEFAULT_BOSS_ID]);

  // --- RENDER LOOP ---

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(interval);
  }, []);

  // --- LOGIC HOOKS ---

  const { lines, pos, lastReadTime, resetReader, showOverlay } = useOCR(settings);
  const { activeTimers, lastStatus } = useBossLogic(lines, settings, activeConfig);
  useAudioPlayer(activeTimers, settings);

  // --- LAYOUT CALCULATION ---
  const fontStyles = useMemo(
    () => calculateFontScalings(activeConfig, settings),
    [activeConfig, settings]
  );

  // --- DEBUGGER LOGIC ---

  useEffect(() => {
    if (showDebugger && Date.now() - lastDebugTimeRef.current > 100) {
      if (lines && lines.length > 0) {
        const clean = lines.filter((l) => l.text && l.text.trim().length > 0);
        if (clean.length > 0) {
          setDebugLines((prev) => {
            const next = [...prev];
            clean.forEach((l) => {
              if (!next.length || l.text !== next[next.length - 1].text) {
                next.push(l);
              }
            });
            return next.slice(-20);
          });
          lastDebugTimeRef.current = Date.now();
        }
      }
    }
  }, [lines, showDebugger]);

  // --- DERIVED VIEW STATE ---

  const statusState = !pos
    ? "red"
    : Date.now() - lastReadTime < 60000
    ? "green"
    : "yellow";

  const isLocked = !!pos;

  const visibleTimers = activeTimers.filter((t: Timer) => {
    if (!t.visualEnabled) return false;
    const elapsed = now - t.startTime;
    const duration = t.totalTicks * 600;
    const remainingMs = duration - elapsed;
    const remainingTicks = Math.ceil(remainingMs / 600);
    return remainingTicks <= t.visibilityThreshold;
  });

  const handleOverlayClick = () => {
    if (statusState === "red") {
      setRequestedSettingsTab("detection");
      setShowSettings(true);
    }
  };

  // --- RENDER ---

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "url('/background.png')",
        backgroundRepeat: "repeat",
        color: "#e0e0e0",
        fontFamily: "Segoe UI",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 7px 0 8px",
          height: "100%",
        }}
      >
        {/* Status Indicator Dot */}
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background:
              statusState === "green"
                ? "#4ade80"
                : statusState === "yellow"
                ? "#facc15"
                : "#f87171",
            boxShadow: `0 0 5px ${
              statusState === "green" ? "#4ade80" : "#f87171"
            }`,
            flexShrink: 0,
            marginRight: "8px",
          }}
        />

        {/* Main Content Area */}
        <div
          onClick={handleOverlayClick}
          style={{
            flex: 1,
            height: "100%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            cursor: statusState === "red" ? "pointer" : "default",
          }}
        >
          {visibleTimers.length > 0 ? (
            visibleTimers.map((timer, index) => (
              <div
                key={timer.id}
                style={{
                  height: visibleTimers.length > 1 ? "50%" : "100%",
                  marginBottom: index < visibleTimers.length - 1 ? "2px" : "0",
                  padding: visibleTimers.length > 1 ? "0" : "2px 0",
                }}
              >
                <ProgressBar
                  timer={timer}
                  statusText={lastStatus}
                  units={settings.global.timerUnits}
                  showTicks={settings.global.showTickMarkers}
                  showGCD={settings.global.showGCDMarkers}
                  showStall={settings.global.showStallMarker}
                  fontSize={fontStyles.fontSizeActive}
                  fontSizePassive={fontStyles.fontSizePassive}
                />
              </div>
            ))
          ) : (
            <div style={{ height: "100%", padding: "2px 0" }}>
              <PassiveStatus 
                text={lastStatus} 
                statusState={statusState}
                fontSize={fontStyles.fontSizePassive} 
              />
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            padding: "0",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            position: "relative",
            zIndex: 10,
            marginLeft: "8px",
          }}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>

      {/* 4. POPOUT WINDOWS */}

      {showSettings && (
        <PopoutWindow
          onClose={() => {
            setShowSettings(false);
            setRequestedSettingsTab(null);
          }}
          width={activeConfig.window?.settings?.width ?? DEFAULT_WINDOW_DIMENSIONS.SETTINGS.width}
          height={activeConfig.window?.settings?.height ?? DEFAULT_WINDOW_DIMENSIONS.SETTINGS.height}
        >
          <Settings
            settings={settings}
            setSettings={setSettings}
            onClose={() => {
              setShowSettings(false);
              setRequestedSettingsTab(null);
            }}
            isLocked={isLocked}
            statusState={statusState}
            onReset={resetReader}
            showAlignment={showOverlay}
            onOpenDebugger={() => setShowDebugger(true)}
            initialTab={requestedSettingsTab}
            activeBossConfig={activeConfig}
          />
        </PopoutWindow>
      )}

      {showDebugger && (
        <Debugger
          lines={debugLines}
          onClose={() => {
            setShowDebugger(false);
            setDebugLines([]);
          }}
          width={activeConfig.window?.debugger?.width ?? DEFAULT_WINDOW_DIMENSIONS.DEBUGGER.width}
          height={activeConfig.window?.debugger?.height ?? DEFAULT_WINDOW_DIMENSIONS.DEBUGGER.height}
        />
      )}
    </div>
  );
};