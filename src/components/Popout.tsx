import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

interface PopoutWindowProps {
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  width?: number;
  height?: number;
}

/**
 * Popout Window Wrapper
 * * Handles opening a native browser popup window.
 * * Injects styles from the parent window to ensure consistent theming.
 */
export const PopoutWindow = ({
  onClose,
  children,
  title = "Solak Mechanic Timer",
  width = 1000,
  height = 1000,
}: PopoutWindowProps) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const windowRef = useRef<Window | null>(null);

  useEffect(() => {
    try {
      const win = window.open(
        "",
        `SolakPopout_${Date.now()}`,
        `width=${width},height=${height},scrollbars=yes,resizable=yes`
      );

      if (!win) {
        console.error("Popout blocked!");
        onClose();
        return;
      }

      windowRef.current = win;
      win.document.title = title;

      // Inject Base Styles
      const style = win.document.createElement("style");
      style.innerHTML = `html, body { margin: 0; padding: 0; background: #121212; height: 100%; overflow: hidden; } * { box-sizing: border-box; } ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: #1a1a1a; } ::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }`;
      win.document.head.appendChild(style);

      // Copy Stylesheets from Main Window to maintain CSS variables and fonts
      Array.from(document.styleSheets).forEach((styleSheet) => {
        try {
          if (styleSheet.href) {
            const link = win.document.createElement("link");
            link.rel = "stylesheet";
            link.href = styleSheet.href;
            win.document.head.appendChild(link);
          }
        } catch (e) {
          // Cross-origin stylesheets may block access, ignore them
        }
      });

      const div = win.document.createElement("div");
      div.style.height = "100%";
      win.document.body.appendChild(div);
      setContainer(div);

      win.onbeforeunload = () => {
        onClose();
      };
    } catch (e) {
      console.error("Popout failed to open", e);
      onClose();
    }

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