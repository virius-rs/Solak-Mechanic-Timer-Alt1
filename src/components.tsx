import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Timer, ChatLine } from "./types";

// --- ERROR BOUNDARY ---
// Catches crashes in children and displays a fallback UI
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "10px",
            color: "#f87171",
            background: "#1a0000",
            height: "100%",
            fontFamily: "monospace",
            fontSize: "11px",
            overflow: "auto",
          }}
        >
          <strong>Something went wrong.</strong>
          <br />
          <br />
          {this.state.error && this.state.error.toString()}
          <br />
          <br />
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#333",
              color: "#fff",
              border: "1px solid #666",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Status Box ---
export const PassiveStatus = ({
  text,
  statusState,
}: {
  text: string;
  statusState: "red" | "yellow" | "green";
}) => {
  let color = "#aaa";
  let borderColor = "#444";
  let bg = "rgba(255,255,255,0.03)";
  let label = text;

  if (statusState === "red") {
    color = "#f87171";
    borderColor = "#7f1d1d";
    bg = "rgba(255, 0, 0, 0.1)";
    label = "Open Settings";
  } else if (statusState === "yellow") {
    color = "#facc15";
    borderColor = "#854d0e";
    bg = "rgba(234, 179, 8, 0.1)";
    label = text === "Ready" ? "Idle" : text;
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color,
        fontSize: "0.85rem",
        border:
          statusState === "red"
            ? `1px solid ${borderColor}`
            : `1px dashed ${borderColor}`,
        borderRadius: "4px",
        background: bg,
        userSelect: "none",
        whiteSpace: "nowrap",
        overflow: "hidden",
        fontWeight: 500,
        paddingBottom: "2px",
        boxSizing: "border-box",
      }}
    >
      {label}
    </div>
  );
};

// --- Progress Bar ---
export const ProgressBar = ({
  timer,
  statusText,
  units,
}: {
  timer: Timer;
  statusText: string;
  units?: string;
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(interval);
  }, []);

  const elapsedMs = now - timer.startTime;
  const totalMs = timer.totalTicks * 600;
  const remainingMs = Math.max(0, totalMs - elapsedMs);
  const ticksRemaining = Math.ceil(remainingMs / 600);

  if (ticksRemaining > timer.visibilityThreshold || ticksRemaining <= 0) {
    return <PassiveStatus text={statusText} statusState="green" />;
  }

  const visualDurationTicks = Math.min(
    timer.totalTicks,
    timer.visibilityThreshold
  );
  const effectiveSpan = Math.max(1, visualDurationTicks - 1);
  const ticksElapsedVisible = visualDurationTicks - ticksRemaining;
  const percentage = Math.min(
    100,
    Math.max(0, (ticksElapsedVisible / effectiveSpan) * 100)
  );

  const isLastTick = ticksRemaining <= 1;
  const currentColor = isLastTick ? "#4ade80" : timer.color;
  const timeDisplay =
    units === "ticks"
      ? `${ticksRemaining}t`
      : `${(ticksRemaining * 0.6).toFixed(1)}s`;

  return (
    <div
      style={{
        background: "#1e1e1e",
        borderRadius: "4px",
        height: "100%",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: `${percentage}%`,
          background: currentColor,
          opacity: 0.4,
          transition: "width 0.1s linear",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "8px",
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          fontWeight: "bold",
          color: "#fff",
          fontSize: "0.8rem",
          textShadow: "0 1px 2px rgba(0,0,0,0.8)",
        }}
      >
        {timer.label}
      </div>
      <div
        style={{
          position: "absolute",
          right: "8px",
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          fontFamily: "monospace",
          fontWeight: "bold",
          color: "#fff",
          fontSize: "0.9rem",
          textShadow: "0 1px 2px rgba(0,0,0,0.8)",
        }}
      >
        {timeDisplay}
      </div>
    </div>
  );
};

// --- Popout Window (Generic) ---
export const PopoutWindow = ({
  onClose,
  children,
  title = "Solak Mechanic Timer",
  width = 370,
  height = 595,
}: {
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  width?: number;
  height?: number;
}) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const windowRef = useRef<Window | null>(null);

  useEffect(() => {
    const win = window.open(
      "",
      `SolakPopout_${Date.now()}`,
      `width=${width},height=${height},scrollbars=yes,resizable=yes`
    );
    if (!win) {
      onClose();
      return;
    }

    windowRef.current = win;
    win.document.title = title;

    const style = win.document.createElement("style");
    style.innerHTML = `
      html, body { margin: 0; padding: 0; background: #121212; height: 100%; overflow: hidden; }
      * { box-sizing: border-box; }
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #1a1a1a; }
      ::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
    `;
    win.document.head.appendChild(style);

    Array.from(document.styleSheets).forEach((styleSheet) => {
      try {
        if (styleSheet.href) {
          const link = win.document.createElement("link");
          link.rel = "stylesheet";
          link.href = styleSheet.href;
          win.document.head.appendChild(link);
        }
      } catch (e) {}
    });

    const div = win.document.createElement("div");
    div.style.height = "100%";
    win.document.body.appendChild(div);
    setContainer(div);

    win.onbeforeunload = () => {
      onClose();
    };

    return () => {
      if (windowRef.current) {
        windowRef.current.onbeforeunload = null;
        if (!windowRef.current.closed) windowRef.current.close();
      }
    };
  }, []);

  if (!container) return null;
  return ReactDOM.createPortal(children, container);
};

// --- Debugger Window (Specific) ---
export const DebuggerWindow = ({
  lines,
  onClose,
}: {
  lines: ChatLine[];
  onClose: () => void;
}) => {
  return (
    <PopoutWindow
      onClose={onClose}
      title="OCR Debugger"
      width={400}
      height={300}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "#000",
          color: "#eee",
          fontFamily: "Consolas, monospace",
          fontSize: "12px",
          padding: "10px",
        }}
      >
        <div
          style={{
            marginBottom: "10px",
            borderBottom: "1px solid #333",
            paddingBottom: "5px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <strong>Live OCR Feed</strong>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#888",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {lines.length === 0 && (
            <span style={{ color: "#666" }}>Waiting for text...</span>
          )}
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                borderBottom: "1px solid #222",
                padding: "2px 0",
                minHeight: "16px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: "#fff",
              }}
            >
              {line.text}
            </div>
          ))}
        </div>
      </div>
    </PopoutWindow>
  );
};

export const NumberRow = ({
  label,
  description,
  value,
  onChange,
  min,
  max,
  noBorder,
}: any) => (
  <div
    style={{
      padding: "10px 0",
      borderBottom: noBorder ? "none" : "1px solid #1e1e1e",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: "0.9rem", color: "#ddd" }}>{label}</span>
      <input
        type="number"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        style={{
          background: "#222",
          color: "#fff",
          border: "1px solid #333",
          padding: "4px 8px",
          borderRadius: "4px",
          width: "180px",
          textAlign: "center",
        }}
      />
    </div>
    {description && (
      <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "4px" }}>
        {description}
      </div>
    )}
  </div>
);

export const SelectRow = ({
  label,
  description,
  value,
  onChange,
  options,
}: any) => (
  <div style={{ padding: "10px 0", borderBottom: "1px solid #1e1e1e" }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: "0.9rem", color: "#ddd" }}>{label}</span>
      <select
        value={value}
        onChange={onChange}
        style={{
          background: "#222",
          color: "#fff",
          border: "1px solid #333",
          padding: "4px 8px",
          borderRadius: "4px",
          width: "180px",
        }}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
    {description && (
      <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "4px" }}>
        {description}
      </div>
    )}
  </div>
);
