import * as models from "../../wailsjs/go/models";
import { GetConfig, SaveConfig, GetRunningProcesses, Run, Stop } from "../../wailsjs/go/main/App";
import type { FileConfig, ProcessInfo } from "./types";
import { EventsOn } from "../../wailsjs/runtime/runtime";


function fromWailsConfig(cfg: models.sleego.FileConfig): FileConfig {
  return {
    apps: cfg.apps,
    shutdown: cfg.shutdown,
    categories: cfg.categories ?? {},
  };
}

function toWailsConfig(cfg: FileConfig): models.sleego.FileConfig {
  return new models.sleego.FileConfig({
    apps: cfg.apps,
    shutdown: cfg.shutdown,
    categories: cfg.categories ?? {},
  });
}

function fromWailsProcess(p: models.sleego.ProcessInfo): ProcessInfo {
  return {
    name: p.Name,
    pid: p.Pid,
    category: p.Category ?? [],
  };
}

export const wailsApi = {
  async getConfig(): Promise<FileConfig> {
    const cfg = await GetConfig();
    return fromWailsConfig(cfg);
  },

  async saveConfig(cfg: FileConfig): Promise<void> {
    await SaveConfig(toWailsConfig(cfg));
  },

  async getRunningProcesses(): Promise<ProcessInfo[]> {
    const ps = await GetRunningProcesses();
    return ps.map(fromWailsProcess);
  },

  run(): Promise<void> {
    return Run();
  },

  stop(): Promise<void> {
    return Stop();
  }
};
