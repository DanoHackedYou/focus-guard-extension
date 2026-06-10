import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';

import { ScoreCard } from './components/ScoreCard';
import { domainMatches, formatMinutes } from './lib/domain';
import {
  DEFAULT_SETTINGS,
  getStorage,
  resetStats,
  saveSettings,
} from './lib/storage';
import type { CurrentTabInfo, DomainStats, GuardSettings } from './lib/types';

import './styles.css';

function PopupApp() {
  const [settings, setSettings] = useState<GuardSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<DomainStats>({});
  const [newDomain, setNewDomain] = useState('');
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [currentTab, setCurrentTab] = useState<CurrentTabInfo>({
    domain: null,
    isBlocked: false,
  });

  async function refresh(): Promise<void> {
    const data = await getStorage();

    setSettings(data.settings);
    setStats(data.stats);

    chrome.runtime.sendMessage(
      { type: 'GET_CURRENT_TAB_DOMAIN' },
      (response?: CurrentTabInfo) => {
        if (response) {
          setCurrentTab(response);
        }
      },
    );
  }

  useEffect(() => {
    void refresh();
  }, []);

  const sortedStats = useMemo(() => {
    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [stats]);

  const distractionSeconds = useMemo(() => {
    return Object.entries(stats).reduce((total, [domain, seconds]) => {
      const blocked = settings.blockedDomains.some((blockedDomain) =>
        domainMatches(domain, blockedDomain),
      );

      return blocked ? total + seconds : total;
    }, 0);
  }, [settings.blockedDomains, stats]);

  const totalSeconds = Object.values(stats).reduce(
    (sum, seconds) => sum + seconds,
    0,
  );

  const productiveMinutes = Math.max(
    0,
    Math.round((totalSeconds - distractionSeconds) / 60),
  );

  const focusRemaining = settings.focusEndsAt
    ? Math.max(0, settings.focusEndsAt - Date.now())
    : 0;

  const focusRemainingMinutes = Math.ceil(focusRemaining / 60000);

  async function updateSettings(next: GuardSettings): Promise<void> {
    setSettings(next);
    await saveSettings(next);
  }

  async function toggleFocusMode(): Promise<void> {
    if (settings.focusModeEnabled) {
      await updateSettings({
        ...settings,
        focusModeEnabled: false,
        focusEndsAt: null,
      });

      return;
    }

    await updateSettings({
      ...settings,
      focusModeEnabled: true,
      focusEndsAt: Date.now() + focusMinutes * 60 * 1000,
    });
  }

  async function addDomain(): Promise<void> {
    const cleanDomain = newDomain
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

    if (!cleanDomain || settings.blockedDomains.includes(cleanDomain)) {
      return;
    }

    await updateSettings({
      ...settings,
      blockedDomains: [...settings.blockedDomains, cleanDomain],
    });

    setNewDomain('');
  }

  async function removeDomain(domain: string): Promise<void> {
    await updateSettings({
      ...settings,
      blockedDomains: settings.blockedDomains.filter((item) => item !== domain),
    });
  }

  async function clearStats(): Promise<void> {
    await resetStats();
    setStats({});
  }

  return (
    <main className="popup">
      <header>
        <div>
          <span className="eyebrow">Chrome Extension</span>
          <h1>Focus Guard</h1>
        </div>

        <span className={settings.focusModeEnabled ? 'status on' : 'status'}>
          {settings.focusModeEnabled ? 'ON' : 'OFF'}
        </span>
      </header>

      <section className="current-tab">
        <span>Current tab</span>
        <strong>{currentTab.domain ?? 'Unavailable'}</strong>
        <em className={currentTab.isBlocked ? 'bad' : 'ok'}>
          {currentTab.isBlocked ? 'Blocked in focus mode' : 'Allowed'}
        </em>
      </section>

      <ScoreCard
        productiveMinutes={productiveMinutes}
        dailyGoalMinutes={settings.dailyGoalMinutes}
      />

      <section className="card focus-card">
        <div>
          <h2>Focus session</h2>
          <p>
            {settings.focusModeEnabled
              ? `${focusRemainingMinutes} minutes remaining`
              : 'Start a distraction-free block'}
          </p>
        </div>

        <div className="focus-actions">
          <input
            type="number"
            min="5"
            max="180"
            value={focusMinutes}
            onChange={(event) => setFocusMinutes(Number(event.target.value))}
          />

          <button type="button" onClick={toggleFocusMode}>
            {settings.focusModeEnabled ? 'Stop' : 'Start'}
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Blocked domains</h2>

        <div className="add-domain">
          <input
            value={newDomain}
            onChange={(event) => setNewDomain(event.target.value)}
            placeholder="youtube.com"
          />

          <button type="button" onClick={addDomain}>
            Add
          </button>
        </div>

        <div className="domain-list">
          {settings.blockedDomains.map((domain) => (
            <div key={domain} className="domain-chip">
              <span>{domain}</span>

              <button type="button" onClick={() => removeDomain(domain)}>
                ×
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Top domains today</h2>

          <button type="button" className="ghost" onClick={clearStats}>
            Reset
          </button>
        </div>

        <div className="stats-list">
          {sortedStats.length === 0 && (
            <p className="muted">No activity tracked yet.</p>
          )}

          {sortedStats.map(([domain, seconds]) => (
            <div key={domain} className="stat-row">
              <span>{domain}</span>
              <strong>{formatMinutes(seconds)}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>,
);