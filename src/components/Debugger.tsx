import React from "react";
import { ChatLine } from "../core/types";
import { PopoutWindow } from "./Popout";

interface DebuggerWindowProps {
  lines: ChatLine[];
  onClose: () => void;
  width?: number;
  height?: number;
}

/**
 * OCR Debugger View
 * * Displays the raw text feed from Alt1 to help diagnose regex issues.
 */
export const Debugger = ({ lines, onClose, width, height }: DebuggerWindowProps) => (
  <PopoutWindow onClose={onClose} title="OCR Debugger" width={width} height={height}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundImage: "url('/background.png')",
        backgroundRepeat: "repeat",
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
          style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}
        >
          Close
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {lines.length === 0 && <span style={{ color: "#666" }}>Waiting for text...</span>}
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