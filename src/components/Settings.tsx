import { useState, useEffect } from "react";
import { Settings as SettingsType, NotificationConfig } from "../core/types";
import { playTone } from "../core/audio";

// UI Primitives
import { Checkbox } from "./ui/Checkbox";
import { Stepper } from "./ui/Stepper";
import { Select } from "./ui/Select";
import { Slider } from "./ui/Slider";
import { IconButton } from "./ui/Button";
import { InfoLabel, Tooltip } from "./ui/Tooltip";

// ============================================================================
// HELPERS
// ============================================================================

const getStatusColor = (statusState: string) => {
  if (statusState === "green") return "#4ade80";
  if (statusState === "yellow") return "#facc15";
  return "#f87171";
};

// ============================================================================
// SUB-COMPONENTS (Local)
// ============================================================================

const DetectionStatusBox = ({ status }: { status: string }) => {
  let bgColor, borderColor, content, shadowColor;

  if (status === "green") {
    bgColor = "rgba(74, 222, 128, 0.1)";
    borderColor = "rgba(74, 222, 128, 0.4)";
    shadowColor = "rgba(74, 222, 128, 0.1)";
    content = (
      <p style={{ margin: 0, fontWeight: 500, color: "#e2e8f0" }}>
        Looks like you're all good to go!
      </p>
    );
  } else if (status === "yellow") {
    bgColor = "rgba(250, 204, 21, 0.1)";
    borderColor = "rgba(250, 204, 21, 0.4)";
    shadowColor = "rgba(250, 204, 21, 0.1)";
    content = (
      <>
        <p style={{ marginTop: 0 }}>
          The application knows of a chat box location, but it hasn't detected any new messages in the last 60 seconds, so try typing in-game.
        </p>
        <p>
          If things are still yellow, click the <span style={{ color: "#60a5fa", fontWeight: 600 }}>Show Chat Position</span> button and confirming nothing is obstructing your chat.
        </p>
        <p style={{ marginBottom: 0 }}>
          No luck? Click the <span style={{ color: "#f87171", fontWeight: 600 }}>Reset Chat Position</span> button for a full refresh.
        </p>
      </>
    );
  } else {
    // Red or unknown
    bgColor = "rgba(248, 113, 113, 0.1)";
    borderColor = "rgba(248, 113, 113, 0.4)";
    shadowColor = "rgba(248, 113, 113, 0.1)";
    content = (
      <>
        <p style={{ marginTop: 0 }}>
          The application has failed to find your chatbox. Make sure it is clear of any obstructions, then press Enter and click the <span style={{ color: "#f87171", fontWeight: 600 }}>Reset Chat Position</span> button.
        </p>
        <p style={{ marginBottom: 0 }}>
          No luck? Report it to us over in the{" "}
          <a
            href="https://discord.com/channels/429001600523042818/1444381415666880644"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#60a5fa", textDecoration: "none" }}
          >
            Discord Channel
          </a>
          {" "}with a screenshot of your full game window.
        </p>
      </>
    );
  }

  return (
    <div style={{
      padding: "15px",
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: "6px",
      marginBottom: "20px",
      fontSize: "0.85rem",
      lineHeight: "1.6",
      color: "#cbd5e1",
      boxShadow: `0 4px 15px ${shadowColor}`,
      backdropFilter: "blur(4px)"
    }}>
      {content}
    </div>
  );
};

