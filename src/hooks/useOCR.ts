import { useState, useEffect, useRef, useCallback } from "react";
import ChatBoxReader from "alt1/chatbox";
import * as a1lib from "alt1/base";
import { ChatLine, Settings } from "../core/types";

/**
 * OCR Hook (Formerly useChatBoxReader)
 * * Manages the Alt1 ChatBoxReader instance.
 * * Handles finding the chatbox position and polling for new text lines.
 */
export const useOCR = (settings: Settings) => {
  const readerRef = useRef<ChatBoxReader | null>(null);
  const intervalRef = useRef<number | null>(null);

  // State Tracking
  const lastFindTimeRef = useRef<number>(0);
  const lastContentRef = useRef<string>("");

  const [lines, setLines] = useState<ChatLine[]>([]);
  const [pos, setPos] = useState<any>(null);
  const [lastReadTime, setLastReadTime] = useState<number>(0);

  // --- INITIALIZATION ---
  useEffect(() => {
    try {
      if (!readerRef.current) {
        const instance = new ChatBoxReader();
        instance.readargs = {
          colors: [
            a1lib.mixColor(255, 255, 255),
            a1lib.mixColor(127, 169, 255),
            a1lib.mixColor(0, 223, 255),
            a1lib.mixColor(155, 48, 255),
            a1lib.mixColor(153, 255, 153),
            a1lib.mixColor(45, 186, 21),
            a1lib.mixColor(45, 184, 20),
          ],
        };

        // Attempt to load saved position
        const savedPos = localStorage.getItem("alt1-chat-detect-pos");
        if (savedPos) {
          try {
            const parsed = JSON.parse(savedPos);
            if (parsed?.mainbox) {
              instance.pos = parsed;
              setPos(parsed);
            }
          } catch (e) {
            console.warn("[useOCR] Failed to parse saved position", e);
          }
        }
        readerRef.current = instance;
      }
    } catch (e) {
      console.warn("[useOCR] Alt1 not detected or failed to initialize", e);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // --- MAIN LOOP ---
  useEffect(() => {
    const loop = () => {
      const reader = readerRef.current;
      if (!reader) return;

      // 1. Find Chatbox (if lost)
      if (!reader.pos) {
        const now = Date.now();
        // Retry every 2 seconds
        if (now - lastFindTimeRef.current > 2000) {
          lastFindTimeRef.current = now;
          try {
            reader.find();
            const newPos = reader.pos as any;
            if (newPos) {
              setPos(newPos);
              localStorage.setItem("alt1-chat-detect-pos", JSON.stringify(newPos));
              
              if (window.alt1) {
                window.alt1.overLayRect(
                  a1lib.mixColor(0, 255, 0),
                  newPos.mainbox.rect.x,
                  newPos.mainbox.rect.y,
                  newPos.mainbox.rect.width,
                  newPos.mainbox.rect.height,
                  2000,
                  2
                );
              }
            }
          } catch (e) {
            // Find errors are expected if chatbox is obscured
          }
        }
      }

      // 2. Read Text (if found)
      if (reader.pos) {
        try {
          const newLines = reader.read();
          if (newLines) {
            const contentString = newLines.map((l: any) => l.text).join("");
            
            if (contentString !== lastContentRef.current) {
              lastContentRef.current = contentString;
              setLines(newLines);
              setLastReadTime(Date.now());
            } else {
              // Keep alive check for "Yellow" status
              if (Date.now() - lastReadTime > 1000) {
                setLastReadTime(Date.now());
              }
            }
          }
        } catch (e) {
          // If read fails, assume position is lost (e.g. window resized)
          console.warn("[useOCR] Read failed, resetting position", e);
          reader.pos = null;
          setPos(null);
        }
      }
    };

    const rate = Math.max(5, settings.global.tickRate || 50);
    intervalRef.current = window.setInterval(loop, rate);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [settings.global.tickRate, lastReadTime]);

  // --- ACTIONS ---

  const resetReader = useCallback(() => {
    localStorage.removeItem("alt1-chat-detect-pos");
    setPos(null);
    setLines([]);
    lastContentRef.current = "";
    lastFindTimeRef.current = 0;
    if (readerRef.current) {
      readerRef.current.pos = null;
    }
  }, []);

  const showOverlay = useCallback(() => {
    if (readerRef.current?.pos && window.alt1) {
      const p = readerRef.current.pos as any;
      window.alt1.overLayRect(
        a1lib.mixColor(37, 99, 235),
        p.mainbox.rect.x,
        p.mainbox.rect.y,
        p.mainbox.rect.width,
        p.mainbox.rect.height,
        3000,
        3
      );
    }
  }, []);

  return { lines, pos, lastReadTime, resetReader, showOverlay };
};