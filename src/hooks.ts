import { useState, useEffect, useRef, useCallback } from "react";
import ChatBoxReader from "@alt1/chatbox";
import * as a1lib from "@alt1/base";
import { ChatLine, Settings } from "./types";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

export const useChatBoxReader = (settings: Settings) => {
  const readerRef = useRef<ChatBoxReader | null>(null);
  const intervalRef = useRef<number | null>(null);
  const lastContentRef = useRef<string>("");

  const [lines, setLines] = useState<ChatLine[]>([]);
  const [pos, setPos] = useState<any>(null);
  const [lastReadTime, setLastReadTime] = useState<number>(0);

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

        const savedPos = localStorage.getItem("solak-chat-pos");
        if (savedPos) {
          const parsed = JSON.parse(savedPos);
          if (parsed?.mainbox) {
            instance.pos = parsed;
            setPos(parsed);
          }
        }
        readerRef.current = instance;
      }
    } catch (e) {
      console.error("Failed to init reader", e);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const loop = () => {
      const reader = readerRef.current;
      if (!reader) return;

      // 1. Find Position if missing
      if (!reader.pos) {
        reader.find();

        // FIX: Cast to 'any' to tell TypeScript we know 'reader.pos' has changed
        // This bypasses the "Property 'mainbox' does not exist on type 'never'" error.
        const newPos = reader.pos as any;

        if (newPos) {
          setPos(newPos);
          localStorage.setItem("solak-chat-pos", JSON.stringify(newPos));

          window.alt1?.overLayRect(
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

      // 2. Read Text
      if (reader.pos) {
        try {
          const newLines = reader.read();
          if (newLines && newLines.length > 0) {
            const contentString = newLines.map((l) => l.text).join("");

            if (contentString !== lastContentRef.current) {
              lastContentRef.current = contentString;
              setLines(newLines);
              setLastReadTime(Date.now());
            } else {
              if (Date.now() - lastReadTime > 1000) {
                setLastReadTime(Date.now());
              }
            }
          }
        } catch (e) {}
      }
    };

    const rate = Math.max(5, settings.tickRate || 50);
    intervalRef.current = window.setInterval(loop, rate);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [settings.tickRate, lastReadTime]);

  const resetReader = useCallback(() => {
    localStorage.removeItem("solak-chat-pos");
    setPos(null);
    setLines([]);
    lastContentRef.current = "";
    if (readerRef.current) {
      readerRef.current.pos = null;
    }
  }, []);

  const showOverlay = useCallback(() => {
    if (readerRef.current?.pos) {
      // Cast to any here too for safety, though usually not needed outside the if check
      const p = readerRef.current.pos as any;
      window.alt1?.overLayRect(
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
