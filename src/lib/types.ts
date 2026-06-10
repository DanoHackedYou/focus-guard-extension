export type GuardSettings = {
  blockedDomains: string[];
  focusModeEnabled: boolean;
  focusEndsAt: number | null;
  dailyGoalMinutes: number;
};

export type DomainStats = Record<string, number>;

export type StorageShape = {
  settings: GuardSettings;
  stats: DomainStats;
};

export type CurrentTabInfo = {
  domain: string | null;
  isBlocked: boolean;
};
