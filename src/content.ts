import { domainMatches, getDomain } from './lib/domain';
import { getStorage } from './lib/storage';

function createOverlay(domain: string): void {
  if (document.getElementById('focus-guard-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'focus-guard-overlay';
  overlay.innerHTML = `
    <div class="focus-guard-card">
      <div class="focus-guard-badge">Focus Guard</div>
      <h1>Blocked during focus mode</h1>
      <p>${domain} is on your distraction list. Take a breath, go back to your priority task and check this later.</p>
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
      background: rgba(2, 6, 23, 0.96);
      color: #e5e7eb;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .focus-guard-card {
      width: min(560px, 100%);
      padding: 34px;
      border-radius: 28px;
      background: linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.9));
      border: 1px solid rgba(45, 212, 191, 0.28);
      box-shadow: 0 30px 90px rgba(0,0,0,.45);
      text-align: center;
    }
    .focus-guard-badge {
      display: inline-flex;
      padding: 8px 14px;
      border-radius: 999px;
      color: #99f6e4;
      background: rgba(20, 184, 166, .12);
      border: 1px solid rgba(45, 212, 191, .32);
      font-weight: 700;
    }
    .focus-guard-card h1 {
      margin: 20px 0 10px;
      font-size: 2rem;
      letter-spacing: -.04em;
    }
    .focus-guard-card p {
      color: #cbd5e1;
      line-height: 1.6;
    }
    #focus-guard-close {
      margin-top: 18px;
      border: 0;
      border-radius: 14px;
      padding: 12px 16px;
      font: inherit;
      font-weight: 800;
      color: #022c22;
      background: #2dd4bf;
      cursor: pointer;
    }
  `;

  document.documentElement.appendChild(style);
  document.body.appendChild(overlay);

  document.getElementById('focus-guard-close')?.addEventListener('click', () => {
    overlay.remove();
    style.remove();
  });
}

async function runGuard(): Promise<void> {
  const domain = getDomain(window.location.href);
  if (!domain) return;

  const { settings } = await getStorage();
  const focusStillActive = settings.focusModeEnabled && (!settings.focusEndsAt || Date.now() < settings.focusEndsAt);

  if (!focusStillActive) return;

  const blocked = settings.blockedDomains.some((blockedDomain) => domainMatches(domain, blockedDomain));

  if (blocked) {
    createOverlay(domain);
  }
}

void runGuard();