const TabButton = ({ id, label, activeTab, onClick, suffix }: any) => {
  const isActive = activeTab === id;
  const isInfo = id === "information";
  
  const activeBackground = "linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 100%)";
  const infoBackground = "rgba(70, 130, 180, 0.1)"; 
  
  let background = "transparent";
  if (isActive) background = activeBackground;
  else if (isInfo) background = infoBackground;

  return (
    <button
      className="sidebar-btn"
      onMouseDown={(e) => {
        if (e.button === 0) onClick(id);
      }}
      style={{
        width: "100%",
        padding: "12px 15px",
        textAlign: "left",
        background: background,
        color: isActive ? "#fff" : (isInfo ? "#bae6fd" : "#94a3b8"),
        border: "none",
        borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
        borderBottom: isInfo ? "1px solid rgba(255,255,255,0.05)" : "none",
        cursor: "pointer",
        fontSize: "0.9rem",
        fontWeight: isActive ? 600 : 400,
        transition: "all 0.2s ease",
        userSelect: "none",
        outline: "none",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <span style={{ letterSpacing: isActive ? "0.3px" : "0" }}>{label}</span>
      {suffix && <div>{suffix}</div>}
    </button>
  );
};

const CategoryHeader = ({ title, showColumns = false }: { title: string, showColumns?: boolean }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      marginTop: "25px",
      marginBottom: "12px",
      borderBottom: "1px solid #333",
      paddingBottom: "8px",
    }}
  >
    <div
      style={{
        flex: 1,
        fontSize: "0.8rem",
        color: "#60a5fa",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "1px",
      }}
    >
      {title}
    </div>
    {showColumns && (
      <>
        <div style={{ width: "80px", textAlign: "center", fontSize: "0.65rem", color: "#64748b", fontWeight: 700, letterSpacing: "0.5px" }}>
          VISUAL
        </div>
        <div style={{ width: "80px", textAlign: "center", fontSize: "0.65rem", color: "#64748b", fontWeight: 700, letterSpacing: "0.5px" }}>
          AUDIO
        </div>
        <div style={{ width: "130px", textAlign: "center", fontSize: "0.65rem", color: "#64748b", fontWeight: 700, letterSpacing: "0.5px" }}>
          TIMER LENGTH
        </div>
      </>
    )}
  </div>
);

