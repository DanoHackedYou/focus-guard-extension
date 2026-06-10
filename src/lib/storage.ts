import type { DomainStats, GuardSettings, StorageShape } from './types';

export const DEFAULT_SETTINGS: GuardSettings = {
  blockedDomains: ['youtube.com', 'x.com', 'twitter.com', 'instagram.com', 'tiktok.com', 'reddit.com'],
  focusModeEnabled: false,
  focusEndsAt: null,
  dailyGoalMinutes: 120,
};

export async function getStorage(): Promise<StorageShape> {
  const data = await chrome.storage.local.get(['settings', 'stats']);

  return {
    settings: {
      ...DEFAULT_SETTINGS,
      ...(data.settings ?? {}),
    },
    stats: data.stats ?? {},
  };
}

export async function saveSettings(settings: GuardSettings): Promise<void> {
  await chrome.storage.local.set({ settings });
}

export async function saveStats(stats: DomainStats): Promise<void> {
  await chrome.storage.local.set({ stats });
}

export async function resetStats(): Promise<void> {
  await chrome.storage.local.set({ stats: {} });
}
