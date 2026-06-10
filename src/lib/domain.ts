export function getDomain(url?: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function domainMatches(domain: string, blockedDomain: string): boolean {
  const cleanDomain = domain.replace(/^www\./, '').toLowerCase();
  const cleanBlocked = blockedDomain.replace(/^www\./, '').toLowerCase();

  return cleanDomain === cleanBlocked || cleanDomain.endsWith(`.${cleanBlocked}`);
}

export function formatMinutes(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}
