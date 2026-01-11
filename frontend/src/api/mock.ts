import type { SleegoApi } from "./index";
import type { FileConfig, ProcessInfo } from "./types";

let config: FileConfig = {
  apps: [
    { name: "code", allowed_from: "09:00", allowed_to: "18:00" },
    { name: "games", allowed_from: "19:00", allowed_to: "23:30" },
  ],
  shutdown: "23:59",
  categories: {
    games: ["steam", "cs2", "lutris"],
  },
};

const processes: ProcessInfo[] = [
  { name: "systemd", pid: 1, category: [] },
  { name: "code", pid: 2312, category: [] },
  { name: "steam", pid: 1044, category: ["games"] },
  { name: "cs2", pid: 5561, category: ["games"] },
  { name: "discord", pid: 7780, category: [] },
];

export const mockApi: SleegoApi = {
  async getConfig() {
    await new Promise((r) => setTimeout(r, 150));
    return structuredClone(config);
  },

  async saveConfig(cfg) {
    await new Promise((r) => setTimeout(r, 150));
    config = structuredClone(cfg);
  },

  async getRunningProcesses() {
    await new Promise((r) => setTimeout(r, 150));
    return structuredClone(processes);
  },

  async run() {
    await new Promise((r) => setTimeout(r, 250));
  },
};
