export type AppConfig = {
  name: string;
  allowed_from: string; // "HH:MM"
  allowed_to: string; // "HH:MM"
};

export type FileConfig = {
  apps: AppConfig[];
  shutdown: string; // "HH:MM" or "" to disable
  categories: Record<string, string[]>;
};

export type ProcessInfo = {
  name: string;
  pid: number;
  category: string[];
};
