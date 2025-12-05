import React from "react";
import { InfoLabel } from "./Tooltip";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRelease?: (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => void;
  description?: string;
  info?: string;
}

/**
 * Range Slider Row
 * * Replaces RangeRow.
 */
export const Slider = ({ label, value, min, max, onChange, onRelease, description, info }: SliderProps) => {
  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <InfoLabel label={label} info={info} />
          <span
            style={{
              fontSize: "0.9rem",
              color: "#aaa",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {value}%
          </span>
        </div>
        
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          onMouseUp={onRelease}
          onTouchEnd={onRelease}
          style={{ width: "100%", cursor: "pointer", accentColor: "#3b82f6" }}
        />
      </div>
      
      {description && (
        <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "4px" }}>
          {description}
        </div>
      )}
    </div>
  );
};