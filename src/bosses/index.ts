import { BossConfig } from "../core/types";

// ============================================================================
// AUTO-DISCOVERY REGISTRY
// ============================================================================

// Load all .ts files in this directory immediately
const modules = import.meta.glob("./*.ts", { eager: true });

export const BOSSES: Record<string, BossConfig> = {};

// Build the registry by scanning exports for valid BossConfig objects
for (const path in modules) {
  if (path.includes("index.ts")) continue;

  const mod = modules[path] as any;

  // Find the export that matches the BossConfig shape
  const config = Object.values(mod).find((item: any) => {
    return item && typeof item === "object" && "id" in item && "mechanics" in item;
  }) as BossConfig | undefined;

  if (config) {
    BOSSES[config.id] = config;
    console.log(`[BossRegistry] Loaded: ${config.name} (${config.id})`);
  } else {
    console.warn(`[BossRegistry] File ${path} has no valid BossConfig export.`);
  }
}

// ============================================================================
// HELPERS
// ============================================================================

export const DEFAULT_BOSS_ID = "solak";

export const getBossConfig = (id: string): BossConfig => {
  return BOSSES[id] || BOSSES[DEFAULT_BOSS_ID];
};