import { useEffect, useRef, useState } from "react";
import { useLocalStorage, useChatBoxReader } from "./hooks";
import { PHASE, DEFAULT_SETTINGS } from "./constants";
import { Timer, Settings, ChatLine } from "./types";
import { playBeep } from "./audio";
import {
  detectSolakInstance,
  countSolakInstances,
  detectArms,
  detectPhase2,
  detectPhase3,
  detectElf,
  detectPhase4,
  detectKillEnd,
  detectKillStart,
} from "./textDetection";
import {
  PassiveStatus,
  ProgressBar,
  PopoutWindow,
  DebuggerWindow,
  NumberRow,
  SelectRow,
} from "./components";

// --- Settings Content Logic ---
const SettingsContent = ({
  settings,
  setSettings,
  onClose,
  isLocked,
  statusState,
  onReset,
  showAlignment,
  onOpenDebugger,
}: any) => {
  const getStatusColor = () => {
    if (statusState === "green") return "#4ade80";
    if (statusState === "yellow") return "#facc15";
    return "#f87171";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#121212",
        color: "#e0e0e0",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px",
          background: "#1a1a1a",
          borderBottom: "1px solid #333",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "40px",
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: "bold", fontSize: "0.95rem" }}>
          Configuration
        </span>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#888",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Close"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, padding: "15px", overflowY: "scroll" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* --- DETECTION SECTION --- */}
          <div
            style={{
              paddingBottom: "15px",
              borderBottom: "1px solid #333",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span
                style={{ fontSize: "0.9rem", color: "#ddd", fontWeight: 500 }}
              >
                Chatbox Detection
              </span>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: getStatusColor(),
                  boxShadow: `0 0 5px ${getStatusColor()}`,
                }}
              />
            </div>

            <div
              style={{
                fontSize: "0.8rem",
                color: "#9ca3af",
                marginBottom: "12px",
                lineHeight: "1.4",
                background: "#1f2937",
                padding: "8px",
                borderRadius: "4px",
              }}
            >
              <div style={{ marginBottom: "4px" }}>
                <span style={{ color: "#f87171", fontWeight: "bold" }}>
                  Red:
                </span>{" "}
                Position unknown. Reset, then press enter.
              </div>
              <div style={{ marginBottom: "4px" }}>
                <span style={{ color: "#facc15", fontWeight: "bold" }}>
                  Yellow:
                </span>{" "}
                Position cached, but no new messages detected.
              </div>
              <div>
                <span style={{ color: "#4ade80", fontWeight: "bold" }}>
                  Green:
                </span>{" "}
                Position known and detecting new messages.
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <button
                onClick={showAlignment}
                disabled={!isLocked}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: isLocked ? "#2563eb" : "#333",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isLocked ? "pointer" : "not-allowed",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                Show Chat Position
              </button>
              <button
                onClick={onReset}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                Reset Chat Position
              </button>
            </div>

            <NumberRow
              label="Scan Rate (ms)"
              description="Lower gives more accuracy, at the cost of CPU. Default: 50"
              value={settings.tickRate}
              min={5}
              max={600}
              onChange={(e: any) =>
                setSettings({ ...settings, tickRate: parseInt(e.target.value) })
              }
              noBorder={true}
            />
          </div>

          <SelectRow
            label="Phase 1 Skip"
            description="Changes when the Arms timer will display"
            value={settings.p1Strategy}
            onChange={(e: any) =>
              setSettings({ ...settings, p1Strategy: e.target.value })
            }
            options={[
              { label: "Rootling (21.6s)", value: "rootling" },
              { label: "Bomb (1:06)", value: "bomb" },
            ]}
          />

          <SelectRow
            label="Phase 4 Hit Timing"
            description={
              <>
                Adjust based on your first ability of choice.
                <br />
                1 | Barge DoT / Detonate / Iban's / Death Guard
                <br />
                2 | EZK / Leng / Omni Guard / Volley of Souls
                <br />
                3 | Omnipower / ROA / Death Skulls
                <br />
                Not listed?{" "}
                <a
                  href="https://docs.google.com/spreadsheets/d/17S4WGJ5iRVxy4kyn3tzrGDQb10O6tKAkNBnl7MaSE64"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#5c9aff" }}
                >
                  Check this spreadsheet
                </a>
                <br />
              </>
            }
            value={settings.p4HitTiming}
            onChange={(e: any) =>
              setSettings({
                ...settings,
                p4HitTiming: parseInt(e.target.value),
              })
            }
            options={[1, 2, 3, 4].map((n) => ({
              label: n.toString(),
              value: n,
            }))}
          />

          <SelectRow
            label="Timer Display"
            value={settings.timerUnits}
            onChange={(e: any) =>
              setSettings({ ...settings, timerUnits: e.target.value })
            }
            options={[
              { label: "Seconds", value: "seconds" },
              { label: "Ticks", value: "ticks" },
            ]}
          />

          <SelectRow
            label="Audio Alerts"
            description="Adds an audio cue to let you know when timers are ending"
            value={settings.audioEnabled ? "enabled" : "disabled"}
            onChange={(e: any) =>
              setSettings({
                ...settings,
                audioEnabled: e.target.value === "enabled",
              })
            }
            options={[
              { label: "Enabled", value: "enabled" },
              { label: "Disabled", value: "disabled" },
            ]}
          />

          {/* --- Debugger Button --- */}
          <div
            style={{
              marginTop: "20px",
              borderTop: "1px solid #333",
              paddingTop: "15px",
            }}
          >
            <button
              onClick={onOpenDebugger}
              style={{
                width: "100%",
                padding: "10px",
                background: "#333",
                border: "1px solid #444",
                color: "#ddd",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Open OCR Debugger
            </button>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#666",
                marginTop: "8px",
                textAlign: "center",
              }}
            >
              Opens a separate window to view live text detection.
            </div>
          </div>
        </div>
      </div>

      <style>{`
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: #1a1a1a; }
          ::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #555; }
          a:hover { color: #8ab4ff !important; text-decoration: underline; }
      `}</style>
    </div>
  );
};

