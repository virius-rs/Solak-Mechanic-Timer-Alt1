import React from "react";

interface IconButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  width?: string;
  height?: string;
}

/**
 * Standard Icon Button
 * * Used for audio previews and small actions.
 */
export const IconButton = ({ icon, onClick, width = "28px", height = "28px" }: IconButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0",
        width,
        height,
        background: "#334155",
        border: "1px solid #475569",
        borderRadius: "4px",
        color: "#e2e8f0",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all 0.1s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#475569";
        e.currentTarget.style.borderColor = "#64748b";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#334155";
        e.currentTarget.style.borderColor = "#475569";
      }}
    >
      {icon}
    </button>
  );
};