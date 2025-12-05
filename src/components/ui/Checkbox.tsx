import React from "react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * Styled Checkbox
 * * Replaces CustomCheckbox and StyledCheckbox.
 */
export const Checkbox = ({ checked, onChange }: CheckboxProps) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: "18px",
        height: "18px",
        background: checked ? "#3b82f6" : "rgba(255,255,255,0.05)",
        border: `1px solid ${checked ? "#3b82f6" : "#444"}`,
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!checked) e.currentTarget.style.borderColor = "#60a5fa";
      }}
      onMouseLeave={(e) => {
        if (!checked) e.currentTarget.style.borderColor = "#444";
      }}
    >
      {checked && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
    </div>
  );
};