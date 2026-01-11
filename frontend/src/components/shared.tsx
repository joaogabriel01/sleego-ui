import { FileConfig } from "../api/types";

export function isConfigured(procName: string, cfg: FileConfig): boolean {
  const inApps = cfg.apps.some((a) => a.name === procName);
  const inCats = Object.values(cfg.categories || {}).some((arr) =>
    (arr || []).includes(procName)
  );
  return inApps || inCats;
}

export function isCategoryRule(ruleName: string, cfg: FileConfig): boolean {
  return Object.prototype.hasOwnProperty.call(cfg.categories || {}, ruleName);
}

export function normalizeName(s: string) {
  return s.trim();
}

export function isValidTimeHHMM(s: string) {
  return /^\d{2}:\d{2}$/.test(s.trim());
}