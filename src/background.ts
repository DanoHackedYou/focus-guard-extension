import { getDomain } from './lib/domain';
import { getStorage, saveSettings, saveStats } from './lib/storage';

async function trackActiveTab(): Promise<void> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  const domain = getDomain(activeTab?.url);

  if (!domain) return;

  const { stats } = await getStorage();
  stats[domain] = (stats[domain] ?? 0) + 60;
  await saveStats(stats);
}

async function disableExpiredFocusMode(): Promise<void> {
  const { settings } = await getStorage();

  if (settings.focusModeEnabled && settings.focusEndsAt && Date.now() > settings.focusEndsAt) {
    await saveSettings({
      ...settings,
      focusModeEnabled: false,
      focusEndsAt: null,
    });
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await getStorage();
  chrome.alarms.create('track-active-tab', { periodInMinutes: 1 });
  chrome.alarms.create('focus-expiration-check', { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'track-active-tab') {
    void trackActiveTab();
  }

  if (alarm.name === 'focus-expiration-check') {
    void disableExpiredFocusMode();
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_CURRENT_TAB_DOMAIN') {
    chrome.tabs.query({ active: true, currentWindow: true }).then(async (tabs) => {
      const domain = getDomain(tabs[0]?.url);
      const { settings } = await getStorage();
      const isBlocked = Boolean(
        domain &&
          settings.focusModeEnabled &&
          settings.blockedDomains.some((blocked) => domain === blocked || domain.endsWith(`.${blocked}`)),
      );

      sendResponse({ domain, isBlocked });
    });

    return true;
  }

  return false;
});