export const ChatReader = () => {
  const [settings, setSettings] = useLocalStorage<Settings>(
    "solak-settings-v1",
    DEFAULT_SETTINGS
  );
  const [lastStatus, setLastStatus] = useState("Ready");
  const [showSettings, setShowSettings] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);

  const [activeTimer, setActiveTimer] = useState<Timer | null>(null);
  const [debugLines, setDebugLines] = useState<ChatLine[]>([]);

  const currentPhaseRef = useRef(PHASE.READY);
  const maxInstanceCountRef = useRef(0);
  const lastBeepTickRef = useRef<number | null>(null);
  const lastDebugTimeRef = useRef(0);

  const { lines, pos, lastReadTime, resetReader, showOverlay } =
    useChatBoxReader(settings);

  // Heartbeat for status dot
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // NEW: Safety Reset. If OCR loses lock (loading screen/lobby), reset max count immediately.
  useEffect(() => {
    if (!pos) {
      maxInstanceCountRef.current = 0;
    }
  }, [pos]);

  // Timer Helper
  const setTimer = (label: string, ticks: number, color: string) => {
    if (activeTimer?.label === label) return;
    setActiveTimer({
      id: Date.now().toString(),
      label,
      startTime: Date.now(),
      totalTicks: ticks,
      color,
      visibilityThreshold: ticks > 30 ? 20 : 10,
    });
    lastBeepTickRef.current = null;
  };

  // Audio Loop
  useEffect(() => {
    if (!activeTimer) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - activeTimer.startTime;
      const duration = activeTimer.totalTicks * 600;
      const rem = Math.ceil((duration - elapsed) / 600);

      if (settings.audioEnabled && rem <= 4 && rem >= 1) {
        if (lastBeepTickRef.current !== rem) {
          playBeep(rem === 1 ? "high" : "low");
          lastBeepTickRef.current = rem;
        }
      }

      if (elapsed >= duration) {
        if (activeTimer.label === "Arms") setLastStatus("Arms/Legs/Core");
        else if (activeTimer.label === "Eruptions") setLastStatus("Phase 2");
        else if (activeTimer.label === "Phase 3") setLastStatus("Phase 3");
        else if (activeTimer.label === "Phase 4") setLastStatus("Phase 4");
        setActiveTimer(null);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [activeTimer, settings.audioEnabled]);

  // Main Logic Loop
  useEffect(() => {
    if (!lines || lines.length === 0) return;

    // Debugger Logic
    const now = Date.now();
    if (showDebugger && now - lastDebugTimeRef.current > 100) {
      const clean = lines.filter((l) => l.text && l.text.trim().length > 0);
      if (clean.length > 0) {
        setDebugLines((prev) => {
          const next = [...prev];
          clean.forEach((l) => {
            if (!next.length || l.text !== next[next.length - 1].text)
              next.push(l);
          });
          return next.slice(-20);
        });
        lastDebugTimeRef.current = now;
      }
    }

    // Phase Detection
    let currentInstanceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const text = (
        line.text +
        " " +
        (lines[i + 1]?.text || "") +
        " " +
        (lines[i + 2]?.text || "")
      ).trim();

      if (detectSolakInstance(text)) {
        currentInstanceCount++;
      }

      const phase = currentPhaseRef.current;

      if (detectKillStart(text)) {
        if (phase !== PHASE.START) {
          currentPhaseRef.current = PHASE.START;
          setLastStatus("Phase 1");
        }
      }

      if (phase < PHASE.ARMS && detectArms(text)) {
        currentPhaseRef.current = PHASE.ARMS;
        setTimer("Arms", settings.p1Strategy === "bomb" ? 98 : 23, "#FF9500");
      }

      if (phase < PHASE.ERUPTIONS && detectPhase2(text)) {
        currentPhaseRef.current = PHASE.ERUPTIONS;
        setTimer("Eruptions", 10, "#FF9500");
      }

      if (phase < PHASE.P3 && detectPhase3(text)) {
        currentPhaseRef.current = PHASE.P3;
        setTimer("Phase 3", 10, "#FF9500");
      }

      if (phase < PHASE.ELF && detectElf(text)) {
        currentPhaseRef.current = PHASE.ELF;
        setLastStatus("Phase 3");
        setTimer("Pad Opens", 33, "#FF9500");
      }

      if (phase < PHASE.P4 && detectPhase4(text)) {
        currentPhaseRef.current = PHASE.P4;
        setLastStatus("Phase 4");
        setTimer("Phase 4", 28 - settings.p4HitTiming, "#FF9500");
      }

      if (phase < PHASE.DEAD && detectKillEnd(text)) {
        currentPhaseRef.current = PHASE.DEAD;
        setLastStatus("Kill Ended");
        setActiveTimer(null);
      }
    }

    // --- INSTANCE TRACKING (FIXED) ---
    if (currentInstanceCount > maxInstanceCountRef.current) {
      if (currentPhaseRef.current !== PHASE.LOBBY || activeTimer) {
        currentPhaseRef.current = PHASE.LOBBY;
        setLastStatus("Joined Instance");
        setActiveTimer(null);
      }
      maxInstanceCountRef.current = currentInstanceCount;
    } else if (currentInstanceCount < maxInstanceCountRef.current) {
      // FIX: Force reset max count downwards immediately.
      // This handles cases where chat cleared or scrolled but we missed the "0" frame.
      maxInstanceCountRef.current = currentInstanceCount;
    }
  }, [lines, settings, showDebugger]);

  const statusState = !pos
    ? "red"
    : Date.now() - lastReadTime < 60000
    ? "green"
    : "yellow";
  const isLocked = !!pos;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#121212",
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
          gap: "8px",
          height: "100%",
        }}
      >
        {/* Status Dot: 8px */}
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
          }}
        />

        {/* Main Content Area (Relative Container) */}
        <div style={{ flex: 1, height: "100%", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: "2px",
              bottom: "2px",
              left: 0,
              right: 0,
            }}
          >
            {activeTimer ? (
              <ProgressBar
                timer={activeTimer}
                statusText={lastStatus}
                units={settings.timerUnits}
              />
            ) : (
              <PassiveStatus text={lastStatus} statusState={statusState} />
            )}
          </div>
        </div>

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
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>

      {showSettings && (
        <PopoutWindow onClose={() => setShowSettings(false)}>
          <SettingsContent
            settings={settings}
            setSettings={setSettings}
            onClose={() => setShowSettings(false)}
            isLocked={isLocked}
            statusState={statusState}
            onReset={resetReader}
            showAlignment={showOverlay}
            onOpenDebugger={() => setShowDebugger(true)}
          />
        </PopoutWindow>
      )}

      {showDebugger && (
        <DebuggerWindow
          lines={debugLines}
          onClose={() => {
            setShowDebugger(false);
            setDebugLines([]);
          }}
        />
      )}
    </div>
  );
};
