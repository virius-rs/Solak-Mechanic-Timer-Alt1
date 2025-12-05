import React from "react";
import { InfoLabel } from "./Tooltip";

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  description?: string;
  info?: string;
}

/**
 * Styled Select Row
 * * Replaces SelectRow and StyledSelectRow.
 */
export const Select = ({ label, value, onChange, options, description, info }: SelectProps) => {
  return (
    <div
      style={{
        padding: "10px 0",
        borderBottom: "1px solid #1f1f1f",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <InfoLabel label={label} info={info} />
          {description && (
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
              {description}
            </div>
          )}
        </div>
        
        <select
          value={value}
          onChange={onChange}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid #444",
            color: "#eee",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "0.85rem",
            outline: "none",
            cursor: "pointer",
            height: "28px",
            width: "150px",
            textAlign: "center",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: "#222", color: "#eee" }}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};