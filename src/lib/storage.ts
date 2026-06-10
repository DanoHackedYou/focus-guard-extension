import type { DomainStats, GuardSettings, StorageShape } from './types';

export const DEFAULT_SETTINGS: GuardSettings = {
  blockedDomains: [
    'youtube.com',
    'x.com',
    'twitter.com',
    'instagram.com',
    'tiktok.com',
    'reddit.com',
  ],
  focusModeEnabled: false,
  focusEndsAt: null,
  dailyGoalMinutes: 120,
};

export async function getStorage(): Promise<StorageShape> {
  const data = await chrome.storage.local.get(['settings', 'stats']);

  const storedSettings = (data.settings ?? {}) as Partial<GuardSettings>;
  const storedStats = (data.stats ?? {}) as DomainStats;

  return {
    settings: {
      ...DEFAULT_SETTINGS,
      ...storedSettings,
    },
    stats: storedStats,
  };
}

export async function saveSettings(settings: GuardSettings): Promise<void> {
  await chrome.storage.local.set({ settings });
}

export async function saveStats(stats: DomainStats): Promise<void> {
  await chrome.storage.local.set({ stats });
}

export async function resetStats(): Promise<void> {
  await chrome.storage.local.set({ stats: {} as DomainStats });
}
