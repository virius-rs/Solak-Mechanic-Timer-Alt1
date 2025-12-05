import React, { useState, useEffect, useRef } from "react";

interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  step?: number;
  formatTicks?: boolean;
}

/**
 * Unified Stepper
 * * Consolidates 'Stepper', 'NumberRow', and 'StyledStepper'.
 * * Features press-and-hold scrolling logic.
 */
export const Stepper = ({ value, min, max, onChange, step = 1, formatTicks = false }: StepperProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timerRef.current = null;
    intervalRef.current = null;
  };

  const modify = (amount: number) => {
    setInternalValue((prev: number) => {
      const next = Math.min(max, Math.max(min, prev + amount));
      if (next !== prev) {
        onChange(next);
      } else {
        // Stop scrolling if we hit the wall
        clearTimers();
      }
      return next;
    });
  };

  const startScrolling = (amount: number) => {
    // Prevent starting if we are already at the limit
    if ((amount < 0 && internalValue <= min) || (amount > 0 && internalValue >= max)) return;

    modify(amount);
    timerRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        modify(amount);
      }, 50);
    }, 400);
  };

  const stopScrolling = () => {
    clearTimers();
  };

  const isAtMin = internalValue <= min;
  const isAtMax = internalValue >= max;
  const borderColor = "#444";
  const backgroundColor = "rgba(255, 255, 255, 0.05)";

  const displayValue = formatTicks
    ? `${(internalValue * 0.6).toFixed(1)}s (${internalValue}t)`
    : internalValue;

  return (
    <div style={{ display: "flex", height: "28px", width: "100%", alignItems: "center" }}>
      <button
        onMouseDown={(e) => {
          if (e.button === 0 && !isAtMin) startScrolling(-step);
        }}
        onMouseUp={stopScrolling}
        onMouseLeave={stopScrolling}
        disabled={isAtMin}
        style={{
          width: "24px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: backgroundColor,
          border: `1px solid ${borderColor}`,
          borderRight: "none",
          borderRadius: "4px 0 0 4px",
          color: "#eee",
          padding: 0,
          fontSize: "1.1rem",
          lineHeight: 1,
          transition: "background 0.1s, opacity 0.2s",
          opacity: isAtMin ? 0.3 : 1,
          cursor: isAtMin ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(e) => !isAtMin && (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
        onMouseOut={(e) => (e.currentTarget.style.background = backgroundColor)}
      >
        -
      </button>

      <div
        style={{
          flex: 1,
          height: "100%",
          background: backgroundColor,
          border: `1px solid ${borderColor}`,
          borderLeft: `1px solid ${borderColor}`,
          borderRight: `1px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.85rem",
          fontWeight: 600,
          color: "#eee",
          userSelect: "none",
        }}
      >
        {displayValue}
      </div>

      <button
        onMouseDown={(e) => {
          if (e.button === 0 && !isAtMax) startScrolling(step);
        }}
        onMouseUp={stopScrolling}
        onMouseLeave={stopScrolling}
        disabled={isAtMax}
        style={{
          width: "24px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: backgroundColor,
          border: `1px solid ${borderColor}`,
          borderLeft: "none",
          borderRadius: "0 4px 4px 0",
          color: "#eee",
          padding: 0,
          fontSize: "1rem",
          lineHeight: 1,
          transition: "background 0.1s, opacity 0.2s",
          opacity: isAtMax ? 0.3 : 1,
          cursor: isAtMax ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(e) => !isAtMax && (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
        onMouseOut={(e) => (e.currentTarget.style.background = backgroundColor)}
      >
        +
      </button>
    </div>
  );
};