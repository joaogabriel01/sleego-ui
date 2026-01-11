import type { FileConfig, ProcessInfo } from "./types";
import { mockApi } from "./mock";
import { wailsApi } from "./wails";

export type SleegoApi = {
  getConfig(): Promise<FileConfig>;
  saveConfig(cfg: FileConfig): Promise<void>;

  getRunningProcesses(): Promise<ProcessInfo[]>;

  run(): Promise<void>;
};

const useMock = import.meta.env.VITE_USE_MOCK === "1";

export const api: SleegoApi = useMock ? mockApi : wailsApi;
