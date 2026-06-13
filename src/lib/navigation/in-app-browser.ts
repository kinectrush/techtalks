/** Detect embedded in-app browsers (Facebook, Zalo, Instagram, …). */
export function isInAppBrowser(userAgent = ''): boolean {
  const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');

  return (
    /FBAN|FBAV|FB_IAB|FBIOS|FBSS/i.test(ua) ||
    /Instagram/i.test(ua) ||
    /Zalo/i.test(ua) ||
    /Line\//i.test(ua) ||
    /musical_ly|TikTok/i.test(ua) ||
    /Twitter/i.test(ua) ||
    /LinkedInApp/i.test(ua) ||
    (/Android/i.test(ua) && /; wv\)/i.test(ua))
  );
}
