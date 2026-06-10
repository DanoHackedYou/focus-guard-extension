type GuardSettings = {
  blockedDomains: string[];
  focusModeEnabled: boolean;
  focusEndsAt: number | null;
  dailyGoalMinutes: number;
};

const DEFAULT_SETTINGS: GuardSettings = {
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

function normalizeDomain(hostname: string): string {
  return hostname.replace(/^www\./, '').toLowerCase();
}

function domainMatches(currentDomain: string, blockedDomain: string): boolean {
  const cleanCurrent = normalizeDomain(currentDomain);
  const cleanBlocked = normalizeDomain(blockedDomain);

  return (
    cleanCurrent === cleanBlocked ||
    cleanCurrent.endsWith(`.${cleanBlocked}`)
  );
}

async function getSettings(): Promise<GuardSettings> {
  const data = await chrome.storage.local.get(['settings']);

  return {
    ...DEFAULT_SETTINGS,
    ...((data.settings ?? {}) as Partial<GuardSettings>),
  };
}

function injectOverlay(domain: string): void {
  if (document.getElementById('focus-guard-overlay')) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'focus-guard-overlay';

  overlay.innerHTML = `
    <div class="focus-guard-card">
      <div class="focus-guard-badge">Focus Guard</div>
      <h1>Blocked during focus mode</h1>
      <p><strong>${domain}</strong> is on your distraction list. Take a breath, go back to your priority task and check this later.</p>
      <button id="focus-guard-close">Continue for now</button>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #focus-guard-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: grid;
      place-items: center;
      padding: 24px;
      background:
        radial-gradient(circle at top left, rgba(20, 184, 166, 0.22), transparent 34%),
        rgba(2, 6, 23, 0.96);
      color: #e5e7eb;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .focus-guard-card {
      max-width: 520px;
      padding: 32px;
      border-radius: 28px;
      text-align: center;
      background: rgba(15, 23, 42, 0.96);
      border: 1px solid rgba(45, 212, 191, 0.35);
      box-shadow: 0 30px 120px rgba(0, 0, 0, 0.45);
    }

    .focus-guard-badge {
      display: inline-flex;
      margin-bottom: 18px;
      padding: 8px 14px;
      border-radius: 999px;
      color: #99f6e4;
      background: rgba(20, 184, 166, 0.12);
      border: 1px solid rgba(45, 212, 191, 0.28);
      font-size: 0.85rem;
      font-weight: 800;
    }

    .focus-guard-card h1 {
      margin: 0 0 12px;
      font-size: 2rem;
      line-height: 1.1;
    }

    .focus-guard-card p {
      margin: 0 0 24px;
      color: #cbd5e1;
      line-height: 1.6;
    }

    .focus-guard-card button {
      border: 0;
      border-radius: 14px;
      padding: 14px 18px;
      cursor: pointer;
      font: inherit;
      font-weight: 800;
      color: #022c22;
      background: #2dd4bf;
    }
  `;

  document.documentElement.appendChild(style);
  document.documentElement.appendChild(overlay);

  document
    .getElementById('focus-guard-close')
    ?.addEventListener('click', () => {
      overlay.remove();
      style.remove();
    });
}

async function runFocusGuard(): Promise<void> {
  const settings = await getSettings();
  const currentDomain = normalizeDomain(window.location.hostname);

  const focusExpired =
    settings.focusEndsAt !== null && settings.focusEndsAt <= Date.now();

  const focusActive = settings.focusModeEnabled && !focusExpired;

  const isBlocked = settings.blockedDomains.some((blockedDomain) =>
    domainMatches(currentDomain, blockedDomain),
  );

  if (focusActive && isBlocked) {
    injectOverlay(currentDomain);
  }
}

void runFocusGuard();