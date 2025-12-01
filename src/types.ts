export interface Timer {
  id: string;
  label: string;
  startTime: number;
  totalTicks: number;
  color: string;
  visibilityThreshold: number;
}

export interface Settings {
  tickRate: number;
  p1Strategy: string;
  p4HitTiming: number;
  timerUnits: string;
  audioEnabled: boolean;
}

export interface ChatLine {
  text: string;
  fragments: any[];
}
