import { mixColor } from "@alt1/base";

export const alt1 = window.alt1;

export const displayDetectionMessage = (
  message: string,
  duration: number,
  size?: number
) => {
  if (!alt1) return;
  try {
    alt1.overLayClearGroup("1");
    alt1.overLaySetGroup("1");
    alt1.overLayTextEx(
      message,
      mixColor(153, 255, 153),
      size || 20,
      Math.round(alt1.rsWidth / 2),
      Math.round(alt1.rsHeight / 3),
      duration,
      "serif",
      true,
      true
    );
  } catch (e) {
    console.error("Alt1 overlay error", e);
  }
};
