/**
 * Programmatic external navigation (banner dismiss, dialogs, auto-open on desktop).
 * Prefer a real `<a target="_blank">` click in Facebook/Zalo in-app browsers — see
 * `triggerAnchorNavigation`.
 */
export function openExternalLink(url: string): boolean {
  if (!url?.trim() || typeof window === 'undefined') return false;

  try {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    return win !== null;
  } catch {
    return false;
  }
}

/** Simulate a user tap on an anchor — keeps the article webview and avoids iframe app prompts. */
export function triggerAnchorNavigation(anchor: HTMLAnchorElement | null): boolean {
  if (!anchor?.href || typeof window === 'undefined') return false;

  try {
    anchor.click();
    return true;
  } catch {
    return false;
  }
}