const NotificationRow = ({ label, config, onChange, max, info, description }: any) => {
  if (!config) return null;

  return (
    <div className="setting-row" style={{ borderBottom: "1px solid #1f1f1f", padding: "8px 0", transition: "background 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", height: "34px" }}>
        {/* Label Column */}
        <div style={{ flex: 1 }}>
          <InfoLabel label={label} info={info} />
        </div>

        {/* Controls Columns */}
        <div style={{ width: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Checkbox checked={config.visual} onChange={(val: boolean) => onChange({ ...config, visual: val })} />
        </div>
        <div style={{ width: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Checkbox checked={config.audio} onChange={(val: boolean) => onChange({ ...config, audio: val })} />
        </div>
        <div style={{ width: "130px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>
          <Stepper
            value={config.duration}
            min={1}
            max={max}
            formatTicks={true}
            onChange={(val: number) => onChange({ ...config, duration: val })}
          />
        </div>
      </div>

      {/* Optional Description */}
      {description && (
        <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px", lineHeight: 1.3 }}>{description}</div>
      )}
    </div>
  );
};

const AudioSection = ({ title, config, onChange, masterVolume }: any) => {
  const effectiveVol = (masterVolume / 100) * (config.volume / 100) * 100;

  return (
    <div style={{ marginBottom: "25px" }}>
      {/* Explicitly disable columns for AudioSection */}
      <CategoryHeader title={title} showColumns={false} />

      {/* Volume Slider - Compact with Flare and Glow */}
      <div 
        style={{ 
          marginBottom: "10px", 
          background: "linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(0,0,0,0.2) 100%)", 
          borderLeft: "3px solid #3b82f6",
          padding: "5px 12px", 
          borderRadius: "0 4px 4px 0",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
        }}
      >
        <Slider
          label={`${title} Volume`}
          value={config.volume}
          min={0}
          max={100}
          onChange={(e: any) => onChange({ ...config, volume: parseInt(e.target.value) })}
          onRelease={() => playTone(config.actionFrequency, effectiveVol)}
        />
      </div>

      {/* Frequencies */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.9rem", color: "#e2e8f0" }}>Pre-Beep Tone (Hz)</div>
        </div>
        <div style={{ width: "130px", display: "flex", gap: "8px", alignItems: "center", padding: "0 5px", boxSizing: "border-box" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Stepper
              value={config.leadUpFrequency}
              min={100}
              max={5000}
              step={10}
              onChange={(val: number) => onChange({ ...config, leadUpFrequency: val })}
            />
          </div>
          <IconButton icon="🔊" onClick={() => playTone(config.leadUpFrequency, effectiveVol)} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.9rem", color: "#e2e8f0" }}>Final Tick Tone (Hz)</div>
        </div>
        <div style={{ width: "130px", display: "flex", gap: "8px", alignItems: "center", padding: "0 5px", boxSizing: "border-box" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Stepper
              value={config.actionFrequency}
              min={100}
              max={5000}
              step={10}
              onChange={(val: number) => onChange({ ...config, actionFrequency: val })}
            />
          </div>
          <IconButton icon="🔊" onClick={() => playTone(config.actionFrequency, effectiveVol)} />
        </div>
      </div>

      {/* Duration Stepper */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "42px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.9rem", color: "#e2e8f0", fontWeight: 500 }}>Pre-Beep Duration</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Ticks before the final action</div>
        </div>
        <div style={{ width: "130px", display: "flex", justifyContent: "center", padding: "0 5px", boxSizing: "border-box" }}>
          <Stepper
            value={config.leadUpCount}
            min={0}
            max={10}
            formatTicks={true}
            onChange={(val: number) => onChange({ ...config, leadUpCount: val })}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const Settings = ({
  settings,
  setSettings,
  onClose,
  isLocked,
  statusState,
  onReset,
  showAlignment,
  onOpenDebugger,
  initialTab,
  activeBossConfig,
}: any) => {
  const [activeTab, setActiveTab] = useState(initialTab || "general");
  const [appConfig, setAppConfig] = useState({ appName: "Loading...", version: "...", description: "" });
  const bgUrl = `${window.location.origin}/background.png`;
  
  useEffect(() => {
    fetch("./appconfig.json")
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => setAppConfig({ appName: data.appName || "Application", version: data.version || "0.0.0", description: data.description || "" }))
      .catch(() => setAppConfig({ appName: "Config Error", version: "0.0.0", description: "Could not load configuration file." }));
  }, []);

  const ua = navigator.userAgent;
  const chromeMatch = ua.match(/Chrome\/([\d.]+)/);
  const chromeVersionString = chromeMatch ? chromeMatch[1] : "Unknown";
  let chromeMajorVersion = 0;
  if (chromeMatch && chromeMatch[1]) chromeMajorVersion = parseInt(chromeMatch[1].split('.')[0], 10);
  const isVersionSupported = chromeMajorVersion >= 105;
  const versionColor = isVersionSupported ? "#4ade80" : "#f87171";

  const global = settings.global;
  const bossData = settings.bosses[activeBossConfig.id] || {};
  const specific = bossData.specific || {};
  const notifs = bossData.notifications || {};

  const updateGlobal = (key: string, val: any) => setSettings((prev: SettingsType) => ({ ...prev, global: { ...prev.global, [key]: val } }));
  const updateBossSpecific = (key: string, val: any) => {
    const bossId = activeBossConfig.id;
    setSettings((prev: SettingsType) => ({ ...prev, bosses: { ...prev.bosses, [bossId]: { ...prev.bosses[bossId], specific: { ...prev.bosses[bossId].specific, [key]: val } } } }));
  };
  const updateNotification = (key: string, val: NotificationConfig) => {
    const bossId = activeBossConfig.id;
    setSettings((prev: SettingsType) => ({ ...prev, bosses: { ...prev.bosses, [bossId]: { ...prev.bosses[bossId], notifications: { ...prev.bosses[bossId].notifications, [key]: val } } } }));
  };

  const mainTabs = ["general", "mechanics", "notifications", "audio", "detection"];

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", height: "100%",
        backgroundImage: `url('${bgUrl}')`, backgroundRepeat: "repeat",
        color: "#cbd5e1", fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* HEADER */}
      <div style={{ padding: "0 15px", background: "rgba(0, 0, 0, 0.6)", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center", height: "45px", flexShrink: 0, backdropFilter: "blur(5px)" }}>
        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#f1f5f9", letterSpacing: "0.5px" }}>{activeBossConfig.name} Configuration</span>
        <button onClick={onClose} className="close-btn" style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* SIDEBAR */}
        <div style={{ width: "160px", background: "rgba(0, 0, 0, 0.4)", borderRight: "1px solid #333", display: "flex", flexDirection: "column", paddingTop: "10px", paddingBottom: "10px", flexShrink: 0, backdropFilter: "blur(3px)" }}>
          {mainTabs.map((tab) => {
            let suffix = null;
            if (tab === "detection") suffix = <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: getStatusColor(statusState), boxShadow: `0 0 8px ${getStatusColor(statusState)}`, marginRight: "4px" }} />;
            return <TabButton key={tab} id={tab} label={tab.charAt(0).toUpperCase() + tab.slice(1)} activeTab={activeTab} onClick={setActiveTab} suffix={suffix} />;
          })}
          <div style={{ marginTop: "auto" }}></div>
          <TabButton id="information" label="Information" activeTab={activeTab} onClick={setActiveTab} suffix={<div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "1px solid #94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#94a3b8", fontWeight: "bold" }}>i</div>} />
        </div>

        {/* CONTENT AREA */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          
          {/* TAB: INFORMATION */}
          {activeTab === "information" && (
            <div style={{ animation: "fadeIn 0.2s ease", display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ background: "rgba(0, 0, 0, 0.3)", border: "1px solid #333", borderRadius: "6px", padding: "20px", fontSize: "0.9rem", color: "#cbd5e1", lineHeight: "1.6", marginBottom: "15px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                <p style={{ marginTop: 0, marginBottom: "15px", whiteSpace: "pre-line" }}>{`Welcome to the Solak Mechanic Tracker!\nThis application is built to help you with timing inputs around game mechanics by providing you with a clear visual / audio indication of when to expect them.\n\nAs this project is still in development, you may encounter bugs and instabilities along the way.`}</p>
                <p style={{ margin: 0 }}>Please take a moment to report them to help improve the experience for everyone: <a href="https://discord.com/channels/429001600523042818/1444381415666880644" target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>Feedback Channel (Solak Discord)</a></p>
              </div>
              {!isVersionSupported && (
                 <div style={{ marginTop: "10px", marginBottom: "10px", padding: "15px", background: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.4)", borderRadius: "6px", color: "#fca5a5", fontSize: "0.85rem", lineHeight: "1.5" }}>
                 <strong>Warning:</strong> This application requires Chromium Version 105 as a minimum dependancy. Please update your browser and Alt1 toolkit, followed by a system reboot to continue.
               </div>
              )}
              <div style={{ marginTop: "auto", paddingTop: "20px", fontFamily: "Consolas, monospace", fontSize: "0.75rem", color: "#64748b", lineHeight: "1.5" }}>
                <div style={{ color: "#94a3b8", fontWeight: 600, fontSize: "0.8rem", marginBottom: "4px" }}>{appConfig.appName}</div>
                <div>{appConfig.description}</div>
                <div>Version: {appConfig.version}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span>Chromium Version: <span style={{ color: versionColor }}>{chromeVersionString}</span></span></div>
              </div>
            </div>
          )}

          {/* TAB: GENERAL */}
          {activeTab === "general" && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <Select label="Timer Display" value={global.timerUnits} onChange={(e: any) => updateGlobal("timerUnits", e.target.value)} options={[{ label: "Seconds", value: "seconds" }, { label: "Ticks", value: "ticks" }]} />
              <div style={{ marginTop: "0" }}>
                <div className="setting-row" style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1f1f1f", alignItems: "center", transition: "background 0.2s" }}>
                  <span style={{ fontSize: "0.95rem", color: "#e2e8f0" }}>Tick Markers</span>
                  <Checkbox checked={global.showTickMarkers} onChange={(val: boolean) => updateGlobal("showTickMarkers", val)} />
                </div>
                <div className="setting-row" style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1f1f1f", alignItems: "center", transition: "background 0.2s" }}>
                  <span style={{ fontSize: "0.95rem", color: "#e2e8f0" }}>Global Cooldown Markers</span>
                  <Checkbox checked={global.showGCDMarkers} onChange={(val: boolean) => updateGlobal("showGCDMarkers", val)} />
                </div>
                <div className="setting-row" style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1f1f1f", alignItems: "center", transition: "background 0.2s" }}>
                  <span style={{ fontSize: "0.95rem", color: "#e2e8f0" }}>Latest Stall Marker</span>
                  <Checkbox checked={global.showStallMarker} onChange={(val: boolean) => updateGlobal("showStallMarker", val)} />
                </div>
              </div>
            </div>
          )}

          {/* TAB: MECHANICS */}
          {activeTab === "mechanics" && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              {activeBossConfig.customSettings.map((def: any) => {
                if (def.type === "select") {
                  return <Select key={def.key} label={def.label} description={def.description} info={def.info} value={specific[def.key]} onChange={(e: any) => updateBossSpecific(def.key, e.target.value)} options={def.options} />;
                }
                return null;
              })}
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <CategoryHeader title="Tag Timers" showColumns={true} />
              {activeBossConfig.mechanics.filter((m: any) => m.category === "tag").map((mech: any) => (
                <NotificationRow key={mech.id} label={mech.timers?.[0]?.label || mech.id} config={notifs[mech.id]} max={mech.timers?.[0] ? mech.timers[0].getDuration(specific) : 120} info={mech.timers?.[0]?.info} description={mech.timers?.[0]?.description} onChange={(c: any) => updateNotification(mech.id, c)} />
              ))}
              <CategoryHeader title="Mechanic Timers" showColumns={true} />
              {activeBossConfig.mechanics.filter((m: any) => m.category === "mechanic").map((mech: any) => (
                <NotificationRow key={mech.id} label={mech.timers?.[0]?.label || mech.id} config={notifs[mech.id]} max={mech.timers?.[0] ? mech.timers[0].getDuration(specific) : 120} info={mech.timers?.[0]?.info} description={mech.timers?.[0]?.description} onChange={(c: any) => updateNotification(mech.id, c)} />
              ))}
            </div>
          )}

          {/* TAB: AUDIO */}
          {activeTab === "audio" && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <div style={{ marginBottom: "25px", background: "linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(0,0,0,0.2) 100%)", padding: "5px 12px", borderRadius: "0 4px 4px 0", borderLeft: "3px solid #3b82f6", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}>
                <Slider label="Master Volume" value={global.audio?.masterVolume ?? 50} min={0} max={100} onChange={(e: any) => updateGlobal("audio", { ...global.audio, masterVolume: parseInt(e.target.value) })} onRelease={() => playTone(880, global.audio?.masterVolume ?? 50)} />
              </div>
              <AudioSection title="Tag Timers" config={global.audio.tags} masterVolume={global.audio.masterVolume} onChange={(c: any) => updateGlobal("audio", { ...global.audio, tags: c })} />
              <AudioSection title="Mechanic Timers" config={global.audio.mechanics} masterVolume={global.audio.masterVolume} onChange={(c: any) => updateGlobal("audio", { ...global.audio, mechanics: c })} />
            </div>
          )}

          {/* TAB: DETECTION */}
          {activeTab === "detection" && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <DetectionStatusBox status={statusState} />
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button onClick={showAlignment} disabled={!isLocked} className="detection-btn" style={{ flex: 1, padding: "10px", background: isLocked ? "rgba(37, 99, 235, 0.2)" : "rgba(51, 65, 85, 0.2)", color: isLocked ? "#60a5fa" : "#94a3b8", border: isLocked ? "1px solid #2563eb" : "1px solid #475569", borderRadius: "6px", cursor: isLocked ? "pointer" : "not-allowed", fontWeight: 600, fontSize: "0.85rem", transition: "all 0.2s", backdropFilter: "blur(2px)" }}>Show Chat Position</button>
                <button onClick={onReset} className="detection-btn-red" style={{ flex: 1, padding: "10px", background: "rgba(220, 38, 38, 0.2)", color: "#f87171", border: "1px solid #dc2626", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", transition: "all 0.2s", backdropFilter: "blur(2px)" }}>Reset Chat Position</button>
              </div>
              
              {/* Scan Rate */}
              <div className="setting-row" style={{ borderBottom: "1px solid #1f1f1f", padding: "12px 0", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.95rem", color: "#e2e8f0", fontWeight: 500 }}>Scan Rate (ms)</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>Lower gives more accuracy, at the cost of CPU. Default: 50</div>
                </div>
                <div style={{ width: "130px", padding: "0 5px" }}>
                  <Stepper value={global.tickRate} min={5} max={600} step={5} onChange={(val: number) => updateGlobal("tickRate", val)} />
                </div>
              </div>
              
              <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #333" }}>
                <button onClick={onOpenDebugger} className="secondary-btn" style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid #475569", color: "#94a3b8", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", transition: "all 0.2s" }}>Open OCR Debugger</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } } 
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: transparent; } 
        ::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; } 
        ::-webkit-scrollbar-thumb:hover { background: #64748b; } 
        a:hover { text-decoration: underline; }
        .setting-row:hover { background: rgba(255, 255, 255, 0.03); }
        .sidebar-btn:hover { color: #f1f5f9 !important; background: rgba(255,255,255,0.05); }
        .secondary-btn:hover { border-color: #64748b !important; color: #cbd5e1 !important; }
        .detection-btn:hover:not(:disabled) { background: rgba(37, 99, 235, 0.3) !important; box-shadow: 0 0 10px rgba(37, 99, 235, 0.3); }
        .detection-btn-red:hover { background: rgba(220, 38, 38, 0.3) !important; box-shadow: 0 0 10px rgba(220, 38, 38, 0.3); }
        .close-btn:hover { color: #fff !important; transform: scale(1.1); transition: transform 0.2s; }
      `}</style>
    </div>
  );
};