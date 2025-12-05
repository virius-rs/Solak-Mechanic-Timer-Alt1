import React from "react";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

/**
 * Tooltip Wrapper
 * * Wraps an element and displays a hoverable information bubble.
 * * Uses inline styles to encapsulate the specific tooltip CSS logic previously injected globally.
 */
export const Tooltip = ({ children, content }: TooltipProps) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div
      className="tooltip-wrap"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{ position: "relative", cursor: "help", display: "flex", alignItems: "center" }}
    >
      {children}
      
      <div
        style={{
          visibility: visible ? "visible" : "hidden",
          opacity: visible ? 1 : 0,
          position: "absolute",
          top: "100%",
          left: 0,
          background: "#1e293b",
          border: "1px solid #475569",
          color: "#f1f5f9",
          padding: "10px 12px",
          borderRadius: "6px",
          fontSize: "0.75rem",
          whiteSpace: "normal",
          width: "max-content",
          maxWidth: "min(500px, calc(100vw - 200px))",
          zIndex: 999,
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
          marginTop: "5px",
          lineHeight: 1.4,
          transition: "opacity 0.2s",
          pointerEvents: "none",
        }}
      >
        {content}
      </div>
    </div>
  );
};

export const InfoLabel = ({ label, info }: { label: string; info?: string }) => {
  if (!info) {
    return <span style={{ fontSize: "0.95rem", color: "#e2e8f0", fontWeight: 500 }}>{label}</span>;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "fit-content" }}>
      <Tooltip content={info}>
        <span style={{ fontSize: "0.95rem", color: "#e2e8f0", fontWeight: 500 }}>{label}</span>
        <div
          style={{
            marginLeft: "8px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            color: "#94a3b8",
            fontSize: "10px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          ?
        </div>
      </Tooltip>
    </div>
  );
};