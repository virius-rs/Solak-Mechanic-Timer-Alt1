import React, { useState, useEffect } from "react";
import { Timer } from "../core/types";

// ============================================================================
// CONSTANTS & THEME
// ============================================================================

const TEXT_SHADOW_STANDARD = "0 1px 3px rgba(0,0,0,0.9), 0 0 1px rgba(0,0,0,1)";
const FONT_FAMILY_STANDARD = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

// ============================================================================
// PASSIVE STATUS COMPONENT
// ============================================================================

export const PassiveStatus = ({
  text,
  statusState,
  fontSize = "max(12px, min(55cqh, 12cqw))",
}: {
  text: string;
  statusState: "red" | "yellow" | "green";
  fontSize?: string;
}) => {
  let color = "#aaa";
  let bg = "rgba(255,255,255,0.03)";
  let fontWeight = 500;

  if (statusState === "red") {
    color = "#fca5a5";
    bg = "rgba(127, 29, 29, 0.4)";
    fontWeight = 700;
  } else if (statusState === "yellow") {
    color = "#fde047";
    bg = "rgba(234, 179, 8, 0.15)";
  }

  const displayText =
    statusState === "red"
      ? "Click Here!"
      : text === "Ready" && statusState === "yellow"
      ? "Idle"
      : text;

  return (
    <div
      style={{
        background: "transparent",
        borderRadius: "4px",
        height: "100%",
        width: "100%",
        position: "relative",
        border: "1px solid #000",
        boxShadow: `
            inset 0 1px 0 #4a5d73,
            inset 1px 0 0 #3b4b5d,
            inset -1px 0 0 #1c242e,
            inset 0 -1px 0 #11161c,
            0 2px 5px rgba(0,0,0,0.6)
        `,
        containerType: "size",
        overflow: "hidden",
        boxSizing: "border-box",
        cursor: statusState === "red" ? "pointer" : "default",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: bg, zIndex: 1 }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 45%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)`,
          zIndex: 2,
          opacity: 0.7,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
          fontWeight: fontWeight,
          zIndex: 10,
          whiteSpace: "nowrap",
          padding: "0 8px",
          fontFamily: FONT_FAMILY_STANDARD,
          fontSize: fontSize,
          textShadow: TEXT_SHADOW_STANDARD,
          letterSpacing: "0.5px",
        }}
      >
        {displayText}
      </div>
    </div>
  );
};

// ============================================================================
// PROGRESS BAR COMPONENT
// ============================================================================

export const ProgressBar = ({ 
  timer, 
  statusText, 
  units, 
  showTicks, 
  showGCD, 
  showStall,
  fontSize,
  fontSizePassive 
}: {
    timer: Timer;
    statusText: string;
    units: string;
    showTicks: boolean;
    showGCD: boolean;
    showStall: boolean;
    fontSize: string;
    fontSizePassive: string;
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

  // Return to passive status if visibility threshold passed
  if (ticksRemaining > timer.visibilityThreshold) {
    return <PassiveStatus text={statusText} statusState="green" fontSize={fontSizePassive} />;
  }

  const visualDurationTicks = Math.min(timer.totalTicks, timer.visibilityThreshold);
  const fillTarget = Math.min(100, ((visualDurationTicks - ticksRemaining + 1) / visualDurationTicks) * 100);

  const activeColorPhase = timer.colorPhases
    ? timer.colorPhases.sort((a, b) => a.remaining - b.remaining).find((p) => ticksRemaining <= p.remaining)
    : null;

  let baseColor = activeColorPhase ? activeColorPhase.color : "#29d8e6";
  const isLastTick = ticksRemaining <= 1;

  if (isLastTick) {
    baseColor = "#4ade80";
  }

  const timeDisplay =
    units === "ticks" ? `${Math.max(0, ticksRemaining)}t` : `${(Math.max(0, ticksRemaining) * 0.6).toFixed(1)}s`;

  return (
    <div
      style={{
        background: "#080b0f",
        borderRadius: "4px",
        height: "100%",
        width: "100%",
        position: "relative",
        overflow: "visible",
        border: "1px solid #000",
        boxShadow: `
            inset 0 1px 0 #4a5d73,
            inset 1px 0 0 #3b4b5d,
            inset -1px 0 0 #1c242e,
            inset 0 -1px 0 #11161c,
            0 2px 5px rgba(0,0,0,0.6)
        `,
        padding: "3px",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        containerType: "size",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "1px" }}>
        
        {/* Background & Fill */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            borderRadius: "1px",
            background: "rgba(8, 12, 16, 0.9)",
            zIndex: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: `${fillTarget}%`,
              transition: "width 0.2s cubic-bezier(0.2, 0.9, 0.3, 1.1)",
              zIndex: 1,
              background: baseColor,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 45%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)`,
              }}
            />
          </div>
        </div>

        {/* Current Tick Leading Edge Indicator */}
        {!isLastTick && (
          <div
            style={{
              position: "absolute",
              left: `${fillTarget}%`,
              top: "-2px",
              bottom: "-2px",
              width: "4px",
              background: "linear-gradient(to right, #fff9c4 0%, #fbc02d 50%, #f57f17 100%)",
              boxShadow: "0 0 8px rgba(255, 171, 0, 0.7), inset 1px 0 2px rgba(255,255,255,0.9)",
              zIndex: 2,
              transform: "translateX(-50%)",
              borderRadius: "1px",
              transition: "left 0.2s cubic-bezier(0.2, 0.9, 0.3, 1.1)",
            }}
          />
        )}

        {/* Tick Markers */}
        {Array.from({ length: visualDurationTicks - 1 }).map((_, i) => {
          const currentTickIndex = i + 1;
          const ticksAtLine = visualDurationTicks - currentTickIndex;
          const isGCD = ticksAtLine % 3 === 0;
          const isStallLine = ticksAtLine === 3;
          const isStallActive = isStallLine && showStall;
          const toothGradient = isStallActive
            ? "linear-gradient(to bottom, #ff5252, #b71c1c)"
            : "linear-gradient(to bottom, #5c7080, #2b3846)";

          return (
            <div
              key={`marker-${i}`}
              style={{
                position: "absolute",
                left: `${(currentTickIndex / visualDurationTicks) * 100}%`,
                top: 0,
                height: "100%",
                width: "0px",
                zIndex: 5,
                pointerEvents: "none",
              }}
            >
              {showTicks && (
                <div
                  style={{
                    position: "absolute",
                    left: "0",
                    top: 0,
                    height: "100%",
                    width: "1px",
                    background: "rgba(0, 0, 0, 0.5)",
                    boxShadow: "1px 0 0 rgba(255, 255, 255, 0.1)",
                    zIndex: 3,
                    transform: "translateX(-50%)",
                  }}
                />
              )}
              {isStallActive && (
                <div
                  style={{
                    position: "absolute",
                    left: "0",
                    top: 0,
                    height: "100%",
                    width: "2px",
                    background: "#ef4444",
                    boxShadow: "0 0 4px #ef4444",
                    zIndex: 3,
                    transform: "translateX(-50%)",
                  }}
                />
              )}
              {isGCD && showGCD && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      left: "0",
                      top: "-2px",
                      height: "calc(3px + 13cqmin)", 
                      width: "calc(5px + 16cqmin)",
                      background: toothGradient,
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                      filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.8))",
                      zIndex: 4,
                      transform: "translateX(-50%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: "0",
                      bottom: "-2px",
                      height: "calc(3px + 13cqmin)",
                      width: "calc(5px + 16cqmin)",
                      background: toothGradient,
                      clipPath: "polygon(0 100%, 100% 100%, 50% 0)",
                      filter: "drop-shadow(0 -1px 1px rgba(0,0,0,0.8))",
                      zIndex: 4,
                      transform: "translateX(-50%)",
                    }}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Timer Label */}
      <div
        style={{
          position: "absolute",
          left: "8px",
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          fontWeight: 700,
          color: "#fff",
          zIndex: 30,
          whiteSpace: "nowrap",
          fontSize: fontSize,
          fontFamily: FONT_FAMILY_STANDARD,
          textShadow: TEXT_SHADOW_STANDARD,
          letterSpacing: "0.5px",
        }}
      >
        {timer.label}
      </div>

      {/* Time Display */}
      <div
        style={{
          position: "absolute",
          right: "8px",
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          fontWeight: 700,
          color: "#fff",
          zIndex: 30,
          whiteSpace: "nowrap",
          fontSize: fontSize,
          fontFamily: FONT_FAMILY_STANDARD,
          textShadow: TEXT_SHADOW_STANDARD,
          letterSpacing: "0.5px",
        }}
      >
        {timeDisplay}
      </div>
    </div>
  );
};